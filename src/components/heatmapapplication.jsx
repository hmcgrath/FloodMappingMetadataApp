import React, { Component } from 'react';
import HeatmapDataContext from '../contexts/heatmapdata'; 
import HeatmapCategoryList from './heatmapcategorylist'; 
import FGPVheatmap from './FGPVheatmap'; 
import LoadingOverlay from 'react-loading-overlay'; 

class HeatmapApplication extends Component {
    static contextType = HeatmapDataContext; 
    // not needed
    state = {  }
    render() { 
        return (<LoadingOverlay active={this.context.loadingCA}
                                spinner
                                text="Loading Conservation Authorities....">
                    <div className="App" style={{marginBottom:"0px", marginTop:"0px"}}>
                        <div className="wrapper" style={{marginLeft:"40px", paddingTop:"15px", marginRight:"30px", paddingBottom:"15px"}}> 
                            <div className="headers text-left" style={{alignItems:"left"}}>
                                <p><h1>Flood Hazard Mapping Analytics</h1></p>
                                <p><h4>Filter By</h4></p>
                            </div>
                            <div className="row">
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    <HeatmapCategoryList></HeatmapCategoryList>
                                </div>
                                <div className="col-lg-8 col-md-6 col-sm-12">
                                    <FGPVheatmap></FGPVheatmap>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingOverlay>  
            );
    }
}
 
export default HeatmapApplication;