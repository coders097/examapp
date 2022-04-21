let cp=require('child_process');
let path=require('path');

cp.exec(`python "${path.join(__dirname,"./Solution.py")}" < "${path.join(__dirname,"./input")}"`,(err, stdout, stderr) => {
    if(err){
        console.log(err.message);
    }else if(stderr){
        console.log(stderr);
    }else{
        console.log(stdout);
    }
});