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

        router.get('/', async (req, res) => await this.getTodos(req, res));
        router.post('/', async (req, res) => await this.addTodo(req, res));
        router.put('/:todoID', async (req, res) => await this.updateTodo(req, res));
        router.delete('/:todoID', async (req, res) => await this.deleteTodo(req, res));

        return router;
    }

    /**
     * @openapi
     * 
     * /todos:
     *  get:
     *      produces:
     *          - application/json
     *      parameters:
     *          - name: JWT Token
     *            in: header
     *            tpye: string
     * @param {*} req 
     * @param {*} res 
     */
    async getTodos(req, res) {
        try {
            let result = await this.repo.getTodos(req.userID);
            res.status(200).jsonp({ data: result });
        } catch (error) {
            res.status(500).jsonp({ error: err });
        }
    }

    async addTodo(req, res) {
        let newTodo = req.body;
        newTodo.created_at = Date.now();
        newTodo.done = false;

        try {
            let result = await this.repo.addTodo(req.userID, newTodo);
            res.status(202).jsonp({ data: result });
        } catch (err) {
            res.status(500).jsonp({ error: err });
        }
    }

    async updateTodo(req, res) {
        const todoID = req.params.todoID;
        let todo = req.body;
        todo.updated_at = Date.now();

        try {
            let result = await this.repo.updateTodo(req.userID, todoID, todo);
            res.status(202).jsonp({ data: result });
        } catch (err) {
            res.status(500).jsonp({ error: err });
        }
    }

    async deleteTodo(req, res) {
        const todoID = req.params.todoID;

        try {
            let result = await this.repo.deleteTodo(req.userID, todoID);
            res.status(202).jsonp({ data: result });
        } catch (err) {
            res.status(500).jsonp({ error: err });
        }
    }
}



