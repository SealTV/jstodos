'use strict';

import dotenv from 'dotenv'
dotenv.config();

import crypto from 'crypto';

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

    return `${header}.${body}.${signature}`;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export function auth(req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).jsonp({
            error: "required Authorization hreader",
        });

        return;
    }

    let [bearer, token] = req.headers.authorization?.split(' ');
    if (bearer !== 'Bearer' || !token) {
        res.status(401).jsonp({
            error: "invalid header value"
        });

        return;
    }

    let tokenParts = token.split('.');
    if (tokenParts.length != 3) {
        res.status(401).jsonp({
            error: "invalid tokent format"
        });

        return;
    }
    
    let [header, body, signature] = tokenParts;
    let currentSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest()
        .toString('base64').replace(/={1,2}$/, '')
    if (currentSignature !== signature) {
        res.status(401).jsonp({
            error: "invalid token singature",
        });
        return;
    }

    let claims = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));

    if (!validateTokenClaims(req, res, claims)) { 
       return;
    }

    next();
}

function validateTokenClaims(req, res, claims) {
    return true;
}

export function verify(token) {
    throw Error('not implemented');
}