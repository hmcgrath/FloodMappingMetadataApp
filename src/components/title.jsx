import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap'; 

class Title extends Component {
    state = {
        showModalAbout: false,
        showModalHelp: false
    }

    handleCloseAbout = () => {
        this.setState({showModalAbout: false}); 
    }

    handleShowAbout = () => {
        this.setState({showModalAbout: true});
    }

    handleShowHelp = () => {
        this.setState({showModalHelp: true}); 
    }

    handleCloseHelp = () => {
        this.setState({showModalHelp: false});
    }

    render() { 
        const {mode} = this.props; 
        var subHeading; 
        if (mode === "graph") {
            subHeading = "Click on Map to Set Extent and Filter"
        }
        else {
            subHeading = "View Data By";
        }

        return (
            <React.Fragment>
                <div><h1>Flood Hazard Mapping Analytics <a href="#about" onClick={this.handleShowAbout} style={{fontSize: "14px"}}>About</a>
                    <a href="#help" onClick={this.handleShowHelp} style={{fontSize: "14px", marginLeft: "1em"}}>Help</a></h1></div>
                <h4>{subHeading}</h4>

                <Modal show={this.state.showModalAbout} onHide={this.handleCloseAbout}>
                    <Modal.Header closeButton>
                        <Modal.Title>About</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    This page presents information collected from the metadata portal data entry page. You can view the data by polygons or by selecting an area from the map, see Help on how to toggle between these views. The information can be visualized by heatmaps, graphs and charts. In addition, you can perform queries under the <em> Advanced </em>  button, to narrow down the information presented based on your selected criteria. 
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleCloseAbout}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showModalHelp} onHide={this.handleCloseHelp}>
                    <Modal.Header closeButton>
                        <Modal.Title>Help</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    This page has two maps to query and visualize information. You can toggle between the two of them by clicking on the green button at the top right of the page, "Map by Polygons" / "Map by Selected Area". The <em> Map by Polygons </em> are loaded with the application via  a JSON file of the user defined regions of interest. The <em> Map by Selected Area </em> is user defined by clicking on the map. To define the Selected area, you must click twice, once at the top-left corner of your area of interest, and a second time at the bottom-left corner. You can re-select the area of interest by selecting 'Reset Map'.  
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleCloseHelp}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
}
 
export default Title;