import React, {Component} from 'react';
import {DataConsumer} from "../util/Data";


class Input extends Component{
  constructor(props){
    super(props);

    this.state = {
      username: 'qzim',
      minLikes: 0
    };
  }

  InputButtons = context => {
    //console.log(context.setMinLikes.toString());
    return <div>
      <input value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
      <button onClick={() => context.fetchData(this.state.username)}>
        Get user info
      </button>
      <input type='number' value={this.state.minLikes} onChange={e =>
        this.setState({minLikes: e.target.value})
      }/>
      <button onClick={() => context.setMinLikes(this.state.minLikes)}>
        Set Min Likes
      </button>

    </div>
  };

  render(){
    return <div>
      <DataConsumer>
        {context => this.InputButtons(context)}
      </DataConsumer>
    </div>
  };
}

export default Input;
