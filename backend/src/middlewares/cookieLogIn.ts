import express from 'express';
const refresh_key=process.env.REFRESH_KEY as string;
import jwt from 'jsonwebtoken';
import Organisation from '../models/Organisation';

let cookieChecker=(req:express.Request, res:express.Response,next:express.NextFunction)=>{
    let {email, password} = req.body;
    let { refresh_token }=req.cookies;
    if((email.trim()==='') && (password.trim()==='')){
        if(refresh_token){
            let _data:any=jwt.verify(refresh_token,refresh_key);
            Organisation.findById(_data._id)
                .then(organisation=>{
                    if(organisation && organisation.keepMeLoggedIn)
                        res.status(200).json({
                            success: true,
                            data:{
                                name:organisation.name,
                                email:organisation.email,
                                phone:organisation.phone,
                                pic:organisation.pic,
                                _id:organisation._id
                            }
                        });
                    else next();
                    return;
                }).catch(error=>{
                    next();
                });
        } else next();
    }
    else next();
}

export default cookieChecker;