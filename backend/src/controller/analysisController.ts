import express from "express";
import Organisation from "../models/Organisation";
import E from '../controller/errors';

let testDeployedController = async (
  req: express.Request,
  res: express.Response
) => {
  let { _id } = req.body;
  if(!_id){
    E.badRequestError(res);
    return;
  }
  Organisation.findById(_id)
    .populate({
      path:"tests",
      populate: {
        path:"conductor"
      }
    }).then(org=>{
      let data=org.tests;
      data=data.sort((a:any,b:any)=>(new Date(a.dateOfCreation).getTime()-new Date(b.dateOfCreation).getTime()));
      data=data.filter((a:any)=>a.conductor.status==true);
      res.status(200).json({
        success:true,
        data:data
      });
    }).catch(err=>{
      console.log(err);;
      E.internalServerError(res);
    });
};

let latestTestsController = async (
  req: express.Request,
  res: express.Response
) => {
  let { _id } = req.body; 
  if(!_id){
    E.badRequestError(res);
    return;
  }
  Organisation.findById(_id)
    .populate({
      path:"tests",
      populate: {
        path:"conductor"
      }
    }).then(org=>{
      let data=org.tests;
      data=data.sort((a:any,b:any)=>(new Date(b.dateOfCreation).getTime()-new Date(a.dateOfCreation).getTime()));
      res.status(200).json({
        success:true,
        data:data.slice(0,5)
      });
    }).catch(err=>{
      console.log(err);;
      E.internalServerError(res);
    });
};

let latestBatchesController = async (
  req: express.Request,
  res: express.Response
) => {
  let { _id } = req.body;
  if(!_id){
      E.badRequestError(res);
      return;
  }
  Organisation.findById(_id).populate("batches")
    .then(organisation => {
      res.status(200).json({
        success:true,
        data:organisation.batches
      });
    }).catch(err => {
      console.log(err);;
      E.internalServerError(res);
    })
};

export default {
  testDeployedController,
  latestTestsController,
  latestBatchesController
};
