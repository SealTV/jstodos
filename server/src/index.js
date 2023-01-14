'use strict';

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";

import { Server } from "./router/server.js";
import { TodosRepo } from "./repository/todosrepo.js";


const mongoClient = get_db_connection();
const tRepo = new TodosRepo(mongoClient.db('todos'));

const server = setup_http_server(tRepo);

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    close();
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    close();
});


function setup_http_server(todosRepo) {
    const hostname = '127.0.0.1';
    const port = 3000;

    let app = express();
    app.use(cors())
    app.use(json()) // for parsing application/json
    app.use(urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

    const srv = new Server(todosRepo);
    app.use('/v1', srv.getRouter());

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