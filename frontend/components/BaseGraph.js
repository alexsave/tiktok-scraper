import React, {Component} from 'react';
import {Scatter} from 'react-chartjs-2';
import {DataConsumer} from "../util/Data";
import {Cut, DataTransform, RoundTime} from "../util/StatsFunctions";

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
      map: props.map || (vid => vid),
      filter: props.filter || (vid => vid),
      xTitle: props.xTitle
    };
  }

  render() {
    return (
      <div style={{width: '1100px', height: '600px'}}>
        <DataConsumer>
          {context => {
            //to get rid of musical.ly shit
            const tiktok = context.getData.filter(vid => vid.uploadDate > new Date('2 August 2018').getTime());
            const cutted = Cut(tiktok, context.getMinLikes);
            const rounded = RoundTime(cutted, context.getTimeIncrement);
            const filtered = rounded.filter(this.state.filter);
            const mapped = filtered.map(this.state.map);
            const data = DataTransform(mapped, context.getTransformType);
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
