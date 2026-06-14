/**
 * Source - stackoverflow.com
 * Modified for ES6 - 2025-12-31
 */

const requestCache = [];
const queues = {};

class QueueUnique {
    constructor(func) {
        this.func = func;
        this.q = Promise.resolve();
    }

    add(req, res, next) {
        // Check if the item is already cached
        if (checkCache(req, res)) return;

        // Add to the sequential promise chain
        this.q = this.q
            .then(() => this.func(req, res, next))
            .catch((err) => console.error('Queue Execution Error:', err));
    }
}

const responseHandler = (req, res, next) => {
    return new Promise((resolve) => {
        // Second check: Did a previous item in the queue just populate the cache?
        if (checkCache(req, res)) {
            return resolve(true);
        }

        // Artificial delay/throttle from original source
        setTimeout(() => {
            const existingCacheIndex = requestCache.findIndex(itm => itm.queueName === req.url);

            // Override res.json to capture the response body for caching
            const originalJson = res.json.bind(res);

            res.json = (body) => {
                // Only cache GET requests
                if (req.method === 'GET') {
                    const cacheData = {
                        cachedData: body,
                        queueName: req.url,
                        runtime: Date.now()
                    };

                    if (existingCacheIndex !== -1) {
                        requestCache[existingCacheIndex] = cacheData;
                    } else {
                        requestCache.push(cacheData);
                    }
                }
                return originalJson(body);
            };

            next();
            resolve(true);
        }, 4000);
    });
};

function checkCache(req, res) {
    const cacheHit = requestCache.find((itm) => itm.queueName === req.url);
    const timeout = req.app.locals.cacheTimeout || 30000;

    if (cacheHit && (Date.now() - cacheHit.runtime < timeout)) {
        res.json(cacheHit.cachedData);
        return true;
    }
    return false;
}

/**
 * ES6 Middleware Export
 */
const sortQueues = (req, res, next) => {
    // const path = req.route.path;

    // if (!queues[path]) {
    //     queues[path] = new QueueUnique(responseHandler);
    // }

    // queues[path].add(req, res, next);
    //Add every calls to the queue
     queues[path] = new QueueUnique(responseHandler);
};

export default sortQueues;
