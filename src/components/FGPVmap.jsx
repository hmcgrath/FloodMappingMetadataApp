import React, { Component } from 'react';
import DataContext from "../contexts/graphdata";

class FGPVmap extends Component {

    static contextType = DataContext;

    state = {

    };

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://geogratis.gc.ca/hydro_dev/embed" title="FGPV" id="FGPV"
                    height="600px" width="100%" allowFullScreen={false}/>
                <div className="row">
                    <br></br>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        {(this.context.dataExists ?
                        <button type="button" className="btn btn-primary btn-block" id="togglerecords" onClick={this.context.toggleRecords}>Toggle Record Display</button> : "")}
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