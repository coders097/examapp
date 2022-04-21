import express from 'express';
import E from '../controller/errors';
import Organisation from '../models/Organisation';
import Notification from '../models/Notification';
import Test from '../models/Test';
import Batch from '../models/Batch';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import FeedBack from '../models/FeedBack';
const saltRounds = 14;
const jwt_key=process.env.JWT_KEY as string;
const refresh_key=process.env.REFRESH_KEY as string; 
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';


let candidateLogin=async (req:express.Request, res: express.Response)=>{
    let {name,regd,key,testId}=req.query;
    if(!name || !regd || !key || !testId){
        E.badRequestError(res);
        return;
    }
    try {
        let test=await Test.findById(testId).populate("conductor");
        if(!test) {
            E.notFoundError(res);
            return;
        }
        // Check Timing
        let currTime=Date.now();
        let startTime=new Date(test.conductor.startDateTime).getTime();
        let endTime=new Date(test.conductor.endDateTime).getTime();
        if(currTime<startTime || currTime>endTime) {
            E.unAuthorizedError(res);
            return;
        }
        ///////////////
        let passkeys:string[] = test.conductor.passkeys;
        passkeys = passkeys.filter(passkey => passkey.includes(name as string) && passkey.includes(regd as string) && passkey.includes(key as string));
        if(passkeys.length == 1){
            let resStrArr=passkeys[0].split("<$>");
            res.status(200).json({
                success:true,
                data:{
                    name:resStrArr[0],
                    email:resStrArr[1],
                    regd:resStrArr[2],
                    testId:testId
                }
            });
        }else{
            E.notFoundError(res);
        }
    }catch(err){
        console.log(err);
        E.internalServerError(res);
    }
};


let successLogInSignUp=(req:express.Request, res: express.Response,organisation:any)=>{
    let timeInMinutes = 120;
    let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
    let token = jwt.sign(
        {
            name: organisation.name,
            _id: organisation._id,
            exp: expires,
        },
        jwt_key
    );
    let refreshTimeExpires = Math.floor(Date.now() / 1000) + 60 * 3000;
    let refreshToken = jwt.sign(
        {
            name: organisation.name,
            _id: organisation._id,
            exp: refreshTimeExpires
        },
        refresh_key
    );
    res.cookie("token",token,{ 
        maxAge:8147483647,
        path: "/",
        secure:true,
        httpOnly:true
    });
    res.cookie("refresh_token",refreshToken,{ 
        maxAge:8147483647,
        path: "/",
        secure:true,
        httpOnly:true
    });
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
};

let organizationLogin=(req:express.Request, res: express.Response)=>{
    let {email,password}=req.body;
    if(!email || !password){
        E.badRequestError(res);
        return;
    }
    Organisation.findOne({email:email})
        .then((organisation)=>{
            if(organisation && bcrypt.compareSync(password,organisation.password)){
                successLogInSignUp(req,res,organisation);
            }else{
                E.unAuthorizedError(res);
            }
        })
        .catch((error)=>{
            E.notFoundError(res);
        });
};

let organizationSignup=(req:express.Request, res: express.Response)=>{
    let {name,phone,email,password}=req.body;
    if(!email || !password || !name || !phone){
        E.badRequestError(res);
        return;
    }
    Organisation.findOne({email:email})
        .then((organisation)=>{
            if(organisation) E.notFoundError(res);
            else{
                Notification.create({
                    active:true
                }).then(notification=>{
                    let hashedPassword = bcrypt.hashSync(password,saltRounds);
                    Organisation.create({
                        name:name,
                        email:email,
                        phone:phone,
                        password:hashedPassword,
                        pic:"",
                        notifications:notification._id
                    }).then(organisation=>{
                        successLogInSignUp(req,res,organisation);
                    }).catch((error)=>{
                        console.error(error);
                        E.internalServerError(res);
                    });
                }).catch((error)=>{
                    console.error(error);
                    E.internalServerError(res);
                });
            }
        })
        .catch((error)=>{
            E.internalServerError(res);
        });
};

let refreshToken=(req:express.Request, res: express.Response)=>{
    console.log("Refreshing token");
    try{
        let { refresh_token }=req.cookies;
        if(refresh_token){
            let _data:any=jwt.verify(refresh_token,refresh_key);
            let timeInMinutes = 120;
            let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
            let token = jwt.sign(
                {
                    name: _data.name,
                    _id: _data._id,
                    exp: expires,
                },
                jwt_key
            );
            let refreshTimeExpires = Math.floor(Date.now() / 1000) + 60 * 3000;
            let refreshToken = jwt.sign(
                {
                    name: _data.name,
                    _id: _data._id,
                    exp: refreshTimeExpires
                },
                refresh_key
            );
            res.cookie("token",token,{ 
                maxAge:8147483647,
                path: "/",
                secure:true,
                httpOnly:true
            });
            res.cookie("refresh_token",refreshToken,{ 
                maxAge:8147483647,
                path: "/",
                secure:true,
                httpOnly:true
            });
            res.status(200).json({ 
                success: true
            });
        }else res.status(404).json({
            success:false
        });
    }catch(e){
        res.status(404).json({
            success:false
        });
    }
};

let organizationLogout=(req:express.Request, res: express.Response)=>{
    res.cookie("token","",{ 
        maxAge:-1,
        path: "/",
        secure:true,
        httpOnly:true
    });
    res.cookie("refresh_token","",{ 
        maxAge:-1,
        path: "/",
        secure:true,
        httpOnly:true
    });
    res.status(200).send({
        success: true
    });
};

