const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const {execSync} = require('child_process');

let vids = [];

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

  const src = await page.evaluate(() => document.querySelector('video').src);

  const response = await axios({
    url: src,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  const fileName = url.split('/').pop() + '.mp4';
  const location = path.resolve(__dirname, 'videos', fileName);
  fs.writeFileSync(location, response.data );
  vids.push(location);
}

async function run(username){
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
  let items = await scrapeInfiniteScrollItems(page, extractItems, 3);
  //old to new
  items = items.reverse();
  items.pop();

  execSync('rm -rf videos && mkdir videos');
  execSync('rm -f output.mp4');

  for(let item of items)
    await downloadVid(page, item);

  // Close the browser.
  await browser.close();

  for(let vid of vids)
    execSync(`ffmpeg -i ${vid} -c copy -bsf:v h264_mp4toannexb ${vid}.ts`);

  let something = vids.join('.ts|') + '.ts';

  console.log(`ffmpeg -i "concat:${something}" -c copy -absf aac_adtstoasc output.mp4`);
  execSync(`ffmpeg -i "concat:${something}" -c copy -absf aac_adtstoasc output.mp4`);

  execSync('rm -rf videos/');

}

run('qzim');
