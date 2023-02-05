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
        this.repo = todosRepo;
        this.userApp = userApp;
        this.tokensRepo = tokensRepo;
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

        const user = new UserRouter(this.userApp, this.tokensRepo);
        r.use('/user', user.getRouter());

        r.use(user.getAuthMiddleware());

        const todos = new TodosRouter(this.repo);
        r.use('/todos', todos.getRouter());

        return r;
    }
}