import React, {Component} from 'react';
import BaseGraph from "./components/BaseGraph";
import {Data} from "./util/Data";

class App extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return <Data>
      <BaseGraph/>
    </Data>
  }
}

export default App;
