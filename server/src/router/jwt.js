'use strict';

import dotenv from 'dotenv'
dotenv.config();

const secret = process.env.SECRET_KEY;

export function generateToken(userID, username) {
    console.log(`JWT secret key: ${secret.slice(0, 5)}`);
}

export function verify(token) {
    throw Error('not implemented');
}