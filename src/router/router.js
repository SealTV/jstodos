'use strict';

import dotenv from 'dotenv'
dotenv.config();

import { Router } from 'express';
import { TodosRepo, TokensRepo } from '../repository/repo.js';
import { UserApp } from '../app/user.js';
import { UserRouter } from './user_router.js'
import { TodosRouter } from './todos_router.js'

export class Server {
    /**
     * 
     * @param {TodosRepo} todosRepo 
     * @param {UserApp} userApp
     * @param {TokensRepo} tokensRepo
     */
    constructor(todosRepo, userApp, tokensRepo) {
        this.user = new UserRouter(userApp, tokensRepo);
        this.todos = new TodosRouter(todosRepo);
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

        r.use('/user', this.user.getRouter());

        r.use(this.user.getAuthMiddleware());
        r.use('/todos', this.todos.getRouter());

        return r;
    }
}