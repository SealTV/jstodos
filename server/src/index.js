const express =  require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");

const server = require("./router/server.js");

const hostname = '127.0.0.1';
const port = 3000;

const app = express();
app.use(cors())
app.use('/v1', server);

function startServer() {
    app.listen(port, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}


const url = `mongodb://root:1234@localhost:27017/todos`;

const client = new MongoClient(url);

async function run() {
    try {
        const database = client.db('todos');
        const movies = database.collection('movies');
        // Query for a movie that has the title 'Back to the Future'
        const query = { title: 'Back to the Future' };
        const movie = await movies.findOne(query);
        console.log(`movie: ${movie._id}, ${movie.title}`);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

var count = 0;
const background = function() {
    // console.log("background execute");
    setTimeout(background, 5000);
    count++;
}

startServer();

background();