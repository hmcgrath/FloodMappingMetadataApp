import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import DataContext from '../contexts/graphdata';
import Modal from 'react-bootstrap/Modal'; 

class Category extends Component {
    // name: name of the category
    // type: type of the category (searchable, graphable)
    static contextType = DataContext; 

    state = { 
        buttonEnabled: false,
        collapseEnabled: false, 
        showModal: false
    }
    
    constructor(props) {
        super(props);
        this.showWarnModal = this.showWarnModal.bind(this); 
        this.hideWarnModal = this.hideWarnModal.bind(this); 
    }

    showWarnModal() {
        this.setState({showModal: true}); 
    }

    hideWarnModal() {
        this.setState({showModal: false}); 
    }

    render() { 
        const expanded = (this.context.categories.filter(category => category.categoryId === this.props.categoryId)[0].expanded); 
        var feature; 
        if (this.props.type == "graphable") {
            feature = <GraphButton onClick={() => this.context.addGraphTab(this.props.categoryName, this.props.categoryId, this.props.graphType)}
                                            disabled={!this.context.dataExists}></GraphButton>
        }
        else {
            feature = <SearchBox></SearchBox>
        }

        //moved all categories to context.
        return (
            <React.Fragment>
                <ListGroup.Item style={{backgroundColor: "rgb(212, 212, 212)", height: "100%"}}
                                action onClick={this.context.dataExists ? () => this.context.toggleCategory(this.props.categoryId) : this.showWarnModal} 
                                aria-controls="collapse-content" 
                                aria-expanded={(expanded)} 
                                >
                    {this.props.categoryName}
                </ListGroup.Item>
                <Collapse in={(expanded)}>
                    <div className="collapse-content">
                        <div className="card card-body">
                            <div className="row">
                                {this.props.children}
                            </div>
                            <div className="row">
                                {feature}
                            </div>
                        </div>
                    </div>
                </Collapse> 
                <Modal show={this.state.showModal} onHide={this.hideWarnModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Please select an area that contains records. 
                    </Modal.Body>
                </Modal>
            </React.Fragment>
        );
    }
}

const GraphButton = (props) => {
    return (
        <button type="button" className="btn btn-primary btn-block" onClick={props.onClick} disabled={props.disabled}>Create Graph</button>
    );
}

const SearchBox = () => {
    return (
        <select className="browser-default custom-select">
            <option value="" disabled selected>Search by....</option>
        </select>    
    );
}


export default Category;