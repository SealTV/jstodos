'use strict';

import { Db, MongoClient, ObjectId } from "mongodb";

/**
 * 
 */
export class TodosRepo {
    /**
     * @param {Db} Db - MongoDB database
     */
    constructor(db) {
        this.database = db;
        this.todos = this.database.collection('todos');
    }

    async getTodos() {
        const query = {};
        const cursor = await this.todos.find(query);

        return await cursor.toArray();
    }

    async addTodo(doc) {
        const result = await this.todos.insertOne(doc);
        return result;
    }

    async updateTodo(id, doc) {
        if (!ObjectId.isValid(id)) {
            return;
        }

        const objectID = ObjectId(id);
        const filter = { _id: objectID };
        const options = { upsert: true };

        const updateDoc = {
            $set: doc
        }

        const result = await this.todos.updateOne(filter, updateDoc, options);
        return result;
    }


    async deleteTodo(id) {
        if (!ObjectId.isValid(id)) {
            throw "invalid todo id";
        }

        const objectID = ObjectId(id);
        const query = { _id: objectID };

        const result = await this.todos.deleteOne(query);
        return result;
    }
}