import express from 'express';
let app=express.Router();
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process'; 


// @type  POST
// @route /code/compile
// @desc  for compiling code from candidate
// @access PRIVATE
app.post("/compile",(req,res)=>{
    let {type,code,inputs}=req.body;
    fs.writeFileSync(path.join(__dirname,"../../../codeRunner/input"),inputs,"utf-8");
    let PATH="";
    if(type === "java"){
        fs.writeFileSync(path.join(__dirname,"../../../codeRunner/Solution.java"),code,"utf-8");
        PATH=`node "${path.join(__dirname,"../../../codeRunner/javaRunner.js")}"`;
    }
    if(type === "python"){
        fs.writeFileSync(path.join(__dirname,"../../../codeRunner/Solution.py"),code,"utf-8");
        PATH=`node "${path.join(__dirname,"../../../codeRunner/pythonRunner.js")}"`;
    }
    if(type === "c_cpp"){
        fs.writeFileSync(path.join(__dirname,"../../../codeRunner/Solution.c"),code,"utf-8");
        PATH=`node "${path.join(__dirname,"../../../codeRunner/cRunner.js")}"`;
    }
    exec(PATH,(err, stdout, stderr) =>{
        if(err){
            console.log(err.message);
            res.status(200).json({success:false});
        }else if(stderr){
            console.log(stderr);
            res.status(200).json({
                success:true,
                data:stderr
            });
        }else{
            res.status(200).json({
                success:true,
                data:stdout
            });
        }
    });
});

export default app;