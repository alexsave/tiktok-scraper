const puppeteer = require('puppeteer');
const fs = require('fs');

//the master array of all shit
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
  minItemCount,
  scrollDelay = 1000,
) => {
  let items = [];
  do{
    await scrollDown(page, scrollDelay);
    items = await page.evaluate(extractItems);
  }
  while (items.length < minItemCount);

  return items;
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

const getUserData = async (username) => {
  //check the cache
  const cached = map[username];
  if(cached){
    if(new Date().getTime() - cached.timestamp <= 1000*60*60*24)
      return cached.data;
  }

  // Set up browser and page.
  const browser = await puppeteer.launch({
    //headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 926});

  // Navigate to the demo page.
  await page.goto('https://tiktok.com/@' + username,{
    waitUntil: 'load', timeout: 0
  });

  // Scroll and extract items from the page.
  let urls = await scrapeScrollItems(page, extractItems, 0);
  urls = urls.reverse();

  //console.log(urls);
  //console.log(urls.length);
  let videoObjects = [];
  //urls.map(url => await moreStats(page, url));
  //let i = 0;
  for(let url of urls){
    //i += 1;
    //console.log(i/urls.length*100);
    videoObjects.push(await moreStats(page, url, 500));
  }

  //map.push(
  map[username] = {timestamp: new Date().getTime(), data: videoObjects};

  //save that shit
  fs.writeFile(FILE, JSON.stringify(map), err => {});

  // Close the browser.
  await browser.close();
  return videoObjects;
};

const loadCache = file => {
  try{
    let raw = fs.readFileSync(file);
    map = JSON.parse(raw.toString());
  }
  catch(err){}
};

const run = async () => {
  loadCache(FILE);
  let x = await getUserData('shazy005');
  //console.log(x);
};

run();
