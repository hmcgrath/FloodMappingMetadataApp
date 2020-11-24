import React, { Component } from 'react';
import axios from 'axios';
import HeatmapDataContext from '../contexts/heatmapdata';
import { ListGroup } from 'react-bootstrap';
import { Button} from 'react-bootstrap'; 
import aliasMap from '../columnNames.js';

class HeatmapSearch extends Component {
    static contextType = HeatmapDataContext; 
    state = { removed: [], data: {rows: []}, list: [] };


    componentDidMount() {    
        axios.get('api/columns')
        .then((res) => {
            this.setState({data: res.data}); 
        });
    }

    removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 1; i--) {
            selectElement.remove(i);
        }
    }

    removeColumn(e) {
        var temp = this.state.removed;
        temp.push(e.target.parentNode.id.substring(11));
        this.setState({removed: temp});
    }

    categoryChanged(i) {         
        var column = document.getElementById(`searchCategory${i}`).value;
        var number = false;
        for (let j = 0; j < this.state.data.rows.length; j++) {
            //console.log(this.state.data.rows[j].data_type);
            if (this.state.data.rows[j].column_name === column) {
                if (this.state.data.rows[j].data_type === "numeric" ||
                    this.state.data.rows[j].data_type === "integer" ||
                    this.state.data.rows[j].data_type === "smallint") {
                        number = true;
                }
                break;
            }
        }

        if (number) {
            document.getElementById(`searchTerm${i}`).classList.add("d-none");
            document.getElementById(`modalNumericFilter${i}`).classList.remove("d-none");
        } else {
            document.getElementById(`searchTerm${i}`).classList.remove("d-none");
            document.getElementById(`modalNumericFilter${i}`).classList.add("d-none");
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
                if (!inList && typeof(this.context.data[j][column]) === "boolean") {
                    let option = document.createElement("option");                    
                    option.value = this.context.data[j][column].toString();
                    option.text = this.context.data[j][column].toString();
                    option.key = j;
                    option.title = this.context.data[j][column].toString();
                    added.push(this.context.data[j][column]);
                    document.getElementById(`searchTerm${i}`).add(option);
                } else if (!inList && this.context.data[j][column]) {
                    let option = document.createElement("option");                    
                    option.value = this.context.data[j][column];
                    option.text = this.context.data[j][column];
                    option.key = j;
                    option.title = this.context.data[j][column];
                    added.push(this.context.data[j][column]);
                    document.getElementById(`searchTerm${i}`).add(option);
                }
            }   
        } 
    }

    addColumn() {
        console.log(this.state.data.rows);
        var temp = this.state.list;
        let listIndex = temp.length;       
        let columnSel = (
            <div id={`modalColumnSel${listIndex}`} className="col-lg-5 col-md-12 col-sm-12">
                <select defaultValue="Filter Column..." id={`searchCategory${listIndex}`} 
                    onChange={() => {this.categoryChanged(listIndex);}} 
                    className="browser-default custom-select"
                    style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%"}}>
                    <option value="Filter Column...." disabled>Filter Column....</option>
                    {this.state.data.rows.map((value, index) => 
                    ( 
                        <option key={index} title={value.column_name} value={value.column_name}>{aliasMap[value.column_name]}</option>
                    )).sort((a,b) => {
                        if(aliasMap[a.props.value] === aliasMap[b.props.value]) {
                            return 0;
                        }
                        if (aliasMap[a.props.value] > aliasMap[b.props.value]) {
                            return 1;
                        }
                        return -1;}
                    ).sort((a,b) => {
                        if(aliasMap[a.props.value][0] === aliasMap[b.props.value][0]) {
                            return 0;
                        }
                        if (aliasMap[a.props.value][0] === "(" && aliasMap[b.props.value][0] !== "(") {
                            return 1;
                        }
                        return -1;
                    })}
                </select>  
            </div>
        );
        let closeButton = (
            <div id={`modalCloseButton${listIndex}`} className="col-lg-1 col-sm-12">
                <button id={`closeSearch${listIndex}`} onClick={this.removeColumn.bind(this)} type="button" className="close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        );
        let listFilter = (
            <div id={`modalListFiler${listIndex}`} className="col-lg-6 col-md-12 col-sm-12">
                <select id={`searchTerm${listIndex}`} 
                    style={{maxWidth: "100%"}} multiple>                        
                    <option value="Filter Value...." disabled>Filter Value....</option>
                </select>
            </div>
        );
        let numericFilter = (
            <div id={`modalNumericFilter${listIndex}`} className="row col-lg-12 col-md-12 col-sm-12" style={{marginTop: "12px"}}>  
                <div className="col-6">
                    <label>Min:</label>                                             
                    <input id={`searchMin${listIndex}`} type="number"
                        style={{overflow: "hidden", textOverflow: "ellipsis", width: "65%", marginLeft: "10px"}} ></input>
                </div>
                <div className="col-6">
                    <label>Max:</label>                                             
                    <input id={`searchMax${listIndex}`} type="number"
                        style={{overflow: "hidden", textOverflow: "ellipsis", width: "65%", marginLeft: "10px"}} ></input>
                </div>
            </div>
        );
        temp.push(
            <ListGroup.Item key={listIndex}>
                <div className="row">
                    {columnSel}
                    {listFilter}                    
                    {closeButton}
                    {numericFilter}
                </div>
            </ListGroup.Item>);
        this.setState({list: temp}, () => {this.categoryChanged(listIndex)});
    
        
    }

    formatReturn() {
        var returnData = [];
        for (let i = 0; i < this.state.list.length; i++) {            
            if (this.state.removed.indexOf(i.toString()) === -1 ) {
                returnData.push([]);
                var col = document.getElementById(`searchCategory${i}`).value;
                var numeric = document.getElementById(`searchTerm${i}`).classList.contains("d-none");
                if (numeric) {
                    var min = document.getElementById(`searchMin${i}`).value;
                    var max = document.getElementById(`searchMax${i}`).value;
                    if (min === "") {
                        min = null;
                    } else {
                        min = Number(min);
                    }
                    if (max === "") {
                        max = null;
                    } else {
                        max = Number(max);
                    }
                    for (let j = 0; j < this.context.data.length; j++) {
                        if (min && max) {
                            if (this.context.data[j][col] >= min && this.context.data[j][col] <= max) {
                                if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                    returnData[returnData.length-1].push(this.context.data[j]);
                                }
                            }
                        } else if (min) {
                            if (this.context.data[j][col] >= min) {
                                if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                    returnData[returnData.length-1].push(this.context.data[j]);
                                }
                            }
                        } else if (max) {
                            if (this.context.data[j][col] <= max) {
                                if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                    returnData[returnData.length-1].push(this.context.data[j]);
                                }
                            }
                        } else {
                            if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                returnData[returnData.length-1].push(this.context.data[j]);
                            }
                        }
                    }
                } else {
                    //var colValue = document.getElementById(`searchTerm${i}`).value;
                    var select1 = document.getElementById(`searchTerm${i}`);
                    var selected1 = [];
                    for (var k = 0; k < select1.length; k++) {
                        if (select1.options[k].selected) selected1.push(select1.options[k].value);
                    }
                    for (let j = 0; j < this.context.data.length; j++) {
                        if (col === "floodhzdstd") {
                            for (let k = 0; k < selected1.length; k++) {
                                var tempString = selected1[k] + '';
                                selected1[k] = tempString.split(",");
                            }                                                    
                            if (selected1.map(value => JSON.stringify(value)).indexOf(JSON.stringify(this.context.data[j][col])) !== -1) {
                                if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                    returnData[returnData.length-1].push(this.context.data[j]);
                                    continue;
                                }
                            }
                        } else if (col === "extent") {
                            if (this.context.data[j][col] && selected1
                                .indexOf(JSON.stringify(this.context.data[j][col].flat(2)).replace('[', '').replace(']', '')) !== -1) {
                                if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                    returnData[returnData.length-1].push(this.context.data[j]);
                                }
                            }
                        } else {
                            if (typeof(this.context.data[j][col]) === "boolean") {
                                if (selected1.indexOf(this.context.data[j][col].toString()) !== -1) {
                                    if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                        returnData[returnData.length-1].push(this.context.data[j]);
                                    }
                                }
                            } else {                            
                                if (selected1.indexOf(this.context.data[j][col]) !== -1) {
                                    if (returnData[returnData.length-1].indexOf(this.context.data[j]) === -1) {
                                        returnData[returnData.length-1].push(this.context.data[j]);
                                    }
                                }
                            }
                        }                        
                    }
                }
               
            }
        }
        var finalData = [];
        var mode = document.getElementById("andSwitch").checked ? "AND" : "OR";
        if (mode === "OR") {
            for (let i = 0; i < returnData.length; i++) {
                for (let j = 0; j < returnData[i].length; j++) {                    
                    if (finalData.indexOf(returnData[i][j]) === -1) {
                        finalData.push(returnData[i][j]);
                    }
                }
            }
        } else {
            var minLengthIndex = 0;
            for (let i = 0; i < returnData.length; i++) {
                if (returnData[i].length < returnData[minLengthIndex].length) {
                    minLengthIndex = i;
                }
            }
            finalData = returnData[minLengthIndex];
            for (let i = 0; i < returnData.length; i++) {
                if (i !== minLengthIndex) {
                    finalData = finalData.filter(value => returnData[i].includes(value));
                }
            }
        }
        
        this.context.advancedSearch(finalData);

        //Clear query
        //this.setState({removed: [], list: []});
    }

    queryMode() {
        var x = document.getElementById("andSwitch");
        x.labels[0].innerHTML = x.checked ? "Results meet <b>ALL</b> criteria" : "Results meet <b>ANY</b> criteria";
    }
    
    render() {
        var temp = [];
        for (let i = 0; i < this.state.list.length; i++) {
            if (this.state.removed.indexOf(i.toString()) === -1 ) {
                temp.push(this.state.list[i]);
            }
        }
        return (
            <div>
                <header>
                    <h3>Advanced Search</h3>
                </header>
                <div>
                {temp.length > 0 ? "Note: To select multiple values, hold control and click or click and drag" : ""}
                    <ListGroup>
                        {temp}
                    </ListGroup>                    
                </div>
                <footer>                    
                    <div className="custom-control custom-switch row">
                        <input type="checkbox" className="custom-control-input" id="andSwitch" onChange={this.queryMode.bind(this)}></input>
                        <label className="custom-control-label" htmlFor="andSwitch" style={{width: "181px"}}>Results meet <b>ANY</b> criteria</label>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <Button variant="primary" onClick={this.addColumn.bind(this)}>Add Row</Button>
                        </div>
                        <div className="col-6">
                            <Button variant="primary" onClick={this.formatReturn.bind(this)}>Search</Button>
                        </div>
                    </div>
                </footer>
            </div>
            
        )
    }
}

export default HeatmapSearch;