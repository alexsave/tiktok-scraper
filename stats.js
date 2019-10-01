const puppeteer = require('puppeteer');

function extractItems() {
  const extractedElements = document.querySelectorAll('._video_feed_item a');
  const items = [];
  for (let element of extractedElements)
    items.push(element.href);
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

/*
  Tiktok videos have timestamps on the video page if you look closely
 */
async function moreStats(page, url){
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
}

async function run(username){
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
  let urls = await scrapeInfiniteScrollItems(page, extractItems, 120);
  //old to new
  //items = items.reverse();
  //items.pop();

  let videoObjects = urls.map(url => moreStats(page, url));
  console.log(videoObjects);

  // Close the browser.
  await browser.close();
}

run('qzim');
