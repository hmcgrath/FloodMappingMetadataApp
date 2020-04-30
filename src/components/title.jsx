import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap'; 

class Title extends Component {
    state = {
        showModal: false
    }

    handleClose = () => {
        this.setState({showModal: false}); 
    }

    handleShow = () => {
        this.setState({showModal: true});
    }

    render() { 
        const {mode} = this.props; 
        var innerText; 
        var subHeading; 
        if (mode === "graph") {
            innerText = `A user first selects an area of interest to query the database. This is performed by the user 'clicking' on the map twice - to represent the extents of the area of interest (e.g.: upper left corner and lower right corner). 
            This extent will then show up on the screen. Users can re-select the extent by selecting 'Reset Map' and clicking on the screen. The buttons on the right provide information in the window which summarizes the database data in the selected area. As well, a Graph is created, either bar chart or histogram, to visually represent this data. It opens as a Tab at the top of the map.`
            subHeading = "Click on Map to Set Extent and Filter"
        }
        else {
            innerText = `This interactive map allows a user to visualize and query available able data in the database based on the selected category. Fields with the name “Heatmap’ contain thematic maps, with the values from the associated records grouped by numeric ranges and coloured. Fields/Labels with the name “Map’ contain datasets with multiple categories. These are coloured by the number of records in each area. Click on any of the areas which are coloured to view a pie chart which illustrates the distribution of data of categories in this polygon. Users can view the individual footprints of the stored maps (where available by clicking on the button). In addition, a csv file can be downloaded which contains all the attribute fields. The age of mapping shown is the mean rounded to the nearest decade. The total drainage area mapped is generated from grouping CAs into five equally spaced intervals determined by the CA with the maximum area mapped.`
            subHeading = "View Data By";
        }

        return (
            <React.Fragment>
                <p><h1>Flood Hazard Mapping Analytics <a href="#" onClick={this.handleShow} style={{fontSize: "14px"}}>About</a></h1></p>
                <p><h4>{subHeading}</h4></p>

                <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>About</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {innerText}  
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
}
 
export default Title;