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
      <BaseGraph/>
    </Data>);
  }
}

export default App;
