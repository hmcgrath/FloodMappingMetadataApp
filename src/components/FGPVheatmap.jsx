import React, { Component } from 'react';
import DataContext from "../contexts/graphdata";

class FGPVheatmap extends Component {

    static contextType = DataContext;

    render() { 
        return (
            <React.Fragment>
                <iframe src="http://localhost:8080/embedheatmap" title="FGPVheatmap" id="FGPV"
                    height="600px" width="100%" allowFullScreen={false}/>
            </React.Fragment>
        );
    }
}

export default FGPVheatmap;