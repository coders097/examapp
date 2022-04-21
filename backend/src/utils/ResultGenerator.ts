import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

let runnAndOutput=(lang: string)=>{
    if(lang === "java"){
        try {
            cp.execSync(`javac "${path.join(__dirname,"./Solution.java")}"`);
            let res=cp.execSync(`java -classpath "${__dirname}" Solution < "${path.join(__dirname,"./input")}"`);
            return res.toString();
        }catch(e){
            return (e as Error).message;
        }

    }else if(lang === "python"){
        try{
            let data=cp.execSync(`python "${path.join(__dirname,"./Solution.py")}" < "${path.join(__dirname,"./input")}"`);
            return data.toString();
        }catch(e) {
            return (e as Error).message;
        }
    }
    else return "";
};

let resultGenerator=({results,markPerQuestion,batches,mcqQuestions,progQuestions,resultId,noOfQuestions}:{
    results:{
        name: string;
        regdNo: string;
        answerSheet: {
            prog: {
                _id: string;
                code: string;
            }[];
            mcq: {
                id: string;
                answer: string;
            }[];
        };
    }[],
    markPerQuestion:number,
    noOfQuestions:number,
    batches:{
        name: string;
        candidates: {
            name: string;
            email: string;
            regdNo: string;
        }[];
    }[],
    mcqQuestions:{
        answer:string,
        id:string
    }[],
    progQuestions:{
        _id:string,
        testCasesFile:string,
        outputsFile:string
    }[],
    resultId: string 
})=>{
    let resultSheet=fs.createWriteStream(path.join(__dirname,"../../storage/results",resultId));
    let mcqSet=new Map<string,string>();
    mcqQuestions.forEach((question)=>{
        mcqSet.set(question.id,question.answer);
    });
    let batchCandi=new Map<string,{
        name: string;
        email: string;
        regdNo: string;
    }>();
    batches.forEach((batch)=>{
        batch.candidates.forEach((candidate)=>{
            batchCandi.set(candidate.regdNo,{
                email:candidate.email,
                name:candidate.name,
                regdNo: candidate.regdNo
            });
        })
    });
    let answerSets=new Map<string,{
        name: string;
        regdNo: string;
        answerSheet: {
            prog: {
                _id: string;
                code: string;
            }[];
            mcq: {
                id: string;
                answer: string;
            }[];
        };
    }>();
    results.forEach(result=>{
        answerSets.set(result.regdNo,result);
    });
    let totalMarks=noOfQuestions*markPerQuestion;
    
    // MCQ VERIFICATION
    resultSheet.write("TYPE :: MCQ RESULTS\n");
    batches.forEach(batch=>{
        resultSheet.write("BATCH :: "+batch.name+"\n");
        resultSheet.write("CANDIDATES :: \n")
        batch.candidates.forEach((candidate,i)=>{
            resultSheet.write(`${i+1}. ${candidate.name.replace(" ","_")} ${candidate.email} ${candidate.regdNo} MARKS = `);
            let correctNo=0;
            let individualAns=answerSets.get(candidate.regdNo);
            if(individualAns){
                individualAns.answerSheet.mcq.forEach(answer=>{
                    if(answer.answer.trim()==mcqSet.get(answer.id)) correctNo++;
                });
            }
            resultSheet.write(`${correctNo*markPerQuestion}/${totalMarks} \n`);
        });
        resultSheet.write(":: \n");
        resultSheet.write(":: \n");
    });
    resultSheet.write(":: \n");

    // PROG VERIFICATION
    totalMarks=progQuestions.length*markPerQuestion;
    let actualProgResults=new Map<string,string>();
    let progQuestionTestCases=new Map<string,string>();
    progQuestions.forEach((question)=>{
        let output=fs.readFileSync(path.join(__dirname,"../../storage/outputFiles",question.outputsFile)).toString().trim();
        actualProgResults.set(question._id.toString(),output);
        let testCase=fs.readFileSync(path.join(__dirname,"../../storage/testCases",question.testCasesFile)).toString().trim();
        progQuestionTestCases.set(question._id.toString(),testCase);
    });
    

    resultSheet.write("TYPE :: PROG RESULTS\n");
    batches.forEach(batch=>{
        resultSheet.write("BATCH :: "+batch.name+"\n");
        resultSheet.write("CANDIDATES :: \n")
        batch.candidates.forEach((candidate,i)=>{
            resultSheet.write(`${i+1}. ${candidate.name.replace(" ","_")} ${candidate.email} ${candidate.regdNo} MARKS = `);
            let correctNo=0;
            let allProgAnswers=answerSets.get(candidate.regdNo)?.answerSheet.prog;
            allProgAnswers?.forEach(progAns=>{
                try{
                    let progData=progAns.code.split("<$%$%$>");
                    if(progData.length==2){
                        if(progData[0]=="java"){
                            fs.writeFileSync(path.join(__dirname,"../../dist/utils/","Solution.java"),progData[1],"utf-8");
                        }else if(progData[0]=="python"){
                            fs.writeFileSync(path.join(__dirname,"../../dist/utils/","Solution.py"),progData[1],"utf-8");
                        }
                    }
                    fs.writeFileSync(path.join(__dirname,"../../dist/utils/","input"),progQuestionTestCases.get(progAns._id) as string,"utf-8");
                    let check1=progData[1].trim()==""?"error":runnAndOutput(progData[0]).trim();
                    let check2=actualProgResults.get(progAns._id)?.trim();
                    if(check1==check2){
                        correctNo++;
                    }
                    console.log(candidate.name);
                    console.log(check1,"\n",check2,"\n___");
                }catch(e){}
            });
            resultSheet.write(`${correctNo*markPerQuestion}/${totalMarks} \n`);
        });
        resultSheet.write(":: \n");
        resultSheet.write(":: \n");
    });
    resultSheet.write(":: \n");

    resultSheet.end();
}

export default {
    resultGenerator
}