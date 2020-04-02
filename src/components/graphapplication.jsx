import React, { Component } from 'react';
import DataContext from '../contexts/graphdata';
import CategoryList from './categorylist';
import TabList from './tablist';
import Title from './title';

class GraphApplication extends Component {
    static contextType = DataContext; 
    state = {  }
    render() { 
        return (
            <div className="App" style={{marginBottom:"0px", marginTop:"0px"}}>
                <div className="wrapper" style={{marginLeft:"40px", paddingTop:"15px", paddingBottom: "15px", marginRight:"30px"}}> 
                    <div className="headers text-left" style={{alignItems:"left"}}>
                        <Title mode={"graph"}></Title>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-sm-12">
                             <CategoryList></CategoryList>
                        </div>
                        <div className="col-lg-8 col-md-6 col-sm-12">
                            <TabList></TabList>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default GraphApplication;