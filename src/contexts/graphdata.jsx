import React, { Component } from 'react';
import axios from 'axios';


const DataContext = React.createContext();

class DataProvider extends Component {
    state = {  
        dataLoaded: false,
        dataExists: false,
        data: {}, 
        graphTabs: [],
        categories : [
            {name: "Project Category", categoryId: "projectcat", type:"graphable", graphType:"pie", expanded: false}, 
            {name: "Type of Record", categoryId: "typeofrecord", type:"graphable", graphType:"pie", expanded: false}, 
            {name: "Flood Hazard Standard", categoryId: "floodhzdstd", type:"graphable", graphType:"bar", expanded: false},
            {name: "Financial Support", categoryId:"financialsupport", type:"graphable", graphType:"pie", expanded: false}, 
            {name: "Dataset Status", categoryId:"datasetstatus", type:"graphable", graphType:"bar", expanded: false}, 
            {name: "Total Drainage Area Mapped (sq km)", categoryId:"drainagearea", type:"graphable", graphType:"bar", expanded: false},
            {name: "Age of Mapping", categoryId:"lastprojupdate", type:"graphable", graphType:"bar", expanded: false}, 
            {name: "Summary Report Available", categoryId:"summreportavail", type:"graphable", graphType:"pie", expanded: false}, 
            {name: "Updated Since Original", categoryId:"updatesinceorig", type:"graphable", graphType:"pie", expanded: false},
        ],
        toggleCategory: (categoryId) => {
            var resetCategories = this.state.categories; 
            resetCategories.forEach((category) => {
                if (category.categoryId === categoryId) {
                    category.expanded = !category.expanded; 
                }
            });
            this.setState({categories: resetCategories}); 
        },
        reset: () => {
            //send a message to map viewer to clear coordinates
            var map = document.getElementById("FGPV"); 
            map.contentWindow.postMessage("reset map", "*"); 

            //reset the state (but be aware, this action is not instantaneous)
            var resetCategories = this.state.categories; 
            resetCategories.forEach((category) => {
                category.expanded = false; 
            }); 
            this.setState({dataLoaded: false, dataExists: false, data:{}, graphTabs: [], categeories: resetCategories});
        }, 
        toggleRecords: () => {
            var map = document.getElementById("FGPV"); 
            map.contentWindow.postMessage("toggle record", "*"); 
        },
        addGraphTab: (graphName, graphId, graphType) => {
            var newGraphTabs = this.state.graphTabs; 
            //prevent duplicate tabs
            if (newGraphTabs.filter(graphtab => graphtab.graphId == graphId).length === 0) {
                newGraphTabs.push({graphName: graphName, graphId: graphId, graphType: graphType});
                this.setState({graphTabs: newGraphTabs}); 
            }
        }, 
        removeGraphTab: (graphId) => {
            var newGraphTabs = this.state.graphTabs.filter(graphTab => graphTab.graphId !== graphId); 
            this.setState({graphTabs: newGraphTabs}); 
        }
    }

    componentDidMount() {
        window.addEventListener("message", this.handleIframeMessage);
    }
    
    //handles all communication between iframe and app
    handleIframeMessage = (e) => {
        
        //implement source url checking once this is up on a server
        if (e.data['coordinates selected']) {
            var boundingbox = e.data.replace("coordinates selected ", "");
            //axios call to local api
            axios.get('/api', 
                        {params: {
                            "boundingbox" : boundingbox,
                            "formatted" : true
                        }
                    }).then((res) => {
                        //successfully fetching data, need to implement way to verify that entries exist
                        //console.log(res.data); 
                        //update the state
                        //an empty drainagearea dictionary indicates no entries
                        if(Object.keys(res.data.drainagearea).length > 0) {
                            this.setState({dataLoaded: true, data: res.data}, () => {
                                this.setState({dataExists: true}); 
                            }); 
                        }
                        else {
                            this.setState({dataLoaded: true, data: res.data});
                        }
                    }).catch((err) => {
                        console.log(err);
                    }); 
        }
    }

    render() { 
        return (<DataContext.Provider value={this.state}>
                    {this.props.children}
                </DataContext.Provider>);
    }
}

export {DataProvider};
export default DataContext;

