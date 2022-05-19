import React,{useEffect,useContext, useState} from 'react';
import '../../styles/organisation/Home-Org.scss';

import H2Wrapper from './H2Wrapper';

import analyticsUtil from '../../utils/analytics';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';


const HomeOrg = ({setPageNo,messageQueue,setMessageQueue}:{messageQueue:{
    type: string;
    data: any;
}[],setMessageQueue:React.Dispatch<React.SetStateAction<{
    type: string;
    data: any;
}[]>>,setPageNo: React.Dispatch<React.SetStateAction<number>>}) => {

    let authContext=useContext(AUTHCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);
    let [testLatestData,setTestLatestData]=useState<{
        name:string,
        _id:string
    }[]>([]);
    let [testDeployedData,setTestDeployedData]=useState<{
        name:string,
        _id:string
    }[]>([]);
    let [batchLatestData,setBatchLatestData]=useState<{
        name:string,
        _id:string
    }[]>([]);

    useEffect(()=>{
        if(authContext?.authState.orgData._id){
            analyticsUtil.loadLatestBatches(setBatchLatestData as ()=>{},authContext,notificationsContext);
            analyticsUtil.loadLatestTests(setTestLatestData as ()=>{},authContext,notificationsContext);
            analyticsUtil.loadTestDeployed(setTestDeployedData as ()=>{},authContext,notificationsContext);
        }
    },[authContext?.authState]);

    return (
        <div className="Home-Org">
            <H2Wrapper defaultShow={true} name={"Test Deployed"}>
                <div className="box">
                    {testDeployedData.map((deployedData=>{
                        return <div className="element" key={deployedData._id}>
                            <h3>{deployedData.name}</h3>
                            <span onClick={()=>{
                                setPageNo(1);
                                messageQueue.push({
                                    type:"VIEWTEST",
                                    data:deployedData._id
                                });
                                setMessageQueue([...messageQueue]);
                            }}>view</span>
                        </div>;
                    }))}
                </div> 
            </H2Wrapper>
            <H2Wrapper defaultShow={false} name={"Latest Tests"}>
                <div className="box">
                    {testLatestData.map((deployedData=>{
                        return <div className="element" key={deployedData._id}>
                            <h3>{deployedData.name}</h3>
                            <span onClick={()=>{
                                setPageNo(1);
                                messageQueue.push({
                                    type:"VIEWTEST",
                                    data:deployedData._id
                                });
                                setMessageQueue([...messageQueue]);
                            }}>view</span>
                        </div>;
                    }))}
                </div> 
            </H2Wrapper>
            <H2Wrapper defaultShow={false} name={"Latest Batches"}>
                <div className="box">
                    {batchLatestData.map((deployedData=>{
                        return <div className="element" key={deployedData._id}>
                            <h3>{deployedData.name}</h3>
                            <span onClick={()=>{
                                setPageNo(2);
                                messageQueue.push({
                                    type:"VIEWBATCH",
                                    data:deployedData._id
                                });
                                setMessageQueue([...messageQueue]);
                            }}>view</span>
                        </div>;
                    }))}
                </div> 
            </H2Wrapper>
            
        </div>
    );
};

export default HomeOrg;