'use strict';

const { MongoClient, Db } = require("mongodb");

/**
 * 
 */
exports.TodosRepo = class {
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
        const filter = {_id: id};

        const options = {upsert: true};

        const updateDoc = {
            $set: doc
        }

        const result = await this.todos.updateOne(filter, updateDoc, options);
        return result;
    }


    async deleteTodo(id) {
        const query = {_id: id};

        const result = await this.todos.deleteOne(query);
        return result;
    }
}