import React, { Component } from 'react';
import axios from 'axios';
import HeatmapDataContext from '../contexts/heatmapdata';
import { ListGroup } from 'react-bootstrap';

class HeatmapSearch extends Component {
    static contextType = HeatmapDataContext; 
    state = { listIndex: 0, data: {rows: []}, list: [] };

    componentDidMount() {    
        axios.get('api/columns')
        .then((res) => {
            this.setState({data: res.data}, () => {this.addColumn(-1)}); 
        });
    }

    removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 1; i--) {
            selectElement.remove(i);
        }
    }

    removeColumn(i) {
        var temp = this.state.list;
        temp.splice(i, 1);
        this.setState({list: temp});
    }

    addColumn(i) {
        if (i !== -1) {            
            var column = document.getElementById(`searchCategory${i}`).value;
            this.removeOptions(document.getElementById(`searchTerm${i}`));
            var added = [];
            for (let j = 0; j < this.context.data.length; j++) {
                var inList = false;
                for (let k = 0; k < added.length; k++) {
                    if (JSON.stringify(added[k]) === JSON.stringify(this.context.data[j][column])) {
                        inList = true;
                        break;
                    }
                }
                if (this.context.data[j][column] && !inList) {
                    var option = document.createElement("option");
                    option.value = this.context.data[j][column];
                    option.text = this.context.data[j][column];
                    option.key = j;
                    added.push(this.context.data[j][column]);
                    console.log(this.context.data[j][column]);
                    document.getElementById(`searchTerm${i}`).add(option);
                }
            }
        }

        if (i === this.state.listIndex-1) {
            console.log(this.state.data.rows);
        var temp = this.state.list;
        let listIndex = this.state.listIndex;
        temp.push(
            <ListGroup.Item key={this.state.listIndex}>
                <div className="row">
                    <div className="col-lg-5 col-md-12 col-sm-12">
                        <select defaultValue="Filter Column..." id={`searchCategory${this.state.listIndex}`} 
                            onChange={() => {this.addColumn(listIndex);}} 
                            style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%"}}>
                            <option value="Filter Column...." disabled>Filter Column....</option>
                            {this.state.data.rows.map((value, index) => 
                            ( 
                                <option key={index} value={value.column_name}>{value.column_name}</option>
                            ))}
                        </select>  
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <select defaultValue="Filter Value..." id={`searchTerm${this.state.listIndex}`} 
                            style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%"}}>                        
                            <option value="Filter Value...." disabled>Filter Value....</option>
                        </select>
                    </div>
                    <div className="col-lg-1 col-sm-12">
                        <button onClick={() => {this.removeColumn(listIndex)}}type="button" className="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
            </ListGroup.Item>);
            this.setState({list: temp, listIndex: this.state.listIndex+1});
        }
        
    }
    
    render() {

        return (
            <div>
                <ListGroup>
                    {this.state.list}
                </ListGroup>

                
            </div>
        )
    }
}

export default HeatmapSearch;