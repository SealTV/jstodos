'use strict';

import redis from 'redis';

/**
 * 
 */
export class TokensRepo {
    /**
     * @param {redis} redis - Redis connection
     */
    constructor(redis) {
        this.r = redis;
    }

    async storeToken(token, timeout) {
        await this.r.set(token, 1, {
            EX: timeout,
            NX: true,
        });
    }

    async checkTokenExist(token) {
        const val = await this.r.get(token);
        return val;
    }

    async deleteToken(token) {
        await this.r.del(token);
    }
}