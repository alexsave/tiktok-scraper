import React, {Component} from 'react';
import {Scatter} from 'react-chartjs-2';
import {DataConsumer} from "../util/Data";

//setFullYear(2000)
//setMonth(0)
//setDate(1)
const unixToSeconds = unix => {
  let dt = new Date(unix);
  let res = (dt.getUTCSeconds() + 60* dt.getUTCMinutes() + 60*60 *dt.getUTCHours())*1000;
  //this is due to gmt vs est
  if(res < 5*60*60*1000)
    res += 24*60*60*1000;
  return res;
};

/*const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(75,192,192,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [65, 59, 80, 81, 56, 55, 40]
    }
  ]
};*/

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
            //the options are really dumb, don't worry too much about them
            return <Scatter
              data={{
                datasets:[{label: 'likes', data:data,
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
                }]
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
