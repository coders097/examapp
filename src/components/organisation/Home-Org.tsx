import React from 'react';
import '../../styles/organisation/Home-Org.scss';

import H2Wrapper from './H2Wrapper';

const HomeOrg = () => {
    return (
        <div className="Home-Org">
            <H2Wrapper defaultShow={true} name={"Test Deployed"}>
                <div className="box">
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                </div> 
            </H2Wrapper>
            <H2Wrapper defaultShow={false} name={"Test Ended"}>
                <div className="box">
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                </div>
            </H2Wrapper>
            <H2Wrapper defaultShow={false} name={"Latest Tests"}>
                <div className="box">
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                </div>
            </H2Wrapper>
            <H2Wrapper defaultShow={false} name={"Latest Batches"}>
                <div className="box">
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                    <div className="element">
                        <h3>Class 9 2002 Batch CSE ITER</h3>
                        <span>view</span>
                    </div>
                </div>
            </H2Wrapper>
            
        </div>
    );
};

export default HomeOrg;