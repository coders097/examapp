import { AUTHSTATE } from "../contexts/authContext";
import { NOTIFICATIONSTATE } from "../contexts/notificationContext";
import Icon from "../assets/logo.png";

let domain="http://localhost:3002";

function notifyMe(message: string) {
    if (!("Notification" in window)) {
      alert(message);
    }
    else if (Notification.permission === "granted") {
      let notification = new Notification(message,{
          icon:Icon
      });
    }
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(message,{
            icon:Icon
          });
        }else alert(message);
      });
    }
  }

let logoutOrganisation=(authDispatch:React.Dispatch<{
    type: string;
    payload: AUTHSTATE;
}> | undefined)=>{
    fetch(`${domain}/auth/organisation/logout`,{
        method: "GET",
        credentials:"include"
    })
        .then(res=>res.json())
        .then(data=>{
            if(authDispatch)
                authDispatch({
                    type:"ORG_LOGOUT",
                    payload:{} as AUTHSTATE
                });
        }).catch(err=>{
            notifyMe("Try Again Please!");
        });
};

let loginOrganization = (data:{
    email: string,
    password: string
},authDispatch:React.Dispatch<{
    type: string;
    payload: AUTHSTATE;
}> | undefined)=>{
    fetch(`${domain}/auth/organisation/login`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(response=>{
        return response.json();
    })
    .then(_data=>{
        if(_data.success){
            if(authDispatch)
                authDispatch({
                    type:"ORG_LOGIN",
                    payload:{
                        login:true,
                        loginType: "organisation",
                        orgData:{
                            _id:_data.data._id,
                            email: _data.data.email,
                            keepMeLoggedIn:true,
                            name:_data.data.name, 
                            phone:_data.data.phone,
                            pic:_data.data.pic,
                            notificationMode:true
                        },
                        candiData:{}
                    }
                });
        }else notifyMe(_data.error);
    }).catch(error=>{
        notifyMe(error);
    });
};

let signupOrganization = (data:{
    name: string,
    password: string,
    email: string,
    phone: string
},authDispatch:React.Dispatch<{
    type: string;
    payload: AUTHSTATE;
}> | undefined)=>{
    fetch(`${domain}/auth/organisation/signup`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(response=>{
        return response.json();
    })
    .then(_data=>{
        if(_data.success){
            if(authDispatch)
                authDispatch({
                    type:"ORG_LOGIN",
                    payload:{
                        login:true,
                        loginType: "organisation",
                        orgData:{
                            _id:_data.data._id,
                            email: _data.data.email,
                            keepMeLoggedIn:true,
                            name:_data.data.name, 
                            phone:_data.data.phone,
                            pic:_data.data.pic,
                            notificationMode:true
                        },
                        candiData:{}
                    }
                });
        }else notifyMe(_data.error);
    }).catch(error=>{
        notifyMe(error);
    });
};

let refreshTokenAndProcedd=(
    authState:AUTHSTATE,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined, 
    cb:any
)=>{
    console.log("Refreshing token");
    fetch(`${domain}/auth/refreshToken`,{
        method: 'POST',
        credentials:"include"
    }).then(res=>res.json())
    .then((data:any)=>{
        if(data.success){
            cb();
        }else{
            logoutOrganisation(authDispatch);
        }
        console.log(data);
    }).catch(error=>{
        logoutOrganisation(authDispatch);
    });
};

let testing=(
    authState:AUTHSTATE,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined
)=>{
    fetch(`${domain}/auth/organisation/testing`,{
        method: 'POST',
        credentials:"include"
    }).then(res=>res.json())
    .then(data=>{
        if(data.success){
            console.log("Working");
        }else{
            if(data.error==='Expired Token!'){
                refreshTokenAndProcedd(authState,authDispatch,()=>{
                    testing(authState,authDispatch);
                });
            }
        }
    })
    .catch(err=>console.log(err));
}

let feedback=(
    authState:AUTHSTATE,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined,
    _feedback:String | undefined,
    pics:FileList | undefined | null,
    success:any,
    failure:any
    )=>{
    let formData=new FormData();
    formData.set("feedback",`${_feedback?_feedback:""}`);
    formData.set("name",authState.orgData.name);
    formData.set("_id",authState.orgData._id);
    if(pics)
    for(let i=0;i<pics.length;i++){
        let pic=pics[i];
        formData.append(pic.name,pic);
    }
    fetch(`${domain}/auth/organisation/feedback`,{
        method: 'POST',
        body:formData,
        credentials:"include"
    }).then(res=>res.json())
    .then(data=>{
        if(data.success)
            success();
        else{
            if(data.error==='Expired Token!'){
                refreshTokenAndProcedd(authState,authDispatch,()=>{
                    feedback(authState,authDispatch,_feedback,pics,success,failure);
                });
            }else failure();
        }
    }).catch(err=>{
        console.log(err);
        failure();
    });
};

let settings=(authContext:{
    authState: AUTHSTATE;
    authDispatch: React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }>;
} | null,notificationContext:{
    notificationState: NOTIFICATIONSTATE;
    notificationDispatch: React.Dispatch<{
        type: string;
        payload: NOTIFICATIONSTATE;
    }>;
} | null,{
    notificationFlag,
    keepMeLoggedInFlag,
    resetFlag
}:{
    notificationFlag?:boolean,
    keepMeLoggedInFlag?: boolean,
    resetFlag?: boolean
})=>{
    fetch(`${domain}/auth/organisation/settings`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            notificationFlag:notificationFlag,
            keepMeLoggedInFlag:keepMeLoggedInFlag,
            resetFlag:resetFlag?resetFlag:false
        }),
        credentials:"include"
    }).then(response =>response.json())
    .then(data =>{
        if(data.success){
            authContext?.authDispatch({
                type: 'ORG_UPDATE',
                payload:{
                    login:authContext.authState.login,
                    loginType:"organisation",
                    orgData:{
                        ...authContext.authState.orgData,
                        ...data.data
                    },
                    candiData:authContext.authState.candiData
                }
            });
            if(notificationContext){
                notificationContext.notificationState.notifications.push("😀 Success Updated Settings!");
                notificationContext.notificationDispatch({
                    type:"ADD_NOTIFICATION",
                    payload:{
                        active:true,
                        notifications:notificationContext.notificationState.notifications
                    }
                });
            }
        }else{
            if(data.error==='Expired Token!'){
                if(authContext)
                refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                    settings(authContext,notificationContext,{
                        notificationFlag,
                        keepMeLoggedInFlag,
                        resetFlag
                    });
                });
            }else{
                if(notificationContext){
                    notificationContext.notificationState.notifications.push("😐 Failed to update settings!");
                    notificationContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:notificationContext.notificationState.notifications
                        }
                    });
                }
            }
        }
    }).catch(err =>{
        console.error(err);
        if(notificationContext){
            notificationContext.notificationState.notifications.push("😐 Failed to update settings!");
            notificationContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationContext.notificationState.notifications
                }
            });
        }
    });
};

