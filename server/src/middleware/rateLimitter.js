'use strict';

import dotenv from 'dotenv'
dotenv.config();

import redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const redisClient = redis.createClient({
    url: url,
});

redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();
await redisClient.PING();

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

export function rateLimiterMiddleware(req, res, next) {
    console.log(`req.ip ${req.ip}`);
    rateLimiter.consume(req.ip, 2)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};
