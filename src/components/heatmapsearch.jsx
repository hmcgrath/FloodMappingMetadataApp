import React, { Component } from 'react';
import axios from 'axios';

class HeatmapSearch extends Component {
    
    state = { data: {rows: []} };

    componentDidMount() {
        axios.get('api/columns')
        .then((res) => {
            this.setState({data: res.data}); 
            console.log(res);
        });
    }
    
    render() {

        return (
            <div>
                <select id="search1" onChange={this.props.handleSearchClose}>
                    {this.state.data.rows.map((value, index) => 
                    ( 
                        <option key={index} value={value.column_name}>{value.column_name}</option>
                    ))}
                </select>  
            </div>
        )
    }
}

export default HeatmapSearch;