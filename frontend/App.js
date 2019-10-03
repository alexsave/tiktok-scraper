import React, {Component} from 'react';
import BaseGraph from "./components/BaseGraph";
import {Data} from "./util/Data";
import Input from "./components/Input";
import {UnixToSeconds, UnixToSecondsOfWeek, WeekdayName} from "./util/Conversion";

class App extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (<Data>
      <Input/>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
        <BaseGraph xTitle='Date' map={vid => ({ x: new Date(vid.uploadDate), y: vid.likes })}/>
        <BaseGraph xTitle='Time of Week' map={vid => ({ x: UnixToSecondsOfWeek(vid.uploadDate), y: vid.likes })}/>
        <BaseGraph xTitle='Time of Day' map={vid => ({ x: UnixToSeconds(vid.uploadDate), y: vid.likes })}/>
        {
          [0,1,2,3,4,5,6].map(i =>
            <BaseGraph key={WeekdayName[i]} xTitle={WeekdayName[i]}
                       filter={vid => new Date(vid.uploadDate).getDay() === i}
                       map={vid => ({x: UnixToSeconds(vid.uploadDate), y: vid.likes})}/>
          )
        }
      </div>
    </Data>);
  }
}

export default App;
