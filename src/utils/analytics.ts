let domain = "http://localhost:3002";


let loadTestDeployed = (reducer:(args:any)=>{}) => {
    fetch(`${domain}/organisation/test/getTestDeployed`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }
    }).catch(err =>{
        console.log(err);
    });
};

let loadLatestTests = (reducer:(args:any)=>{}) => {
    fetch(`${domain}/organisation/test/getLatestTests`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }
    }).catch(err =>{
        console.log(err);
    });
};

let loadLatestBatches = (reducer:(args:any)=>{}) => {
    fetch(`${domain}/organisation/test/getLatestBatches`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }
    }).catch(err =>{
        console.log(err);
    });
};

export default {
  loadTestDeployed,
  loadLatestTests,
  loadLatestBatches,
};
