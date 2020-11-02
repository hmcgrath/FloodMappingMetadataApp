import React, { Component } from 'react';
import './App.css';
import {DataProvider} from './contexts/graphdata';
import {HeatmapDataProvider} from './contexts/heatmapdata';
import GraphApplication from './components/graphapplication'
import NavBar from './components/navbar';
import HeatmapApplication from './components/heatmapapplication';
class App extends Component{
  state = {
    mode:"heatmap"
  };

  constructor() {
    super(); 
    this.changeMode = this.changeMode.bind(this); 
  }

  changeMode() {
    var newMode = (this.state.mode === "graph") ? "heatmap" : "graph";
    this.setState({mode: newMode}); 
  }

  renderMode() {
    if (this.state.mode === "graph") {
      return (
        <DataProvider>
          <GraphApplication></GraphApplication>
        </DataProvider>
      );
    }
    else {
      return (
        <HeatmapDataProvider>
          <HeatmapApplication></HeatmapApplication>
        </HeatmapDataProvider>
      );
    }
  }

  render() {
    return (<React.Fragment>
              <NavBar onButtonClick={this.changeMode}>
                {(this.state.mode === "graph") ? "Map By Polygon": "Map by Selected Area"}
              </NavBar>
              {this.renderMode()}
            </React.Fragment>);
  }
}

export default App;
