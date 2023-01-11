const http = require('http');
const express  = require ('express');
const cors = require ('cors');

const hostname = '127.0.0.1';
const port = 3000;
const { MongoClient } = require("mongodb");

const url = `mongodb://root:1234@localhost:27017/todos`;

const client = new MongoClient(url);

async function run() {
    console.log("hello");
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

let count = 1;

const app = express();
app.use(cors())

app.get('/', (req, res) => {
    res.jsonp({changed: count});
});

app.use('/app', express.static(__dirname + '/ui/dist'));

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const background = function() {
    // console.log("background execute");
    setTimeout(background, 5000);
    count++;
}

background();