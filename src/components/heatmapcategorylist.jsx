import React, { Component } from 'react';
import HeatmapCategory from './heatmapcategory'; 
import ListGroup from 'react-bootstrap/ListGroup'; 
import HeatmapDataContext from '../contexts/heatmapdata'; 

class HeatmapCategoryList extends Component {
    static contextType = HeatmapDataContext; 

    state = {
        categories: this.context.categories
    }
    render() { 
        return (
            <ListGroup style={{height: "100%"}}>
                {this.state.categories.map(category =>
                    <HeatmapCategory categoryName={category.name}
                                    categoryId={category.categoryId}
                                    type={category.type}
                                    graphType={category.graphType}
                                    key={category.categoryId}>
                    </HeatmapCategory>
                )}
            </ListGroup>
        );
    }
}
 
export default HeatmapCategoryList;