const puppeteer = require('puppeteer');

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
  while (items.length < minItemCount) {
    await scrollDown(page, scrollDelay);
    items = await page.evaluate(extractItems);
  }

  return items;
};

/*
  Tiktok videos have timestamps on the video page if you look closely
 */
const moreStats = async (page, url) => {
  await page.goto(url, {
    waitUntil: 'load', timeout: 0
  });

  const videoObject= await page.evaluate(() => JSON.parse(document.getElementById('videoObject').innerText));

  return {
    url,
    uploadDate: videoObject.uploadDate,
    comments: videoObject.commentCount,
    likes: videoObject.interactionCount,
    title: videoObject.name
  };
};

const run = async (username) => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 926});

  // Navigate to the demo page.
  await page.goto('https://tiktok.com/@' + username,{
    waitUntil: 'load', timeout: 0
  });

  // Scroll and extract items from the page.
  let urls = await scrapeScrollItems(page, extractItems, 100);

  console.log(urls);
  console.log(urls.length);
  let videoObjects = [];
  //urls.map(url => await moreStats(page, url));
  for(let url of urls){
    console.log(url);
    videoObjects.push(await moreStats(page, url));
  }

  console.log(videoObjects);

  // Close the browser.
  await browser.close();
};

run('qzim');
