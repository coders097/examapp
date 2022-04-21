let cp=require('child_process');
let path=require('path');

cp.exec(`gcc "${path.join(__dirname,"./Solution.c")}"`,(err, stdout, stderr) => {
    if(err){
        console.log(err.message);
    }else if(stderr){
        console.log(stderr);
    }else{
        cp.execFile(`a.exe`,
        ["<",`"${path.join(__dirname,"./input")}"`],{
            shell:true
        },(err, stdout, stderr) => {
            if(err){
                console.log(err.message);
            }else if(stderr){
                console.log(stderr);
            }else console.log(stdout);
        });
    }
});