let feedback=(req:express.Request, res: express.Response)=>{
    let {feedback,name,_id}=req.body;
    let pics:string[]=[];
    if(req.files && req.files.length>0){
        (req.files as Express.Multer.File[]).forEach(file=>{
            let picName=`${name}_${_id}_${Date.now()}`+path.extname(file.originalname);
            try{
                fs.writeFileSync(path.join(__dirname,"../../storage/feedbacks/",picName),file.buffer);
                pics.push(picName);
            }catch(err){
                console.log(err);
            }
        });
    }
    FeedBack.create({
        type:"organization",
        feedback:feedback,
        pics:pics
    }).then(feed=>{
        res.status(200).json({success:true});
    }).catch(err=>{
        console.log(err);
        E.internalServerError(res);
    });
}

let settings=(req:express.Request, res: express.Response)=>{
    let { notificationFlag,keepMeLoggedInFlag,_id,resetFlag }=req.body;
    if(resetFlag){
        notificationFlag=true;
        keepMeLoggedInFlag=true;
    }
    console.log("notification",notificationFlag," ","keepMeLoggedInFlag",keepMeLoggedInFlag);
    Organisation.findById(_id)
        .then(organisation=>{
            if(organisation){
                if(keepMeLoggedInFlag || keepMeLoggedInFlag===false)
                    organisation.keepMeLoggedIn=keepMeLoggedInFlag;
                organisation.save()
                    .then(()=>{
                        if(notificationFlag || notificationFlag===false)
                            Notification.findById(organisation.notifications)
                                .then(notification=>{
                                    notification.active=notificationFlag;
                                    notification.save()
                                        .then(()=>{
                                            res.status(200).json({
                                                success: true,
                                                data:{
                                                    notificationMode:notification.active,
                                                    keepMeLoggedIn:organisation.keepMeLoggedIn
                                                }
                                            });
                                        }).catch((error:any)=>{
                                            E.internalServerError(res);
                                        })
                                }).catch(error=>{
                                    E.internalServerError(res);
                                });
                        else res.status(200).json({
                            success: true,
                            data:{
                                keepMeLoggedIn:organisation.keepMeLoggedIn
                            }
                        });
                    }).catch((err:any)=>{
                        E.internalServerError(res);
                    });
            }
        }).catch(err=>{
            E.internalServerError(res);
        });
}

let editProfile=(req:express.Request, res: express.Response)=>{
    let {name,email,phone,password,_id,oldPassword} = req.body;
    if(!oldPassword){
        E.badRequestError(res);
        return;
    }
    let pic: string | null = null;
    if(req.files && req.files.length>0){
        let file=(req.files as Express.Multer.File[])[0];
        try{
            pic=`${_id}_${Date.now()}_${file.originalname}`;
            fs.writeFileSync(path.join(__dirname,"../../storage/profile",pic),file.buffer);
        }catch(e){
            pic=null;
        }
    }
    Organisation.findById(_id)
        .then(organization=>{
            if(!bcrypt.compareSync(oldPassword,organization.password)){
                E.unAuthorizedError(res);
                return;
            }
            if(name) organization.name=name;
            if(email) organization.email=email;
            if(password) {
                organization.password=bcrypt.hashSync(password,saltRounds);
            }
            if(phone) organization.phone=phone;
            if(pic) {
                let oldPic=organization.pic;
                if(oldPic.trim()!=="")
                promisify(fs.unlink)(path.join(__dirname,"../../storage/profile",oldPic))
                    .then(()=>{}).catch(()=>{});
                organization.pic=pic;
            }
            organization.save()
                .then(()=>{
                    res.status(200).json({
                        success:true,
                        data:{
                            name:organization.name,
                            email:organization.email,
                            pic:organization.pic,
                            phone:organization.phone
                        }
                    });
                }).catch((err:any)=>{
                    console.log(err);
                    E.internalServerError(res);
                });

        }).catch(err=>{
            console.log(err);
            E.internalServerError(res);
        });
}

let getPic=(req:express.Request, res: express.Response)=>{
    let {pic}=req.query;
    if((pic as string).trim()===""){
        res.status(404).send();
    }
    try{
        fs.createReadStream(path.join(__dirname,"../../storage/profile",pic as string)).pipe(res);
    }catch(err){
        res.status(404).send();
    }
}

let deleteProfile=(req:express.Request, res: express.Response)=>{
    let {checkString,_id}=req.body;
    let i=(checkString as string).indexOf("<$>DELETE");
    if(i===-1){
        E.badRequestError(res);
    }else{
        let password=(checkString as string).substring(0,i);
        Organisation.findById(_id)
            .then((organisation=>{
                if(bcrypt.compareSync(password,organisation.password)){
                    let notification=organisation.notifications;
                    let tests=organisation.tests;
                    let batches=organisation.batches;
                    organisation.delete().then(()=>{
                        res.cookie("token","",{ 
                            maxAge:-1,
                            path: "/",
                            secure:true,
                            httpOnly:true
                        });
                        res.cookie("refresh_token","",{ 
                            maxAge:-1,
                            path: "/",
                            secure:true,
                            httpOnly:true
                        });
                        res.status(200).json({success: true});
                        Notification.deleteOne({ _id:notification})
                            .then(()=>{}).catch(err=>console.log(err));
                        if(tests.length>0)
                            Test.deleteMany({_id: { $in: tests}})
                                .then(()=>{}).catch(console.log);
                        if(batches.length>0)
                            Batch.deleteMany({_id: { $in: batches}})
                                .then(()=>{}).catch(console.log);
                    }).catch((err:any)=>{
                        E.internalServerError(res);
                    });
                }else E.unAuthorizedError(res);
            })).catch((error)=>{
                E.internalServerError(res);
            });
    }
}

export default {
    candidateLogin, organizationLogin , 
    organizationSignup , refreshToken , editProfile,
    organizationLogout , feedback, settings, getPic, deleteProfile
} 