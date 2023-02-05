'use strict';

import { Db, MongoClient, ObjectId } from "mongodb";

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