import React, { Component } from 'react';
import './App.css';
import {DataProvider} from './contexts/graphdata';
import GraphApplication from './components/graphapplication'
import {Form, FormControl, FormLabel, FormGroup} from 'react-bootstrap';
import NavBar from './components/navbar';
class App extends Component{
  state = {
    mode:"graph"
  };

  constructor() {
    super(); 
    this.changeMode = this.changeMode.bind(this); 
  }

  changeMode() {
    var newMode = (this.state.mode === "graph") ? "heatmap" : "graph";
    this.setState({mode: newMode}); 
  }

  render() {
    return (
        <DataProvider>
          <NavBar onButtonClick={this.changeMode}>
            {(this.state.mode === "graph") ? "Change to Heatmap": "Change to Graph"}
          </NavBar>
          <GraphApplication></GraphApplication>
        </DataProvider>
    );
  }
}

export default App;
