import axios from 'axios';

const url = 'http://localhost:3001/username';
const username = 'qzim';
class TikGraph{
  root;
  constructor(div){
    this.root = div;
    axios.post(url, { username })
      .then(this.graphResponse)



  }

  graphResponse = res => {
    console.log(res);

  };

}

export default TikGraph;
