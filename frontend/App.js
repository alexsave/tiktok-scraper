import React, {Component} from 'react';
import BaseGraph from "./components/BaseGraph";
import {Data} from "./util/Data";
import Input from "./components/Input";
import {UnixToSeconds} from "./util/Conversion";

class App extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (<Data>
      <Input/>
      <div style={{display: 'flex'}}>
        <BaseGraph xTitle='Date' filter={vid => ({ x: new Date(vid.uploadDate), y: vid.likes })}/>
        <BaseGraph xTitle='Date' filter={vid => ({ x: new Date(vid.uploadDate), y: vid.likes })}/>
      </div>
    </Data>);
  }
}

export default App;
