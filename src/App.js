import React, { Component } from 'react';
import './App.css';
import {DataProvider} from './data';
import LoadingApplication from './loadingapplication';
class App extends Component{

  render() {
    return (
        <DataProvider>
          <LoadingApplication></LoadingApplication>
        </DataProvider>
    );
  }
}

export default App;
