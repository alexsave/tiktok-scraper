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
    if(this.state.all[username]){
      this.setState(state => ({data: state.all[username]}));
      return;
    }

    if(username === '*')
      axios.get(allUrl, {timeout: -1})
        .then(this.handleResponse(username));
    else
      axios.post(url, { username }, {timeout: -1})
        .then(this.handleResponse(username));
  };

  handleResponse = username => res => {
    if(res.data === "Loading user, try again later")
      return;
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
