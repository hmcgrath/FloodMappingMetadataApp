import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar'; 
import Nav from 'react-bootstrap/Nav'; 
import { Form, FormControl, FormLabel, FormGroup } from 'react-bootstrap';

const NavBar = () => {
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
                    <Form inline>
                        <FormGroup controlId="modeselector">
                            <FormLabel style={{color:"white", paddingRight: "8px"}}>Mode</FormLabel>
                            <FormControl as="select" className="mr-sm-2">
                                <option>Graphs</option>
                                <option>Heatmaps</option>
                            </FormControl>
                        </FormGroup>
                        
                    </Form>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );

}

export default NavBar;