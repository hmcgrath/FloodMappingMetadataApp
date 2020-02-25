import React, { Component } from 'react';
import DataContext from "../contexts/graphdata";

class FGPVheatmap extends Component {

    static contextType = DataContext;

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://localhost:8080/embedheatmap" title="FGPVheatmap" id="FGPV"
                    height="800px" width="100%" allowFullScreen={false}/>
                <div className="row">
                    <br></br>
                    <button type="button" className="btn btn-danger btn-block" id="resetheatmap" onClick="">Reset Map</button>
                </div>
            </React.Fragment>
        );
    }
}

export default FGPVheatmap;