'use strict';

import crypto from 'crypto';

export function getTokenGenerator(secret, duration = 3600) {
    return function (claims) {
        let header = Buffer.from(JSON.stringify({
            alg: "HS256",
            typ: "jwt",
            ctp: "jwt",
        })).toString('base64').replace(/={1,2}$/, '');

        const now = Math.floor(Date.now() / 1000);


        let data = {
            iss: "jstodos.site",
            sub: "auth",
            aud: ["service client"],
            exp: now + duration,
            nbf: now,
            iat: now,
        };

        for (let key in claims) {
            data[key] = claims[key];
        }

        let payload = Buffer.from(JSON.stringify(data)).toString('base64').replace(/={1,2}$/, '');

        let signature = crypto
            .createHmac('sha256', secret)
            .update(`${header}.${payload}`)
            .digest()
            .toString('base64').replace(/={1,2}$/, '');

        return `${header}.${payload}.${signature}`;
    }
}


export function auth(secret, validationFunc) {
    return function (req, res, next) {
        if (!req.headers.authorization) {
            res.status(401).jsonp({
                error: "required Authorization header",
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

        try {
            const claims = validateTokenAndGetClaims(secret, token);
            req.claims = claims;

            let err = validationFunc(req, res, claims);
            if (err) {
                throw err;
            }
        } catch (err) {
            res.status(401).jsonp({
                error: err
            });

            return;
        }

        next();
    }
}

export function validateTokenAndGetClaims(secret, token) {
    let tokenParts = token.split('.');
    if (tokenParts.length != 3) {
        throw new Error("invalid token format");
    }

    let [header, body, signature] = tokenParts;
    let currentSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest()
        .toString('base64').replace(/={1,2}$/, '')
    if (currentSignature !== signature) {
        throw new Error("invalid token signature");
    }

    let claims = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));

    let err = validateTokenClaims(claims);
    if (err) {
        throw err;
    }

    return claims;
}

function validateTokenClaims(claims) {
    const now = Math.floor(Date.now() / 1000);

    if (now > claims.exp) {
        return "token expired";
    }

    if (now < claims.iat) {
        return "invalid time of token issue";

    }

    if (now < claims.nbf) {
        return "token is not active";
    }

    return null;
}