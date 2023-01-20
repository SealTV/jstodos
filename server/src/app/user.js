'use strict';

import { UserRepo } from './../repository/repo.js';

export class UserApp {
    /**
    * @param {UserRepo} user - Users data repository
    */
    constructor(user) {
        this.userRepo = user;
    }

    async register(login, password) {
        throw Error('not implemented');
    }

    async login(login, password) {
        throw Error('not implemented');
    }

    async refresh(refreshToken) {
        throw Error('not implemented');
    }
}