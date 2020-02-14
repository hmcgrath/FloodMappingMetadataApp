import React, { Component } from 'react';
import Category from './category';
import ListGroup from 'react-bootstrap/ListGroup';
import DataContext from '../data';

class CategoryList extends Component {
    static contextType = DataContext; 
    //store all the different categories in state

    //use data from context
    state = {
        categories : [
            {name: "Project Category", categoryId: "projectcat", type:"graphable", graphType:"pie"}, 
            {name: "Type of Record", categoryId: "typeofrecord", type:"graphable", graphType:"pie"}, 
            {name: "Flood Hazard Standard", categoryId: "floodhzdstd", type:"graphable", graphType:"bar"},
            {name: "Financial Support", categoryId:"financialsupport", type:"graphable", graphType:"pie"}, 
            {name: "Dataset Status", categoryId:"datasetstatus", type:"graphable", graphType:"bar"}, 
            {name: "Drainage Area", categoryId:"drainagearea", type:"graphable", graphType:"bar"},
            {name: "Last Project Update", categoryId:"lastprojupdate", type:"graphable", graphType:"bar"}, 
            {name: "Summary Report Available", categoryId:"summreportavail", type:"graphable", graphType:"pie"}, 
            {name: "Updated Since Original", categoryId:"updatesinceorig", type:"graphable", graphType:"pie"},
            {name: "Project ID", categoryId: "projectid", type:"searchable", graphType:"none"},
            {name: "Project Name", categoryId: "projectname", type:"searchable", graphType:"none"},
            {name: "Official Watercourse Name", categoryId:"officialwcname", type:"searchable", graphType:"none"}, 
            {name: "Local Watercourse Name", categoryId:"localwcname", type:"searchable", graphType:"none"}
        ], 

    }

    render() { 

        if (this.context.dataExists) {
            return (  
                <ListGroup>
                    {this.state.categories.filter(category => category.type != "searchable").map(category => 
                        <Category categoryName={category.name}
                                categoryId={category.categoryId}
                                type={category.type}
                                graphType={category.graphType}
                                key={category.categoryId}>
                                {
                                    Object.keys(this.context.data[category.categoryId]).map((key, index) => (       
                                        <ul key={index}>{key} : {this.context.data[category.categoryId][key]}</ul>
                                    ))
                                }
                        </Category>
                    )}
                    {this.state.categories.filter(category => category.type == "searchable").map(category => 
                        <Category categoryName={category.name}
                                    categoryId={category.categoryId}
                                    type={category.type}
                                    graphType={category.graphType}
                                    key={category.categoryId}>
                        </Category>
                  
                    )}
                </ListGroup>
            );
        }
        else {
            return (  
                <ListGroup>
                    {this.state.categories.map(category => 
                        <Category categoryName={category.name}
                                categoryId={category.categoryId}
                                type={category.type}
                                graphType={category.graphType}
                                key={category.categoryId}>
                        </Category>
                    )}
                </ListGroup>
            );
        }
        
    }
}
 
export default CategoryList;