import jwt from 'jsonwebtoken';
const jwt_key=process.env.JWT_KEY;
import express from 'express';

let jwtCheckToken=(req:express.Request, res:express.Response,next:express.NextFunction)=>{
    let {token} = req.cookies;
    if(token){
        try{
            let data:any=jwt.verify(token,jwt_key as string);
            req.body._id=data["_id"];
            next();
        }catch(e){
            res.status(401).send({
                success:false,
                error:'Expired Token!'
            });    
        }
    }else{
        res.status(401).send({
            success:false,
            error:'Authentication Error'
        });
    } 
}

export default jwtCheckToken;