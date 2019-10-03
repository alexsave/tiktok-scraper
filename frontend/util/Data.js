import axios from 'axios';
import React, {Component} from 'react';

//consider using sockets, as these requests can take a while
const url = 'http://localhost:3001/username';
const allUrl = 'http://localhost:3001/all';

export const DataContext = React.createContext({});

/**
 * Fuck it, this will handle loading from the server
 */
export class Data extends Component{
  constructor(props){
    super(props);

    //this will keep yet another map of username => data
    //data is the current shit
    this.state = {
      all: {},
      data: []
    };
    this.fetchData('qzim');
  }

  fetchData = username => {
    if(this.state.all[username])
      this.setState(state => ({data: state.all[username]}));

    if(username === '*')
      axios.get(allUrl, {timeout: -1})
        .then(this.handleResponse(username));
    else
      axios.post(url, { username }, {timeout: -1})
        .then(this.handleResponse(username));
  };

  handleResponse = username => res => {
    this.state.all[username] = res.data;
    this.setState({data: res.data});
  };

  render() {
    const {children} = this.props;

    return (
      <DataContext.Provider
        value={{
          fetchData: this.fetchData,
          getData: this.state.data
        }}
      >
        {children}
      </DataContext.Provider>
    );
  }
}

export const DataConsumer = DataContext.Consumer;

/*const weekdayName = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

class DataProvider{
  root;

  constructor(div){
    this.root = div;
    this.root.style.display = 'flex';
    this.root.style.flexWrap = 'wrap';
    if(username === '*')
      axios.get(allUrl, {timeout: -1})
        .then(res => this.graphResponse(res.data));
    else
      axios.post(url, { username }, {timeout: -1})
        .then(res => this.graphResponse(res.data));
  }

  //we have the data in the browser
  graphResponse = res => {
    res.forEach(vid => vid.uploadDate*= 1000);
    //first one, let's plot date+time vs likes
    this.timeline(res);

    //time of day canvas
    this.timeOfDayGraph(res);

    for(let i = 0; i < 7; i++)
      this.dayOfWeekGraph(i, res);

  };

  timeline = res => {
    const likeData = res.map(vid => ({ x: new Date(vid.uploadDate), y: vid.likes }));
    console.log(likeData);
    this.genericGraph(likeData, 'date');
  };

  timeOfDayGraph = res => {
    const likeData = res.map(vid => ({
      x: this.unixToSeconds(vid.uploadDate),
      y: vid.likes
    }));

    this.genericGraph(likeData, 'time');
  };

  dayOfWeekGraph = (day, res) => {
    const filtered = res.filter(vid => new Date(vid.uploadDate).getDay() === day);
    const likeData = filtered.map(vid => ({
      x: this.unixToSeconds(vid.uploadDate),
      y: vid.likes
    }));

    this.genericGraph(likeData, weekdayName[day]);
  };

  genericGraph = (likeData, title) => {
    const container = document.createElement('div');
    container.style.height = '500px';
    container.style.width = '1000px';
    const canvas = document.createElement('canvas');
    container.append(canvas);
    this.root.append(container);
    let ctx = canvas.getContext('2d');

    const config = this.makeConfig(likeData);
    config.options.scales.xAxes[0].scaleLabel.labelString = title;

    new Chart(ctx, config);
  };

  makeConfig = (likeData) => {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'likes',
          data: likeData
        }]
      },
      options: {
        title: {
          text: 'ass'
        },
        scales: {
          xAxes: [{
            type: 'time',
            scaleLabel:{
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]
        }
      }
    };
  }

}

export default DataProvider;*/
