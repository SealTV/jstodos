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
        this.userColl = this.database.collection('users');
    }

    async saveUser(user) {
        const result = await this.userColl.insertOne(user);
        return result;
    }

    async getUserByLogin(user) {
        throw Error('not implemented');
    }
}