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

    async getTodos(userID) {
        const query = {
            userID: userID,
        };
        const cursor = await this.todos.find(query);

        return await cursor.toArray();
    }

    async addTodo(userID, doc) {
        doc.userID = userID;
        const result = await this.todos.insertOne(doc);
        return result;
    }

    async updateTodo(userID, docID, doc) {
        if (!ObjectId.isValid(id)) {
            return;
        }

        const objectID = ObjectId(docID);
        const filter = {
            _id: objectID,
            userID: userID
        };

        const options = { upsert: true };

        const updateDoc = {
            $set: doc
        }

        const result = await this.todos.updateOne(filter, updateDoc, options);
        return result;
    }


    async deleteTodo(userID, docID) {
        if (!ObjectId.isValid(id)) {
            throw "invalid todo id";
        }

        const objectID = ObjectId(docID);
        const query = {
            _id: objectID,
            userID: userID,
        };

        const result = await this.todos.deleteOne(query);
        return result;
    }
}