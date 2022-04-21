import React, { useEffect, useState } from 'react';

const H2Wrapper = ({defaultShow,children,name}:{defaultShow:boolean,children:any,name:string}) => {
    let [show,setShow]=useState(false);
    useEffect(()=>{
        setShow(defaultShow);
    },[defaultShow]);
    return (
        <>
            <h2 onClick={()=>setShow(!show)}>{name} <i className={!show?"fa fa-chevron-circle-down":"fa fa-chevron-circle-up"} aria-hidden="true"></i></h2>
            {show && <>{children}</>}
        </>
    );
};

export default H2Wrapper;