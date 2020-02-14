import React, { Component } from 'react';
import DataContext from "../data";

class FGPVmap extends Component {

    static contextType = DataContext;

    state = {

    };

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://localhost:3000/embed" title="FGPV" id="FGPV"
                    height="600px" width="100%" allowFullScreen={false}/>
                <div className="row">
                    <br></br>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <button type="button" className="btn btn-primary btn-block" id="loadconservation" onClick={this.context.loadConservationLayers}>Load Conservation Authority Layers</button>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <button type="button" className="btn btn-danger btn-block" id="resetmap" onClick={this.context.reset}>Reset Map</button>
                    </div>    
                </div>
            </React.Fragment>
        );
    }
}
 
export default FGPVmap;