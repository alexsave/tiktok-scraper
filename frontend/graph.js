import axios from 'axios';
import Chart from 'chart.js';

const url = 'http://localhost:3001/username';
const username = 'qzim';

const weekdayName = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

class TikGraph{
  root;

  constructor(div){
    this.root = div;
    axios.post(url, { username })
      .then(res => this.graphResponse(res.data))
  }

  unixToSeconds = unix => {
    let dt = new Date(unix);
    let res = (dt.getUTCSeconds() + 60* dt.getUTCMinutes() + 60*60 *dt.getUTCHours())*1000;
    //this is due to gmt vs est
    if(res < 5*60*60*1000)
      res += 24*60*60*1000;
    return res;
  };

  //we have the data in the browser
  graphResponse = res => {
    console.log(res);
    //first one, let's plot date+time vs likes
    this.timeline(res);

    //time of day canvas
    this.timeOfDayGraph(res);

    for(let i = 0; i < 7; i++)
      this.dayOfWeekGraph(i, res);

  };

  timeline = res => {
    const likeData = res.map(vid => ({ x: new Date(vid.uploadDate), y: vid.likes }));
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
    const canvas = document.createElement('canvas');
    this.root.append(canvas);
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

export default TikGraph;
