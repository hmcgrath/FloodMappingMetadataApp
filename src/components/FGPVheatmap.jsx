import React, { Component } from 'react';
import HeatmapDataContext from "../contexts/heatmapdata"; 

class FGPVheatmap extends Component {

    static contextType = HeatmapDataContext; 

    render() { 
        return (
            <React.Fragment>
                <div>
                    <iframe src="http://localhost:8080/embedheatmap" title="FGPVheatmap" id="FGPVheatmap"
                        height="800px" width="100%" allowFullScreen={false}/>
                    <div className="row">
                        <br></br>
                        <button type="button" className="btn btn-danger btn-block" id="resetheatmap" onClick={this.context.reset}>Reset Map</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default FGPVheatmap;