let updateOrganizationProfile = (authContext:{
    authState: AUTHSTATE;
    authDispatch: React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }>;
} | null,notificationContext:{
    notificationState: NOTIFICATIONSTATE;
    notificationDispatch: React.Dispatch<{
        type: string;
        payload: NOTIFICATIONSTATE;
    }>;
} | null,{
    name,email,phone,password,oldPassword,picFile
}:{name?: string | null,email?:string | null,
    phone?:string | null,password?:string | null,oldPassword?:string | null,
    picFile?:File | null})=>{
        
    let formData=new FormData();
    if(name) formData.append("name",name);
    if(email) formData.append("email",email);
    if(password) formData.append("password",password);
    if(phone) formData.append("phone",phone);
    if(oldPassword) formData.append("oldPassword",oldPassword);
    if(picFile) formData.append("picFile",picFile);
    fetch(`${domain}/auth/organisation/editProfile`,{
        method: 'POST',
        body:formData,
        credentials:"include"
    }).then((response=>response.json()))
    .then(data=>{
        if(data.success){
            authContext?.authDispatch({
                type: 'ORG_UPDATE',
                payload:{
                    login:authContext.authState.login,
                    loginType:"organisation",
                    orgData:{
                        ...authContext.authState.orgData,
                        ...data.data
                    },
                    candiData:authContext.authState.candiData
                }
            });
            if(notificationContext){
                notificationContext.notificationState.notifications.push("😀 Success Saved Profile!");
                notificationContext.notificationDispatch({
                    type:"ADD_NOTIFICATION",
                    payload:{
                        active:true,
                        notifications:notificationContext.notificationState.notifications
                    }
                });
            }
        }else{
            if(data.error==='Expired Token!'){
                if(authContext)
                refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                    updateOrganizationProfile(authContext,notificationContext,{
                        name,email,phone,password,oldPassword,picFile
                    });
                });
            }else{
                if(notificationContext){
                    notificationContext.notificationState.notifications.push("😐 Failed to save profile!");
                    notificationContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:notificationContext.notificationState.notifications
                        }
                    });
                }
            }
        }
    }).catch((error=>{
        console.error(error);
        if(notificationContext){
            notificationContext.notificationState.notifications.push("😐 Failed to save profile!");
            notificationContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationContext.notificationState.notifications
                }
            });
        }
    }));
};

let deleteProfile = (authContext: {
    authState: AUTHSTATE;
    authDispatch: React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }>;
} | null,checkString:string) => {
    fetch(`${domain}/auth/organisation/deleteProfile`,{
        method: "POST",
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            checkString:checkString
        }),
        credentials:"include"
    }).then(res=>res.json())
    .then(data=>{
        if(data.success){
            authContext?.authDispatch({ 
                type: 'ORG_LOGOUT',
                payload:authContext.authState
            });
        }else{
            if(data.error==='Expired Token!'){
                if(authContext)
                refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                    deleteProfile(authContext,checkString);
                });
            } else alert(`Failed to delete profile : ${data.error}`);
        }
    }).catch(err=>{
        console.log(err);
        alert("Try Again!");
    });
}

let loginCandidate = ({data,authDispatch}:{
    data:{
        name:string,
        regd: string,
        key:string,
        testId:string
    },authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined
})=>{
    
    let params=new URLSearchParams(data);
    fetch(`${domain}/auth/candidate/login?${params.toString()}`)
        .then(response=>response.json())
        .then(_data=>{
            if(_data.success){
                if(authDispatch)
                    authDispatch({
                        type:"CANDI_LOGIN",
                        payload:{
                            login: true,
                            loginType: "candidate",
                            orgData: {
                                name: "",
                                email: "",
                                phone: "",
                                pic:"",
                                _id: "",
                                notificationMode: false,
                                keepMeLoggedIn: false,
                            },
                            candiData: {..._data.data,key:data.key} 
                        }
                    });
            }else console.log(_data.error);
        }).catch(error=>{console.error(error)});
};


export default {
    loginCandidate,
    loginOrganization,
    signupOrganization,
    refreshTokenAndProcedd,
    logoutOrganisation,
    testing,
    feedback,
    settings,
    updateOrganizationProfile,
    deleteProfile
};