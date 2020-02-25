import React, { Component } from 'react';
import DataContext from "../contexts/graphdata";

class FGPVmap extends Component {

    static contextType = DataContext;

    state = {

    };

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://localhost:8080/embed" title="FGPV" id="FGPV"
                    height="600px" width="100%" allowFullScreen={false}/>
                <div className="row">
                    <br></br>
                    <button type="button" className="btn btn-danger btn-block" id="resetmap" onClick={this.context.reset}>Reset Map</button>
                </div>
            </React.Fragment>
        );
    }
}
 
export default FGPVmap;