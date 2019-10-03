import React, {Component} from 'react';
import {DataConsumer} from "../util/Data";

class Input extends Component{
  constructor(props){
    super(props);

    this.state = {
      username: '',
    };
    this.handleSubmit.bind(this);
  }

  handleSubmit(callback){
    console.log(callback);
    console.log(this.state.username);
  }

  render(){
    return <div>
      <input onChange={e => this.setState({username: e.target.value})}/>
      <DataConsumer>{
          context => <button onClick={() => context.fetchData(this.state.username)}/>
        }
      </DataConsumer>
    </div>
  };
}

export default Input;
