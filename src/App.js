import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FGPVmap from './components/FGPVmap';
import CategoryList from './components/categorylist'; 
import {DataProvider} from './data';
import NavBar from './components/navbar'
import TabList from './components/tablist';
class App extends Component{
  state = {

  };

  render() {
    return (
        <DataProvider>
          <div className="App">
            <NavBar></NavBar>
            <div className="wrapper" style={{marginLeft:"40px", marginTop:"15px", marginRight:"30px"}}> 
              <div className="headers text-left" style={{alignItems:"left"}}>
                <p><h1>Flood Hazard Mapping Analytics</h1></p>
                <p><h4>Filter By</h4></p>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <CategoryList></CategoryList>
                </div>
                <div className="col-lg-8 col-md-6 col-sm-12">
                  <TabList></TabList>
                </div>
              </div>
            </div>
          </div>
        </DataProvider>
    );
  }
}

export default App;
