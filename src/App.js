import React, { Component } from 'react';
import './App.css';
import {DataProvider} from './data';
import LoadingApplication from './components/graphapplication'
import Form, { FormControl, FormLabel } from 'react-bootstrap';
import NavBar from './components/navbar';
class App extends Component{

  render() {
    return (
        <DataProvider>
          <NavBar></NavBar>
          <LoadingApplication></LoadingApplication>
        </DataProvider>
    );
  }
}

export default App;
