import express, { NextFunction, Request, Response } from 'express';
import { activeCounter, requestCount, requestDuration } from './monitoring/requestCount';
import client from 'prom-client'
const app = express();

app.use(requestCount)
app.use(activeCounter)
app.use(requestDuration)

app.get("/user",(req,res)=>{
    res.json({
        name:"chirag"
    })
})

app.post("/user",(req,res)=>{
    res.json({
        name:"chirag",
    })
});
const auth = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== 'Basic ' + Buffer.from('chirag:password').toString('base64')) {
        res.status(401).send('Unauthorized');
    } else {
        next();
    }
};

app.get("/metrics",auth,async(req,res)=>{
    const metrics = await client.register.metrics();
    res.set('Content-Type',client.register.contentType);
    res.send(metrics);
})

app.listen(3000,()=>console.log("server running on port 3000"));

