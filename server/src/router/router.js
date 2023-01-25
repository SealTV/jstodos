'use strict';

import { Router } from 'express';
import { TodosRepo } from '../repository/repo.js';
import { UserApp } from '../app/user.js';

import * as jwt from '../middleware/jwt.js';

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

    claimsVerify(claims) {
        if (!claims.isAdmin) {
            return "user is not admin"
        }
    }

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        const r = Router();

        r.use('/api/v1/', this.v1());

        return r;
    }

    v1() {
        const r = Router();

        r.use('/user', this.user());

        r.use(jwt.auth(this.claimsVerify));
        r.use('/todos', this.todos());

        return r;
    }

    /**
     * @returns {Router}
     * @author @SealTV
     */
    user() {
        let router = Router();

        router.post('/signup', (req, res) => {
            const login = req.body.login;
            if (!login) {
                res.status(400).jsonp({ error: "empty login" });
                return;
            }

            const password = req.body.password;
            if (!password) {
                res.status(400).jsonp({ error: "empty password" });
                return;
            }

            this.userApp.register(login, password)
                .then(result => {
                    res.sendStatus(201);
                })
                .catch(err => {
                    res.status(500).jsonp({ err: err });
                })
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



