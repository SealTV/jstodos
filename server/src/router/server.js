'use strict';

const express = require('express');
const { TodosRepo } = require('./../repository/todosrepo.js');

exports.Server = class {
    /**
     * 
     * @param {TodosRepo} todosRepo 
     */
    constructor(todosRepo) {
        this.repo = todosRepo;
    }

    /**
     * 
     * @returns {express.Router}
     */
    getRouter() {
        let r = express.Router();

        r.get('/', (req, res) => {
            this.repo.getTodos()
                .then(result => {
                    res.status(200).jsonp({ data: result });
                });
        });

        r.post('/', (req, res) => {
            this.repo.addTodo(req.body)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        r.put('/:todoID', (req, res) => {
            console.log(req.params);
            res.status(500).json({ error: "not implemented" });
        });

        r.delete('/:todoID', (req, res) => {
            console.log(req.params);
            res.status(500).json({ error: "not implemented" });
        });

        return r
    }
}



