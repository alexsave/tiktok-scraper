const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const {execSync} = require('child_process');

let vids = [];

let map;
const FILE = './data.json';

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
  execSync(`rm -f ${username}.mp4`);
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 926});

  const ids = Object.keys(userdata.tiktoks);
  let urls = ids.map(id => `https://www.tiktok.com/@${username}/video/${id}`);
  urls = urls.reverse();
  for(let url of urls)
    await downloadVid(page, url);

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
