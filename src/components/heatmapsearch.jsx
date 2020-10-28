import React, { Component } from 'react';
import axios from 'axios';

class HeatmapSearch extends Component {
    
    state = { data: null }

    componentDidMount() {
        axios.get('api/columns')
        .then((res) => {
            this.setState({data: res.data}); 
            console.log(res);
        });
    }
    
    render() {

        return (
            <div></div>
        )
    }
}

export default HeatmapSearch;