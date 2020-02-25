import React, { Component } from 'react';
import DataContext from "../contexts/graphdata";

class FGPVmap extends Component {

    static contextType = DataContext;

    state = {

    };

    //loads the conservation authority button if the layer is not already loaded
    getToggleConservationButton() {
        if (this.context.loadedCA) {
            return (<button type="button" className="btn btn-primary btn-block" id="loadconservation" onClick={this.context.toggleConservationLayers}>Toggle Conservation Authority Layers</button>); 
        }
        else {
            return ""; 
        }
    }

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://localhost:8080/embed" title="FGPV" id="FGPV"
                    height="600px" width="100%" allowFullScreen={false}/>
                <div className="row">
                    <br></br>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        {this.getToggleConservationButton()}
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