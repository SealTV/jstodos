const express = require('express');

var r = express.Router();

r.get('/', (req, res) => {
    res.status(200).jsonp({ data: "hello world"});
});

r.post('/', (req, res) => {
    res.status(500).json({error: "not implemented"});
});

r.put('/:todoID', (req, res) => {
    console.log(req.params);
    res.status(500).json({error: "not implemented"});
});

r.delete('/:todoID', (req, res) => {
    console.log(req.params);
    res.status(500).json({error: "not implemented"});
});

module.exports = r;
