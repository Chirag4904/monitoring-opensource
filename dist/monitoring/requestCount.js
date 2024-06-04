"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDuration = exports.activeCounter = exports.requestCount = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const requestCounter = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of http requests',
    labelNames: ['method', 'route', 'status_code'] //these are the dimensions
});
const activeUserGauge = new prom_client_1.default.Gauge({
    name: "active_users",
    help: "Number of active users",
    labelNames: ["method", "route"]
});
const RequestDurationMillisecondsHistogram = new prom_client_1.default.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 25, 50, 100, 500, 1000, 5000]
});
const requestCount = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime}ms`);
        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
    });
    next();
};
exports.requestCount = requestCount;
const activeCounter = (req, res, next) => {
    activeUserGauge.inc({
        method: req.method,
        route: req.route ? req.route.path : req.path
    });
    res.on('finish', () => {
        setTimeout(() => {
            activeUserGauge.dec({
                method: req.method,
                route: req.route ? req.route.path : req.path
            });
        }, 10000);
    });
    next();
};
exports.activeCounter = activeCounter;
const requestDuration = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        RequestDurationMillisecondsHistogram.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        }, duration);
    });
    next();
};
exports.requestDuration = requestDuration;
