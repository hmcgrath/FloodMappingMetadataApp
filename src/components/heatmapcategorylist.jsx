import React, { Component } from 'react';
import HeatmapCategory from './heatmapcategory'; 
import ListGroup from 'react-bootstrap/ListGroup'; 
import HeatmapDataContext from '../contexts/heatmapdata'; 
import {Modal, Button} from 'react-bootstrap'; 

class HeatmapCategoryList extends Component {
    static contextType = HeatmapDataContext; 

    state = {
        categories: this.context.categories,
        show: false
    };

    

    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

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
                        <div class="row">                            
                            <button type="button" className="btn btn-primary btn-block" onClick={this.handleShow}>Advanced</button>                            
                        </div>
                    </ListGroup.Item>
                </ListGroup>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Advanced Search</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Ttest search</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleClose}>
                            Search
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
 
export default HeatmapCategoryList;