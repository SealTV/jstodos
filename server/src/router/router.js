'use strict';

import { Router } from 'express';
import { TodosRepo } from '../repository/repo.js';
import { UserApp } from '../app/user.js';

import * as jwt from './jwt.js';

export class Server {
    /**
     * 
     * @param {TodosRepo} todosRepo 
     * @param {UserApp} userApp
     */
    constructor(todosRepo, userApp) {
        this.repo = todosRepo;
        this.userApp = userApp;
        jwt.generateToken(123, 'hellol');
    }

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        const r = Router();
        
        r.use('/api/v1/user', this.user());
        r.use('/api/v1/todos', this.todos());

        return r;
    }

    /**
     * @returns {Router}
     * @author @SealTV
     */
    user() {
        let router = Router();

        // router.route("/user")
        router.post('/signup', (req, res) => {
            res.status(500).jsonp({ error: 'not implemented' });
        });
        
        router.post('/login', (req, res) => {
            res.status(500).jsonp({ error: 'not implemented' });
        });

        router.post('/refresh', (req, res) => {
            res.status(500).jsonp({ error: 'not implemented' });
        });

        return router;
    }

    /**
     * @returns {Router}
     * @author @SealTV
     */
    todos() {
        let router = Router();

        router.get('/', (req, res) => {
            this.repo.getTodos()
                .then(result => {
                    res.status(200).jsonp({ data: result });
                });
        });

        router.post('/', (req, res) => {
            let newTodo = req.body;
            newTodo.created_at = Date.now();
            newTodo.done = false;

            this.repo.addTodo(newTodo)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        router.put('/:todoID', (req, res) => {
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

        router.delete('/:todoID', (req, res) => {
            const todoID = req.params.todoID;

            this.repo.deleteTodo(todoID)
                .then(result => {
                    res.status(202).jsonp({ data: result });
                })
                .catch(err => {
                    res.status(500).jsonp({ error: err });
                });
        });

        return router;
    }
}



