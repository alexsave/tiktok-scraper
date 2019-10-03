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
      data: [],
      minLikes: 100,
      timeIncrement: 'h',
      transform: 'avg'
    };
    this.fetchData('qzim');
  }

  fetchData = username => {
    if(this.state.all[username]){
      this.manipulationPipeline(this.state.all[username]);
      //this.setState(state => ({data: state.all[username]}));
      return;
    }

    if(username === '*')
      axios.get(allUrl, {timeout: -1})
        .then(this.handleNetworkResponse(username));
    else
      axios.post(url, { username }, {timeout: -1})
        .then(this.handleNetworkResponse(username));
  };

  handleNetworkResponse = username => res => {
    if(res.data === "Loading user, try again later")
      return;
    this.state.all[username] = res.data;
    this.manipulationPipeline(res.data);
  };

  cutoff = data => data.filter(vid => vid.likes >= this.state.minLikes);

  roundTime = data => /*{
    return*/ data.map(vid => {
      const time = new Date(vid.uploadDate);
      if(this.state.timeIncrement !== 's')
        time.setSeconds(time.getSeconds() >= 30? 60: 0);
      if(this.state.timeIncrement === 'h')
        time.setMinutes(time.getMinutes() >= 30? 60: 0);
      return {...vid, uploadDate: time.getTime()};
    })/*;
  }*/;

  //averaging out will combine videos, thus losing invididual video information
  //be careul
  transform = data => {
    if(this.state.transform !== 'avg')
      return data;

    const timeLikes = {};
    data.forEach(vid => {
      if(!timeLikes[vid.uploadDate])
        timeLikes[vid.uploadDate] = [];
      timeLikes[vid.uploadDate].push(vid.likes);
    });

    return Object.keys(timeLikes).map(time => ({
      uploadDate: time,
      likes: timeLikes[time].reduce((a,b) => a+b, 0)/timeLikes[time].length
    }));
  };

  manipulationPipeline = data => {
    const cut = this.cutoff(data);
    const rounded = this.roundTime(cut);
    //const transformed = this.transform(rounded);
    //console.log(transformed);
    this.setState({data: rounded});
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
