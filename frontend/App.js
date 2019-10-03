import React, {Component} from 'react';
import BaseGraph from "./components/BaseGraph";
import {Data} from "./util/Data";
import Input from "./components/Input";

class App extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (<Data>
      <Input/>
      <BaseGraph xTitle='Date' filter={vid => ({ x: new Date(vid.uploadDate), y: vid.likes })}/>
    </Data>);
  }
}

export default App;
