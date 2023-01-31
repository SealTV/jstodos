'use strict';

import redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

/**
 * 
 * @param {redis} redisClient 
 */
export function newRateLimmiterMiddleware(redisClient) {
    const rateLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'middleware',
        points: 10, // 10 requests
        duration: 1, // per 1 second by IP
    });

    return function (req, res, next) {
        console.log(`req.ip ${req.ip}`);
        rateLimiter.consume(req.ip, 2)
            .then(() => {
                next();
            })
            .catch(() => {
                res.status(429).send('Too Many Requests');
            });
    }
}
