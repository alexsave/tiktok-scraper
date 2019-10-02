const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

require('./cleanup').Cleanup(() => {
  if(loadedCache)
    fs.writeFileSync(FILE, JSON.stringify(map));
});

//the master array of all shit
let loadedCache = false;
const loading = {};
let map = {};
const FILE = './stats.json';

const extractItems = () => {
  const extractedElements = document.querySelectorAll('._video_feed_item a');
  const items = [];
  for (let element of extractedElements)
    items.push(element.href);
  return items;
};

const scrollDown = async (page, scrollDelay) => {
  let newHeight, oldHeight = await page.evaluate('document.body.scrollHeight');
  while(true){
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitFor(1000 + Math.random()*(scrollDelay-1000));

    newHeight = await page.evaluate('document.body.scrollHeight');
    if(oldHeight >= newHeight)
      break;
    oldHeight = newHeight;
  }
};

/*
  Scroll down and use a function to get all video urls
 */
const scrapeScrollItems = async (
  page,
  extractItems,
  scrollDelay = 1000,
) => {
  await scrollDown(page, scrollDelay);
  return await page.evaluate(extractItems);
};

/*
  Let's just intercept the requests
 */
const getScrollVidData = async (page, username, res) => {
  const vidData = {};
  await page.setRequestInterception(true);
  console.log('intercepting now');

  //let p = new Promise(function(p1: (value?: (PromiseLike<T> | T)) => void,p2: (reason?: any) => void){});
  page.on('request', request => request.continue());
  page.on('response', response => responseIntercept(response, vidData, username, page, saveData, res));
  await page.goto('https://www.tiktok.com/@' + username,{
    waitUntil: 'load', timeout: 0
  });

  await scrollDown(page, 1000);
  //await page.waitForResponse(finalResponse);

  //await page.setRequestInterception(false);
};

const saveData = async (data, page, username, res) => {
  await page.setRequestInterception(false);

  let finalUserData = Object.keys(data).map(key => data[key]);
  console.log(finalUserData);

  map[username] = {timestamp: new Date().getTime(), data: finalUserData};
  res.send(finalUserData);

  await page.browser().close();
};

/*
  Some tiktok requests come back in a format that makes it very easy to get video info
 */
const responseIntercept = async (response, store, username, page, callback, res) => {
  if(!(response.url().startsWith('https://www.tiktok.com/share')))
    return;
  const text = await response.text();
  const json = JSON.parse(text);

  if(!(json.body.itemListData))
    return;
  console.log('waht the fuck');
    //doneFlag.done = true;
  //console.log(json.body.itemListData);
  json.body.itemListData.forEach(item => {
    const {id, text, createTime, diggCount, shareCount, commentCount} = item.itemInfos;
    store[id] = {
      url: 'https://www.tiktok.com/@' + username + '/video/' + id,
      uploadDate: createTime,
      likes: parseInt(diggCount),
      comments: parseInt(commentCount),
      shareCount: parseInt(shareCount),
      title: text
    };
  });

  console.log(json.body.hasMore);
  if(!json.body.hasMore)
    callback(store, page, username, res);

};


/*
  Tiktok videos have timestamps on the video page if you look closely
 */
const moreStats = async (page, url, statsDelay) => {
  await page.goto(url, {
    waitUntil: 'load', timeout: 0
  });
  await page.waitFor(100 + Math.random()*(statsDelay-100));

  const videoObject = await page.evaluate(() => JSON.parse(document.getElementById('videoObject').innerText));

  return {
    url,
    uploadDate: new Date(videoObject.uploadDate).getTime(),
    likes: parseInt(videoObject.interactionCount),
    comments: parseInt(videoObject.commentCount),
    title: videoObject.name
  };
};

const getUserData = async (username, res) => {
  loading[username] = true;
  //check the cache
  const cached = map[username];
  if(cached){
    //if(new Date().getTime() - cached.timestamp <= 1000*60*60*24)
    //return cached.data;
    res.send(cached.data);
  }

  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0');
  await page.setViewport({width: 1280, height: 926});

  // Navigate to the demo page.
  /*await page.goto('https://tiktok.com/@' + username,{
    waitUntil: 'load', timeout: 0
  });*/

  /*let vo = */ await getScrollVidData(page, username);
  //console.log(vo);
  //map[username] = {timestamp: new Date().getTime(), data: vo};
  return;

  // Scroll and extract items from the page.
  let urls = await scrapeScrollItems(page, extractItems);
  urls = urls.reverse();

  let videoObjects = [];
  //urls.map(url => await moreStats(page, url));
  let i = 0;
  for(let url of urls){
    i += 1;
    console.log(username, (i/urls.length*100).toString().substring(0,5)+'%');
    let obj;
    try{
      obj = await moreStats(page, url, 300 + urls.length);
    }
      //sometimes tiktok says no more, so just save what we have
    catch(err){
      console.log(username, 'aborting and saving');
      break;
    }
    videoObjects.push(obj);
  }

  map[username] = {timestamp: new Date().getTime(), data: videoObjects};

  // Close the browser.
  await browser.close();
  return videoObjects;
};

const loadCache = file => {
  try{
    let raw = fs.readFileSync(file);
    map = JSON.parse(raw.toString());
  }
  catch(err){console.log(err);}
  loadedCache = true;
  for(let u of Object.keys(map))
    console.log(u);
};

loadCache(FILE);

//now begins the server part
//consider moving everythign above
app.use(cors());
app.use(express.json());

app.post('/username', (req, res) => {
  const username = req.body.username;
  console.log('get', username);
  if(loading[username]){
    res.send('Loading user, try again later');
    return;
  }
  loading[username] = true;
  //cosider passing res to the get userdata
  getUserData(username, res).then(result =>{
      loading[username] = false;
      res.send(result);
    }
  );
});

//get all timestamps we have in memory, regardless of user
app.get('/all', (req, res) => {
  console.log('get *');
  const arrays = Object.values(map).map(user => user.data);
  const final = [].concat(...arrays);

  res.send(final);
});

app.listen(port, () => console.log(`listening on port ${port}`));


process.stdin.resume();
