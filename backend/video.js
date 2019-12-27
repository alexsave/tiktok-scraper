const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const {execSync} = require('child_process');

let vids = [];

let map;
const FILE = './data.json';


function extractItems() {
  const extractedElements = document.querySelectorAll('._video_feed_item a');
  const items = [];
  for (let element of extractedElements) {
    console.log(element);
    items.push(element.href);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } 
  catch(e) { }

  return items;
}

async function downloadVid(page, url){
  await page.goto(url, {
    waitUntil: 'load', timeout: 0
  });

  let src;
  try{
    src = await page.evaluate(() => document.querySelector('video').src);
  }
  catch(e){
    return;
  }


  const response = await axios({
    url: src,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  const fileName = url.split('/').pop() + '.mp4';
  const location = path.resolve(__dirname, '..', 'videos', fileName);
  fs.writeFileSync(location, response.data );
  vids.push(location);
  await page.waitFor(500);
}

async function run(username){
  const userdata = map[username];
  if(!userdata)
    console.log('user not available');
  execSync('rm -rf videos && mkdir videos');
  execSync('rm -f output.mp4');
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 926});

  /*// Navigate to the demo page.
  await page.goto('https://tiktok.com/@' + username,{
    waitUntil: 'load', timeout: 0
  });

  // Scroll and extract items from the page.
  let items = await scrapeInfiniteScrollItems(page, extractItems, 120);
  //old to new
  items = items.reverse();
  items.pop();*/


  //for(let item of items)
    //await downloadVid(page, item);
  const ids = Object.keys(userdata.tiktoks);
  let urls = ids.map(id => `https://www.tiktok.com/@${username}/video/${id}`);
  urls = urls.reverse();
  //for(let url of urls)
    //await downloadVid(page, url);
  console.log(urls[0]);
  await downloadVid(page, urls[0]);

  // Close the browser.
  await browser.close();

  //video composition
  for(let vid of vids)
    execSync(`ffmpeg -i ${vid} -c copy -bsf:v h264_mp4toannexb ${vid}.ts`);

  let something = vids.join('.ts|') + '.ts';

  execSync(`ffmpeg -i "concat:${something}" -c copy -absf aac_adtstoasc ${username}.mp4`);

  execSync('rm -rf videos/');
}

let raw = fs.readFileSync(FILE);
map = JSON.parse(raw);
console.log('loaded file');

run('qzim');
