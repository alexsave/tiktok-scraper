const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const cookiesPath = 'cookies.json';
const jsonfile = require('jsonfile');


//the master array of all shit
let loadedCache = false;
const loading = {};
let map = {};
const FILE = './data.json';

const scrollDown = async (page, scrollDelay, done) => {
  while(done.done === false){
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitFor(2000);
  }
  await page.browser().close();
};

/*
  Let's just intercept the requests
 */
const getScrollVidData = async (page, username, res) => {
  const vidData = {};
  const done = {done:false};
  await page.setRequestInterception(true);

  page.on('request', request => requestIntercept(request, username));
  page.on('response', response => responseIntercept(response, vidData, username, () => {
    done.done = true;
    const finalUserData = Object.keys(vidData).map(key => vidData[key]);
    console.log(finalUserData.length);
    map[username] = {timestamp: new Date().getTime(), data: finalUserData};
    res.send(finalUserData);
    loading[username] = false;
  }));

  await page.goto(`https://www.tiktok.com/@${username}`, {timeout: 0});

  const cookiesObject = await page.cookies();
  jsonfile.writeFile(cookiesPath, cookiesObject, {spaces:2}, () => {});

  //error check
  const error = await page.evaluate(`!!document.querySelector('._error_page_')`);
  if(error){
    done.done = true;
    console.log('error');
    map[username] = {timestamp: new Date().getTime(), data: []};
    res.send([]);
    loading[username] = false;
  }

  await scrollDown(page, 1000, done);
};

/*
    We don't set the right headers, so tiktok thinks it's a bot
*/
const requestIntercept = async (request, username) => {
  if(!(request.url().startsWith('https://www.tiktok.com/share'))){
    request.continue();
    return;
  }
  const headers = {};
  //none of these work
  //headers[':authority'] = 'www.tiktok.com';
  //headers[':method'] = 'GET';
  //headers[':path'] = request.url().substr(22);//cut off https://www.tiktok.com
  //headers[':scheme'] = 'https';
  headers['accept'] = 'application/json, text/plain, */*';
  headers['accept-encoding'] = 'gzip, deflate, br';
  headers['accept-language'] = 'en-US,en;q=0.9';
  //headers['cookie'] = await page.cookies();
  headers['referer'] = `https://www.tiktok.com/@${username}`;
  headers['sec-fetch-mode'] = 'cors';
  headers['sec-fetch-site'] = 'same-origin';
  //headers['user-agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';

  request.continue({headers: headers});
  //request.continue();
  
}

/*
  Some tiktok requests come back in a format that makes it very easy to get video info
  maybe send in callback as a param rather than referencing it as a const
  the callback is for when we're done, and tiktok will actually tell us
 */
const responseIntercept = async (response, store, username, callback) => {
  if(!(response.url().startsWith('https://www.tiktok.com/share')))
    return;
  const text = await response.text();
  const json = JSON.parse(text);

  if(!(json.body.itemListData))
    return;

  json.body.itemListData.forEach(item => {
    const {id, text, createTime, diggCount, shareCount, commentCount} = item.itemInfos;
    store[id] = {
      url: `https://www.tiktok.com/@${username}/video/${id}`,
      uploadDate: parseInt(createTime)*1000,
      likes: parseInt(diggCount),
      comments: parseInt(commentCount),
      shareCount: parseInt(shareCount),
      title: text
    };
  });

  if(!json.body.hasMore)
    callback();
};

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

