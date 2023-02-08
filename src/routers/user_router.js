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

    /**
     * 
     * @returns {Router}
     */
    getRouter() {
        const router = Router();

        router.post('/signup', (req, res) => this.signupHandler(req, res));
        router.post('/login', async (req, res) => await this.loginHandler(req, res));
        router.post('/refresh', async (req, res) => await this.refreshTokenHandler(req, res));

        return router;
    }

    getAuthMiddleware() {
        return jwt.auth(accessTokenSecret, this.verifyClaims);
    }

    verifyClaims(req, res, claims) {
        if (!claims.userID) {
            return new Error("empty user id in token claims");
        }

        if (!claims.login) {
            return new Error("empty user loging in token claims");
        }

        req.userID = claims.userID;
        req.login = claims.login;

        return null;
    }

    signupHandler(req, res) {
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

    async loginHandler(req, res) {
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

            const refreshToken = this.getRefreshToken(result);
            await this.tokensRepo.storeToken(refreshToken, refreshTokenLifeTime);

            res.status(200).jsonp({
                ok: {
                    accessToken: this.getAccessToken(result),
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

    async refreshTokenHandler(req, res) {
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
            const result = await this.userApp.findUserByID(claims.userID);
            const newRefreshToken = this.getRefreshToken(result);
            await this.tokensRepo.storeToken(newRefreshToken, refreshTokenLifeTime);

            res.status(200).jsonp({
                ok: {
                    accessToken: this.getAccessToken(result),
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

    getAccessToken(user) {
        const accessToken = this.generateAccessToken({
            userID: user.id,
            login: user.login,
            aud: ["login"],
        });

        return accessToken;
    }

    getRefreshToken(user) {
        const refreshToken = this.generateRefreshToken({
            userID: user.id,
            aud: ["refresh_token"],
        });

        return refreshToken;
    }
}