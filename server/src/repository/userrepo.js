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
        throw Error('not implemented');
    }

    async getUserByLogin(user) {
        throw Error('not implemented');
    }
}