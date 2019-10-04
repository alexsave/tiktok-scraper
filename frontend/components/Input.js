import React, {Component} from 'react';
import {DataConsumer} from "../util/Data";

class Input extends Component{
  constructor(props){
    super(props);

    this.state = {
      username: '',
      minLikes: 0
    };
  }

  render(){
    return <div style={{position: 'fixed'}}>
      <DataConsumer>
        {context => {
          return <div>
            <input value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
            <button onClick={() => context.fetchData(this.state.username)}>
              Get user info
            </button>
            <input type='number' value={this.state.minLikes} onChange={e => {
              const v = parseInt(e.target.value);
              this.setState({minLikes: v});
              context.setMinLikes(v);
            }}/>
            <button onClick={() => context.setMinLikes(this.state.minLikes)}>
              Set Min Likes
            </button>

            {
              ['s', 'm', 'h'].map(i =>
                <button key={i} onClick={() => context.setTimeIncrement(i)}>
                  {i}
                </button>)
            }
            {
              ['none', 'avg'].map(tt =>
                <button key={tt} onClick={() => context.setTransformType(tt)}>
                  {tt}
                </button>)
            }
          </div>
        }}
      </DataConsumer>
    </div>
  };
}

export default Input;
