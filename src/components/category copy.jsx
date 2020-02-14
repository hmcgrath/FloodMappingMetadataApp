import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import DataContext from '../data';

class Category extends Component {
    // name: name of the category
    // type: type of the category (searchable, graphable)
    static contextType = DataContext; 

    state = { 
        buttonEnabled: false,
        collapseEnabled: false,
        expanded: false
    }
    
    constructor(props) {
        super(props);
    }

    render() { 
        const { expanded } = this.state;
        var feature; 
        if (this.props.type == "graphable") {
            feature = <GraphButton onClick={() => this.context.addGraphTab(this.props.categoryName, this.props.categoryId, this.props.graphType)}
                                            disabled={!this.context.dataExists}></GraphButton>
        }
        else {
            feature = <SearchBox></SearchBox>
        }

        //consider raising the state of categories list all the way to the context
        //note we use expanded && this.context.dataLoaded to close the collapsible when reset clicked.
        return (
            <React.Fragment>
                <ListGroup.Item action onClick={() => this.setState({expanded: !expanded})} 
                                aria-controls="collapse-content" 
                                aria-expanded={(expanded && this.context.dataLoaded)} 
                                disabled={!this.context.dataLoaded}>
                    {this.props.categoryName}
                </ListGroup.Item>
                <Collapse in={(expanded && this.context.dataLoaded)}>
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
            </React.Fragment>
        );
    }

}

function GraphButton(props) {
    return (
        <button type="button" className="btn btn-primary btn-block" onClick={props.onClick} disabled={props.disabled}>Create Graph</button>
    );
}

function SearchBox() {
    return (
        <input type="text" maxLength="20" className="form-control" placeholder="Search..."></input>
    );
}


export default Category;