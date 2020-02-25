import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar'; 
import Nav from 'react-bootstrap/Nav'; 
import { Form, FormControl, FormLabel, FormGroup } from 'react-bootstrap';

const NavBar = (props) => {
    return(
        <Navbar bg="primary" variant="dark" expand="lg">
            <Navbar.Brand href="#">Flood Mapping Metadata Portal</Navbar.Brand>
            <Navbar.Toggle aria-controls="collapseNav"/>
            <Navbar.Collapse id="collapseNav">
                <Nav className="navigation mr-auto">
                    <Nav.Link href="/" style={{color:"white"}}>Submit Data</Nav.Link>
                    <Nav.Link href="/analytics" style={{color:"white"}}>View Data</Nav.Link>
                </Nav>
                <Nav className="mr-sm-2">
                    <button type="button" className="btn btn-success" onClick={props.onButtonClick}>{props.children}</button>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );

}

export default NavBar;