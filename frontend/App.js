import React, {Component} from 'react';
import BaseGraph from "./components/BaseGraph";

class App extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return <div>
      <BaseGraph data={{}}/>
    </div>
  }
}

export default App;
