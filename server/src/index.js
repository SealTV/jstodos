'use strict';

const express =  require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");

const { Server } = require("./router/server.js");
const { TodosRepo } = require("./repository/todosrepo.js");

const hostname = '127.0.0.1';
const port = 3000;



const url = `mongodb://root:1234@localhost:27017/todos`;

const client = new MongoClient(url);

const database = client.db('todos');

const tRepo = new TodosRepo(database);


const app = express();
function startServer() {
    const srv = new Server(tRepo);

    app.use(cors())
    app.use(express.json()) // for parsing application/json
    app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
    app.use('/v1', srv.getRouter());

    app.listen(port, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

// async function run() {
//     try {
//         const database = client.db('todos');
//         const movies = database.collection('movies');
//         // Query for a movie that has the title 'Back to the Future'
//         const query = { title: 'Back to the Future' };
//         const movie = await movies.findOne(query);
//         console.log(`movie: ${movie._id}, ${movie.title}`);
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);

let count = 0;
const background = function() {
    // console.log("background execute");
    setTimeout(background, 5000);
    count++;
}

startServer();
background();