import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import HeatmapDataContext from '../contexts/heatmapdata';

class HeatmapCategory extends Component {
    static contextType = HeatmapDataContext; 
    state = {  }

    //returns the appropriate button or searchbox depending on the
    getButton() {
        if (this.props.type === "graphable") {
            return (
                <button type="button" className="btn btn-primary btn-block" onClick="">Show on Map</button>
            );
        }
        if (this.props.type === "heatmappable") {
            return (
                <button type="button" className="btn btn-primary btn-block" onClick="">Heatmap</button>
            );
        }
        else {
            return(
                <input type="text" maxLength="20" className="form-control" placeholder="Search..."></input>
            );
        }

    }

    render() { 
        return (  
            <ListGroup.Item>
                <div class="row">
                    <div class="col-lg-6 col-md-12 col-sm-12">
                        {this.props.categoryName}
                    </div>
                    <div class="col-lg-6 col-md-12 col-sm-12">
                        {this.getButton()}
                    </div>
                </div>
            </ListGroup.Item>
        );
    }
}
 
export default HeatmapCategory;