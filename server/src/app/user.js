'use strict';

import crypto from 'crypto';

import { UserRepo } from './../repository/repo.js';

export class UserApp {
    /**
    * @param {UserRepo} user - Users data repository
    */
    constructor(user) {
        this.userRepo = user;
    }

    async register(login, password) {
        let user = {
            id: crypto.randomUUID(),
            login: login,
            password: await hash(password),
            created_at: Date(),
        }

        return await this.userRepo.saveUser(user);
    }

    async login(login, password) {
        const user = await this.userRepo.getUserByLogin(login);
        if (!user) {
            throw new Error("User not found");
        }

        if (!await verify(password, user.password)) {
            throw new Error("Invalid password");
        }

        return user;
    }

    async findUserByID(userID) {
        const user = await this.userRepo.getUserByID(userID);
        if (!user) {
            throw new Error("User not found");
        }
        
        return user;
    }
}

async function hash(password) {
    return new Promise((resolve, reject) => {
        // generate random 16 bytes long salt
        const salt = crypto.randomBytes(32).toString("hex")

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            resolve(salt + ":" + derivedKey.toString('hex'));
        });
    });
}

async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":")
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            resolve(key == derivedKey.toString('hex'));
        });
    });
}