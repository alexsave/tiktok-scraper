import React, {Component} from 'react';
import {DataConsumer} from "../util/Data";

class Input extends Component{
  constructor(props){
    super(props);

    this.state = {
      username: 'qzim',
    };
  }

  render(){
    return <div>
      <input value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
      <DataConsumer>
        {context => <button onClick={() => context.fetchData(this.state.username)}/>}
      </DataConsumer>
    </div>
  };
}

export default Input;
