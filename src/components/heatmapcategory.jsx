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
                <button type="button" className="btn btn-primary btn-block" onClick={() => this.context.heatmap(this.props.categoryName)}>Show on Map</button>
            );
        }
        if (this.props.type === "heatmappable") {
            return (
                <button type="button" className="btn btn-primary btn-block" onClick={() => this.context.heatmap(this.props.categoryName)}>Heatmap</button>
            );
        }
        else {
            const {searchable} = this.props; 
            const {data} = this.context; 
            //ensure that the select list has unique options
            const options = [...new Set(data.map((record) => record[searchable]))]; 
            return(
                <select className="browser-default custom-select">
                    <option value="" disabled selected>Search by....</option>
                    {options.map((opt) => (
                        <option value={opt}>{opt}</option>
                    ))}
                </select>    
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