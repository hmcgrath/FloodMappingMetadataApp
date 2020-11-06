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
        } else {
            const {searchable, disabled, categoryId} = this.props; 
            const {data, setOption} = this.context; 
            //ensure that the select list has unique options
            const options = [...new Set(data.map((record) => record[searchable]))]; 
            return(
                <select className="browser-default custom-select" 
                        defaultValue={"Search by...."}
                        disabled={disabled} onChange={(evt) => {
                    evt.persist(); 
                    setOption(evt.target.value, categoryId);                    
                }}>
                    <option value="Search by...." disabled>Search by....</option>
                    {options.map((opt, index) => (
                        <option key={index} value={opt}>{opt}</option>
                    ))}
                </select>    
            );
        }
    }

    render() { 
        return (  
            <ListGroup.Item>
                <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        {this.props.categoryName}
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        {this.getButton()}
                    </div>
                </div>
            </ListGroup.Item>
        );
    }
}
 
export default HeatmapCategory;