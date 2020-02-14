import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar'; 
import Nav from 'react-bootstrap/Nav'; 

const NavBar = () => {
    return(
        <Navbar bg="primary" variant="dark" expand="lg">
            <Navbar.Brand href="#">Flood Mapping Metadata Portal</Navbar.Brand>
            <Navbar.Toggle aria-controls="collapseNav"/>
            <Navbar.Collapse id="collapseNav">
                <Nav className="navigation">
                    <Nav.Link href="/" style={{color:"white"}}>Submit Data</Nav.Link>
                    <Nav.Link href="/analytics" style={{color:"white"}}>View Data</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );

}

export default NavBar;