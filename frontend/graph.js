import axios from 'axios';
import Chart from 'chart.js';

const url = 'http://localhost:3001/username';
const username = 'qzim';
class TikGraph{
  root;
  constructor(div){
    this.root = div;
    axios.post(url, { username })
      .then(res => this.graphResponse(res.data))
  }

  unixToSeconds = unix => {
    let dt = new Date(unix);
    return (dt.getSeconds() + 60* dt.getMinutes() + 60*60 *dt.getHours())*1000;
  };



  //we have the data in the browser
  graphResponse = res => {
    console.log(res);
    //first one, let's plot date+time vs likes
    const canvas = document.createElement('canvas');
    this.root.append(canvas);
    let ctx = canvas.getContext('2d');

    const likeData = res.map(vid => ({ x: new Date(vid.uploadDate), y: vid.likes }));
    const commentData = res.map(vid => ({ x: new Date(vid.uploadDate), y: vid.comments }));

    let chart = new Chart(ctx, this.makeConfig(likeData, commentData));

    //time of day canvas
    const todCanvas = document.createElement('canvas');
    this.root.append(todCanvas);
    ctx = todCanvas.getContext('2d');

    const likeDataTod = res.map(vid => ({
      x: this.unixToSeconds(vid.uploadDate),
      y: vid.likes
    }));
    const commentDataTod = res.map(vid => ({ x: this.unixToSeconds(vid.uploadDate), y: vid.comments }));

    let todConfig = this.makeConfig(likeDataTod, commentDataTod);
    //todCanvas.options.scales.xAxes[0].time = {
      //displayFormats: {}
    //}
    chart = new Chart(ctx, this.makeConfig(likeDataTod, commentDataTod));




  };

  makeConfig = (likeData, commentData) => {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'likes',
          data: likeData
        },
          {
            label: 'comments',
            data: commentData
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
