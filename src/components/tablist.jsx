import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import FGPVmap from './FGPVmap';
import DataContext from '../contexts/graphdata';
import Plotly from 'plotly.js/dist/plotly-basic';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);  

class TabList extends Component {
    static contextType = DataContext; 
    
    state = {
        key: "FGPV"
    }
    

    setKey = (key) => {
        this.setState({key: key}); 
    }

    //move FGPV component to the first tab and dynamically render rest of tabs
    render() { 
        
        
        return (<Tabs defaultActiveKey="FGPV" activeKey={this.state.key} onSelect={(key) => this.setKey(key)}>
            <Tab title="FGPV" eventKey="FGPV">
                <FGPVmap></FGPVmap>
            </Tab>
            {this.context.graphTabs.map(graph =>
                <Tab key={graph.graphId}
                    eventKey={graph.graphId}
                    title={<span>
                            {graph.graphName}
                            <button className="close" 
                                    aria-label="Close"
                                    style={{paddingLeft: "5px"}} 
                                    type="button"
                                    onClick={(evt) => {
                                        //prevents parent onclick event from registering
                                        evt.stopPropagation(); 
                                        this.context.removeGraphTab(graph.graphId); 
                                        this.setKey("FGPV"); 
                                    }}>×</button> 
                          </span>}>
                    {this.createGraph(graph.graphType, graph.graphId, graph.graphName)}
                </Tab>
            )}  
        </Tabs>);
        
    }

    //function to create the graph 
    createGraph(graphType, graphId, graphName) {
        if(graphType === "pie") {
            return (
                <Plot data={[
                    {
                        values: Object.values(this.context.data[graphId]),
                        labels: Object.keys(this.context.data[graphId]),
                        type: "pie",
                        textinfo: "label+percent", 
                        textposition:"outside",
                        automargin: true
                    }
                ]}
                    layout={{title: graphName, height:400, width:800}}>
                </Plot>
            );
        }
        else if (graphType === "bar") {
            return (
                <Plot data={[
                    {
                        x: Object.keys(this.context.data[graphId]),
                        y: Object.values(this.context.data[graphId]),
                        type: "bar",
                        width: 0.5
                    }
                ]}
                    layout={{title: graphName, height:400, width:800}}>
                </Plot>
            );
        }

    }
}
 
export default TabList;