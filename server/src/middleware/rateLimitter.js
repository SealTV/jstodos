'use strict';

import dotenv from 'dotenv'
dotenv.config();

import redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';


const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.RESIS_PORT,
    enable_offline_queue: false,
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

export function rateLimiterMiddleware(req, res, next) {
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};
