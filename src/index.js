'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import redis from 'redis';

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import compression from 'compression';
import rid from 'connect-rid';
import morgan from 'morgan';
import timeout from 'connect-timeout';
import { newRateLimmiterMiddleware } from './middleware/rateLimitter.js';

import { MongoClient } from "mongodb";

import { Server } from "./routers/router.js";
import { TodosRepo, UserRepo, TokensRepo } from "./repository/repo.js";
import { UserApp } from './app/user.js';


const redisCli = await getRedisConnection();

const mongoClient = getMongoConnection();
const db = mongoClient.db('todos')
const tRepo = new TodosRepo(db);

await tRepo.migrateCollection();

const uRepo = new UserRepo(db);
await uRepo.migrateCollection();

const tokensRepo = new TokensRepo(redisCli);

const server = setup_http_server(tRepo, new UserApp(uRepo), tokensRepo);

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    close();
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    close();
});

/**
 * 
 * @param {TodosRepo} todosRepo 
 * @param {UserApp} userApp 
 * @param {TokensRepo} tokensRepo
 * @returns {Server}
 */
function setup_http_server(todosRepo, userApp, tokensRepo) {
    const hostname = process.env.HOST;
    const port = process.env.PORT;

    let app = express();
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    app.use(timeout('5s'));
    app.use(cors());
    app.use(compression());
    // app.use(newRateLimmiterMiddleware(redisCli));
    app.use(json()); // for parsing application/json
    app.use(urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(rid({ haederName: 'requestID' }));

    const srv = new Server(todosRepo, userApp, tokensRepo);
    app.use('/', srv.getRouter());

    let server = app.listen(port, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });

    return server;
}

function close() {
    console.log('Closing http server.');

    server.close(() => {
        console.log('Http server closed.');

        mongoClient.close()
            .then(() => {
                console.log(`close MongoDB connection successfully`);

                redisCli.quit()
                    .then(() => {
                        console.log(`close Redis connection successfully`);

                        process.exit(0);
                    })
                    .catch(err => {
                        console.log(`error on close Redis connection: ${JSON.stringify(err)}`);
                    })
            })
            .catch(err => {
                console.log(`error on close MongoDB connection: ${JSON.stringify(err)}`);
            });
    });
}

function getMongoConnection() {
    const usernamePass = `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`;
    const dbHost = `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;
    const url = `mongodb://${usernamePass}@${dbHost}/${process.env.MONGO_DB_NAME}`;

    const mongoClient = new MongoClient(url);
    return mongoClient;
}

async function getRedisConnection() {
    const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const redisClient = redis.createClient({
        url: url,
    });

    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    await redisClient.PING();

    return redisClient;
}