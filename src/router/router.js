'use strict';

import dotenv from 'dotenv'
dotenv.config();

import { Router } from 'express';
import { TodosRepo, TokensRepo } from '../repository/repo.js';
import { UserApp } from '../app/user.js';

import * as jwt from '../middleware/jwt.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const refreshTokenLifeTime = 3600 * 24 * 7;

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

    claimsVerify(claims) {
        //TODO: Add claim validation
        return null;
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

        r.use(jwt.auth(accessTokenSecret, this.claimsVerify));
        r.use('/todos', this.todos());

        return r;
    }

    /**
     * @returns {Router}
     * @author @SealTV
     */
    user() {
        let router = Router();

        // access token is active 1 hour
        const generateAccessToken = jwt.getTokenGenerator(accessTokenSecret);

        // refresh token is active 7 days
        const generateRefreshToken = jwt.getTokenGenerator(refreshTokenSecret, refreshTokenLifeTime);

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
                    console.error(`error on try register user: ${err}`);
                    res.status(500).jsonp({ err: err });
                })
        });

        router.post('/login', async (req, res) => {
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

            try {
                const result = await this.userApp.login(login, password);

                const accessToken = generateAccessToken({
                    userID: result.id,
                    login: result.login,
                    aud: ["login"],
                });

                const refreshToken = generateRefreshToken({
                    userID: result.id,
                    aud: ["refresh_token"],
                });

                await this.tokensRepo.storeToken(refreshToken, refreshTokenLifeTime);


                res.status(200).jsonp({
                    ok: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    }
                });
            } catch (err) {
                console.error(`error on try login user: ${err}`);
                switch (err.message) {
                    case "User not found":
                        res.status(404).jsonp({ error: "User not found" });
                        break;
                    case "Invalid password":
                        res.status(404).jsonp({ error: "Invalid password" });
                        break;
                    default:
                        res.status(500).jsonp({ error: err });
                        break;
                }
            }
        });

        router.post('/refresh', async (req, res) => {
            const refreshToken = req.body.refreshToken;
            if (!refreshToken) {
                res.status(400).jsonp({ error: "empty refresh token" });
                return;
            }

            let claims = null

            try {
                claims = jwt.validateTokenAndGetClaims(refreshTokenSecret, refreshToken, () => { return null; });
                if (!claims || !claims.userID) {
                    res.status(400).jsonp({ error: "user id not found in refresh token" });
                    return;
                }
            } catch (err) {
                console.error(`error on validate refresh token: ${JSON.stringify(err)}`);
                res.status(401).jsonp({
                    error: err
                });

                return;
            }

            try {
                const ok = await this.tokensRepo.checkTokenExist(refreshToken);
                if (!ok) {
                    res.status(401).jsonp({
                        error: "refresh token invalid",
                    });
                    return;
                }

                await this.tokensRepo.deleteToken(refreshToken, refreshTokenLifeTime);

            } catch (err) {
                console.error(`error on check if refresh token exist: ${JSON.stringify(err, 2)}`);
                res.status(500).jsonp({
                    error: `Internal server error`,
                });
            }

            try {
                const result = this.userApp.findUserByID(claims.userID);

                const accessToken = generateAccessToken({
                    userID: result.id,
                    login: result.login,
                    aud: ["login"],
                });

                const newRefreshToken = generateRefreshToken({
                    userID: result.id,
                    aud: ["refresh_token"],
                });

                await this.tokensRepo.storeToken(newRefreshToken, refreshTokenLifeTime);

                res.status(200).jsonp({
                    ok: {
                        accessToken: accessToken,
                        refreshToken: newRefreshToken,
                    }
                });
            } catch (err) {
                console.error(`error on try login user: ${err}`);
                switch (err.message) {
                    case "User not found":
                        res.status(404).jsonp({ error: "User not found" });
                        break;
                    default:
                        res.status(500).jsonp({ error: err });
                        break;
                }
            }
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



