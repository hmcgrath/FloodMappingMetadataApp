import React, { Component } from 'react';
import HeatmapCategory from './heatmapcategory'; 
import ListGroup from 'react-bootstrap/ListGroup'; 
import HeatmapDataContext from '../contexts/heatmapdata'; 
import HeatmapSearch from './heatmapsearch';

class HeatmapCategoryList extends Component {
    static contextType = HeatmapDataContext; 

    state = {
        categories: this.context.categories,
        show: false
    };

    

    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

    handleSearchClose = (e) => {
        console.log(e);
        this.setState({show: false});
    }

    render() { 
        return (
            <div>
                <ListGroup style={{height: "100%"}}>
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
                            <button type="button" className="btn btn-primary btn-block" onClick={this.handleShow}>Advanced</button>                            
                        </div>
                    </ListGroup.Item>
                </ListGroup>

                <HeatmapSearch show={this.state.show}
                    handleClose={this.handleClose.bind(this)}
                    handleSearchClose={this.handleSearchClose.bind(this)}></HeatmapSearch>
            </div>
        );
    }
}
 
export default HeatmapCategoryList;