'use strict';

import { Router } from 'express';
import { TodosRepo } from './../repository/repo.js';
import {UserApp} from './../app/user.js';

export class Server {
    /**
     * 
     * @param {TodosRepo} todosRepo 
     * @param {UserApp} userApp
     */
    constructor(todosRepo, userApp) {
        this.repo = todosRepo;
        this.userApp = userApp;
    }

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        const r = Router();

        r.use('/user', this.user());
        r.use('/todo', this.todoRouter());

        return r;
    }

    user() {
        const r = Router();

        r.post('/signup', (req, res) => {
            res.status(500).jsonp({error: 'not implemented'});
        });

        r.get('/login', (req, res) => {
            res.status(500).jsonp({error: 'not implemented'});
        });


        r.get('/refresh', (req, res) => {
            res.status(500).jsonp({error: 'not implemented'});
        });


        return r;
    }

    todoRouter() {
        let r = Router();

        r.get('/', (req, res) => {
            this.repo.getTodos()
                .then(result => {
                    res.status(200).jsonp({ data: result });
                });
        });

        r.post('/', (req, res) => {
            let newTodo = req.body;
            newTodo.created_at = Date.now();
            newTodo.done = false;

            this.repo.addTodo(letNewTodo)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        r.put('/:todoID', (req, res) => {
            const todoID = req.params.todoID;
            let todo = req.body;
            todo.updated_at = Date.now();

            this.repo.updateTodo(todoID, todo)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        r.delete('/:todoID', (req, res) => {
            const todoID = req.params.todoID;

            this.repo.deleteTodo(todoID)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        return r
    }
}



