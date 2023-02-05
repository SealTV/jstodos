'use strict';

import dotenv from 'dotenv'
dotenv.config();

import { Router } from 'express';
import { TokensRepo } from '../repository/repo.js';
import { UserApp } from '../app/user.js';

import * as jwt from '../middleware/jwt.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const refreshTokenLifeTime = 3600 * 24 * 7;

export class UserRouter {
    /**
     * 
     * @param {UserApp} userApp
     * @param {TokensRepo} tokensRepo
     */
    constructor(userApp, tokensRepo) {
        this.userApp = userApp;

        this.tokensRepo = tokensRepo;

        // access token is active 1 hour
        this.generateAccessToken = jwt.getTokenGenerator(accessTokenSecret);
        // refresh token is active 7 days
        this.generateRefreshToken = jwt.getTokenGenerator(refreshTokenSecret, refreshTokenLifeTime);

    }

    verifyClaims(claims) {
        //TODO: Add claim validation
        return null;
    }

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        const router = Router();

        router.post('/signup', this.signup);
        router.post('/login', this.login);
        router.post('/refresh', this.refreshToken);

        return router;
    }

    getAuthMiddleware() {
        return jwt.auth(this.accessTokenSecret, this.verifyClaims);
    }

    /**
     * @returns {Router}
     * @author @SealTV
     */
    user() {
        let router = Router();

        router.post('/signup', this.signup);

        router.post('/login', this.login);

        router.post('/refresh', this.refreshToken);

        return router;
    }

    signup(req, res) {
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
            });
    }

    async login(req, res) {
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

            const accessToken = this.generateAccessToken({
                userID: result.id,
                login: result.login,
                aud: ["login"],
            });

            const refreshToken = this.generateRefreshToken({
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
    }

    async refreshToken(req, res) {
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

            const accessToken = this.generateAccessToken({
                userID: result.id,
                login: result.login,
                aud: ["login"],
            });

            const newRefreshToken = this.generateRefreshToken({
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
    }
}