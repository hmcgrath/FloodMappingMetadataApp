import React, { Component } from 'react';
import Category from './category';
import ListGroup from 'react-bootstrap/ListGroup';
import DataContext from '../data';

class CategoryList extends Component {
    static contextType = DataContext; 
    //store all the different categories in state

    //use data from context
    state = {
        categories : this.context.categories 
    }

    renderList(category) {
        var itemsList; 
        if (this.context.dataExists) {
            itemsList =  Object.keys(this.context.data[category.categoryId]).map((key, index) => (       
                <ul key={index}>{key} : {this.context.data[category.categoryId][key]}</ul>
            )); 
        }
        else {
            itemsList=""; 
        }
        return itemsList; 
    }

    render() { 
        return (
            <ListGroup>
                    {this.state.categories.filter(category => category.type != "searchable").map(category => 
                        <Category categoryName={category.name}
                                categoryId={category.categoryId}
                                type={category.type}
                                graphType={category.graphType}
                                key={category.categoryId}>
                                {this.renderList(category)}
                        </Category>
                    )}
                    {this.state.categories.filter(category => category.type == "searchable").map(category => 
                        <Category categoryName={category.name}
                                    categoryId={category.categoryId}
                                    type={category.type}
                                    graphType={category.graphType}
                                    key={category.categoryId}
                                    expanded={category.expanded}>
                        </Category>
                    )}
                </ListGroup>
        );
    }
}
 
export default CategoryList;