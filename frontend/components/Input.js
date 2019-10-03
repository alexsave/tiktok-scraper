import React, {Component} from 'react';
import {DataConsumer} from "../util/Data";

class Input extends Component{
  constructor(props){
    super(props);
    //const value = this.context;

    //const {getData, updateData} = useContext(DataContext);
    this.state = {
      username: '',
    };
    this.handleSubmit.bind(this);

    //console.log(getData());

  }

  handleSubmit(callback){
    console.log(callback);
    console.log(this.state.username);

  }


  render(){
    /*return <div>
      <input onChange={e => this.setState({user: e})}/>
      <button onSubmit={e =>{
        <DataConsumer>
          {context => this.handleSubmit(context.updateData)}
        </DataConsumer>

      }

      }/>
  */
    return <div>
    <input onChange={e => this.setState({username: e})}/>
    <DataConsumer>
      {updateData => {
        return (
          <button onSubmit={() => updateData(this.state.username)}/>
      );
    }}
    </DataConsumer>
    </div>
  };
}

export default Input;
