let cp=require('child_process');
let path=require('path');

let runJavaClass=()=>{
    // My first Effort I gotta say man, it was something
    // let args=[
    //     '-classpath',
    //     `"${__dirname}"`,
    //     `Solution`,
    //     `<`,
    //     `"${path.join(__dirname,"./input")}"`
    // ];
    // let child=cp.spawn("java",args,{
    //     shell: true, // to make sure that its cmd commands instead of args
    // });
    // child.stdout.on("data", function (data) {
    //     console.log(data.toString());
    // });
    // child.stderr.on("data", function (data) {
    //     console.log(data.toString());
    // });
    // child.on("close", function (code, signal) {
    //     process.exit(0);
    // });
    cp.exec(`java -classpath "${__dirname}" Solution < "${path.join(__dirname,"./input")}"`,(err, stdout, stderr) => {
        if(err){
            console.log(err.message);
        }else if(stderr){
            console.log(stderr);
        }else{
            console.log(stdout);
        }
    });
}

cp.exec(`javac "${path.join(__dirname,"./Solution.java")}"`,(err, stdout, stderr) => {
    if(err){
        console.log(err.message);
    }else if(stderr){
        console.log(stderr);
    }else{
        runJavaClass();
    }
});
