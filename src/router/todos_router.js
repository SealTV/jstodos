'use strict';

import dotenv from 'dotenv'
dotenv.config();

import { Router } from 'express';
import { TodosRepo } from '../repository/repo.js';

export class TodosRouter {
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
        let router = Router();

        router.get('/', this.getTodos);
        router.post('/', this.addTodo);
        router.put('/:todoID', this.updateTodo);
        router.delete('/:todoID', this.deleteTodo);

        return router;
    }

    getTodos(req, res) {
        this.repo.getTodos()
            .then(result => {
                res.status(200).jsonp({ data: result });
            });
    }

    addTodo(req, res) {
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
    }

    updateTodo(req, res) {
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
    }

    deleteTodo(req, res) {
        const todoID = req.params.todoID;

        this.repo.deleteTodo(todoID)
            .then(result => {
                res.status(202).jsonp({ data: result });
            })
            .catch(err => {
                res.status(500).jsonp({ error: err });
            });
    }
}



