import { Request,Response,NextFunction } from "express";
import client from 'prom-client';

const requestCounter = new client.Counter({
    name:'http_requests_total',
    help:'Total number of http requests',
    labelNames:['method','route','status_code'] //these are the dimensions
})

const activeUserGauge = new client.Gauge({
    name:"active_users",
    help:"Number of active users",
    labelNames:["method","route"]
})

const RequestDurationMillisecondsHistogram = new client.Histogram({
    name:'http_request_duration_ms',
    help:'Duration of HTTP requests in ms',
    labelNames:['method','route','status_code'],
    buckets:[0.1,5,25,50,100,500,1000,5000]
})

export const requestCount =(req:Request,res:Response,next:NextFunction)=>{
    const startTime = Date.now();
    res.on('finish',()=>{
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime}ms`);
        requestCounter.inc({
            method:req.method,
            route:req.route ? req.route.path : req.path,
            status_code:res.statusCode})
    });

    next();
}

export const activeCounter = (req:Request,res:Response,next:NextFunction)=>{
    activeUserGauge.inc({
        method:req.method,
        route:req.route ? req.route.path : req.path
    })

    res.on('finish',()=>{
        setTimeout(()=>{
            activeUserGauge.dec({
                method:req.method,
                route:req.route ? req.route.path : req.path
            })
        },10000)
       
    })
    next();
}


export const requestDuration = (req:Request,res:Response,next:NextFunction)=>{
    const start = Date.now();
    res.on('finish',()=>{
        const duration = Date.now() - start;
        RequestDurationMillisecondsHistogram.observe({
            method:req.method,
            route:req.route ? req.route.path : req.path,
            status_code:res.statusCode
        },duration)
    })
    next();
}
