'use strict';

import { Db } from "mongodb";

/**
 * 
 */
export class UserRepo {
    /**
     * @param {Db} Db - MongoDB database
     */
    constructor(db) {
        this.database = db;
        this.users = this.database.collection('users');

    }

    async migrateCollection() {
        console.log(`Check and create "users" collection indexes`);
        let exists = await this.users.indexExists('unique_user_login');
        if (!exists) {
            console.log(`Create unique index for "users" collection`);
            await this.users.createIndex(
                { login: 1 },
                {
                    name: 'unique_user_login',
                    unique: true,
                }
            );
        }
    }

    async saveUser(user) {
        const result = await this.users.insertOne(user);
        return result;
    }

    async getUserByID(userID) {
        const query = { id: userID };
        const result = await this.users.findOne(query);
        return result;
    }

    async getUserByLogin(login) {
        const query = { login: login };
        const result = await this.users.findOne(query);
        return result;
    }

}