'use strict';

import dotenv from 'dotenv'
dotenv.config();

import crypto from 'crypto';
import bodyParser from 'body-parser';

const secret = process.env.SECRET_KEY;

export function generateToken(userID, username) {
    let header = Buffer.from(JSON.stringify({
        alg: "HS256",
        typ: "jwt",
        ctp: "jwt",
    })).toString('base64').replace(/={1,2}$/, '');

    const now = Math.floor(Date.now() / 1000);

    let body = Buffer.from(JSON.stringify({
        iss: "jstods",
        sub: "auth",
        aud: [],
        exp: now + 3600,
        nbf: now,
        iat: now,
        userID: userID,
        username: username,
    })).toString('base64').replace(/={1,2}$/, '');

    let signature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest()
        .toString('base64').replace(/={1,2}$/, '');

    return  `${header}.${body}.${signature}`;
}

export function auth(req, res, next) {
    next();
}

export function verify(token) {
    throw Error('not implemented');
}