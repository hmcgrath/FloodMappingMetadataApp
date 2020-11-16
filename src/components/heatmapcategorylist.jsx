import React, { Component } from 'react';
import HeatmapCategory from './heatmapcategory'; 
import ListGroup from 'react-bootstrap/ListGroup'; 
import HeatmapDataContext from '../contexts/heatmapdata'; 
import HeatmapSearch from './heatmapsearch';

class HeatmapCategoryList extends Component {
    static contextType = HeatmapDataContext; 

    state = {
        categories: this.context.categories,
        mode: "normal"
    };

    toggleMode = () => this.setState({mode: this.state.mode === "normal" ? "advanced" : "normal"});


    render() { 
        return (
            <div>
                {this.state.mode === "normal" ? <ListGroup style={{height: "100%"}}>
                    {this.state.categories.map(category =>
                        <HeatmapCategory categoryName={category.name}
                                        categoryId={category.categoryId}
                                        type={category.type}
                                        graphType={category.graphType}
                                        searchable={category.categoryId}
                                        key={category.categoryId}
                                        disabled={category.disabled}
                                        value={category.value}>
                        </HeatmapCategory>
                    )}
                    <ListGroup.Item>
                        <div className="row">                            
                            <button type="button" className="btn btn-primary btn-block" onClick={this.toggleMode}>Filter View</button>                            
                        </div>
                    </ListGroup.Item>
                </ListGroup>
                :
                <div>
                    <HeatmapSearch></HeatmapSearch>
                    <div className="row">                            
                        <button type="button" className="btn btn-primary btn-block" onClick={this.toggleMode} style={{marginTop: "10px"}}>Normal View</button>                            
                    </div>
                </div>}
            </div>
        );
    }
}
 
export default HeatmapCategoryList;