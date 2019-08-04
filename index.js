const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const concat = require('ffmpeg-concat');

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
    responseType: 'stream'
  });

  const name = url.split('/').pop();
  //response.data.pipe(fs.createWriteStream(path.resolve(__dirname, 'videos', name + '.mp4')));
  vids.push(response.data);

}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    //headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 926});

  // Navigate to the demo page.
  await page.goto('https://tiktok.com/@qzim', {
    waitUntil: 'load', timeout: 0
  });

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 20);

  /*for(let item of items)
    await downloadVid(page, item);*/


  fs.readdir(path.resolve(__dirname, 'videos'), (err, files) => {
    files.forEach(f => console.log(f));
  });

  await concat({
    output: 'test.mp4',
    videos: items
  });



  // Close the browser.
  await browser.close();
})();
