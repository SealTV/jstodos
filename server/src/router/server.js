'use strict';

import { Router } from 'express';
import { TodosRepo } from './../repository/todosrepo.js';

export class Server {
    /**
     * 
     * @param {TodosRepo} todosRepo 
     */
    constructor(todosRepo) {
        this.repo = todosRepo;
    }

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        let r = Router();

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



