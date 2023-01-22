'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import compression from 'compression';
import rid from 'connect-rid';
import morgan from 'morgan';
import timeout from 'connect-timeout';
import {rateLimiterMiddleware} from './middleware/rateLimitter.js';
import {auth} from './middleware/jwt.js';

import { MongoClient } from "mongodb";

import { Server } from "./router/router.js";
import { TodosRepo, UserRepo } from "./repository/repo.js";
import { UserApp } from './app/user.js';


const mongoClient = get_db_connection();
const tRepo = new TodosRepo(mongoClient.db('todos'));
const uRepo = new UserRepo(mongoClient.db('users'));

const server = setup_http_server(tRepo, new UserApp(uRepo));

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
 * @returns {Server}
 */
function setup_http_server(todosRepo, userApp) {
    const hostname = '127.0.0.1';
    const port = 3000;

    let app = express();
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    app.use(timeout('5s'));
    app.use(cors());
    app.use(compression());
    // app.use(rateLimiterMiddleware);
    app.use(json()); // for parsing application/json
    app.use(urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(rid({haederName: 'requestID'}));
    app.use(auth);

    const srv = new Server(todosRepo, userApp);
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

                process.exit(0);
            })
            .catch(err => {
                console.log(`error on close MongoDB connection: ${JSON.stringify(err)}`);
            });
    });
}

function get_db_connection() {

    const url = `mongodb://root:1234@localhost:27017/todos`;
    const mongoClient = new MongoClient(url);
    return mongoClient;
}