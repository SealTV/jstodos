'use strict';

import crypto from 'crypto';

export function getTokenGenerator(secret) {
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
            exp: now + 3600,
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
                error: "invalid token signature",
            });
            return;
        }

        let claims = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));

        let err = validateTokenClaims(validationFunc, claims);
        if (err) {
            res.status(401).jsonp({
                error: err,
            });
            return;
        }

        next();
    }
}

function validateTokenClaims(validationFunc, claims) {
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


    let err = validationFunc(claims);
    if (err) {
        return err;
    }

    return null;
}