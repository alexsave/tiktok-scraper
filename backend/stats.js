const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

//the master array of all shit
let loadedCache = false;
const loading = {};
let map = {};
const FILE = './data.json';

const getUserData = async (username, res) => {
  loading[username] = true;
  //check the cache
  const cached = map[username];
  if(cached){
    res.send(Object.values(cached.tiktoks));
    console.log(`sent ${username}`);
    loading[username] = false;
    return;
  }
  else{
    res.send([]);
    return;
  }
};

const loadCache = file => {
  try{
    let raw = fs.readFileSync(file);
    map = JSON.parse(raw.toString());
  }
  catch(err){}
  //so we currenlty save time as a string
  Object.keys(map).forEach(key =>
    Object.keys(map[key]['tiktoks']).forEach(vid =>
      map[key]['tiktoks'][vid].time = parseInt(map[key]['tiktoks'][vid].time)*1000
    )
  );
  loadedCache = true;
  for(let u of Object.keys(map))
    console.log(u);
};

loadCache(FILE);

//now begins the server part
//consider moving everything above
app.use(cors());
app.use(express.json());

app.post('/username', (req, res) => {
  const username = req.body.username;
  console.log('get', username);
  if(loading[username]){
    res.send([]);
    return;
  }
  loading[username] = true;

  getUserData(username, res);
});

//get all timestamps we have in memory, regardless of user
app.get('/all', (req, res) => {
  console.log('get *');
  const arrays = Object.values(map).map(user => Object.values(user.tiktoks));
  const final = [].concat(...arrays);

  res.send(final);
  console.log('sent *');
});

app.listen(port, () => console.log(`listening on port ${port}`));
