import React, {Component} from 'react';
import {Scatter} from 'react-chartjs-2';
import {DataConsumer} from "../util/Data";

const pointStyle = {
  fill: false,
  backgroundColor: '#FF0000',
  pointBorderColor: '#FF0000',
  pointBackgroundColor: 'FFAAAAA',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: '#FF0000',
  pointHoverBorderColor: '#AAAAAA',
  pointHoverBorderWidth: 2,
  pointRadius: 2,
  pointHitRadius: 9
};

class BaseGraph extends Component{
  constructor(props){
    super(props);
    this.state = {
      filter: props.filter,
      xTitle: props.xTitle
    };
  }

  render() {
    return (
      <div style={{width: '1000px', height: '500px'}}>
        <DataConsumer>
          {context => {
            let data = context.getData.map(this.state.filter);
            return <Scatter
              data={{
                datasets:[{...pointStyle, label: 'likes', data:data}]
              }}
              options={{ scales: {xAxes:[{type:'time', scaleLabel:{display:true, labelString:this.state.xTitle}}]} }}
            />;
          }}
        </DataConsumer>
      </div>
    );
  }
}

export default BaseGraph;
