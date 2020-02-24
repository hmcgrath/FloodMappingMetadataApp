import React, { Component } from 'react';
import DataContext from '../data';
import NavBar from './navbar';
import CategoryList from './categorylist';
import TabList from './tablist';
import LoadingOverlay from 'react-loading-overlay';

class GraphApplication extends Component {
    static contextType = DataContext; 
    state = {  }
    render() { 
        return (
            <LoadingOverlay active={this.context.loadingCA}
                            spinner
                            text="Loading Conservation Authorites....">
            <div className="App" style={{marginBottom:"0px", marginTop:"0px"}}>
                <div className="wrapper" style={{marginLeft:"40px", paddingTop:"15px", marginRight:"30px"}}> 
                    <div className="headers text-left" style={{alignItems:"left"}}>
                        <p><h1>Flood Hazard Mapping Analytics</h1></p>
                        <p><h4>Filter By</h4></p>
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
          </LoadingOverlay>
        );
    }
}
 
export default GraphApplication;