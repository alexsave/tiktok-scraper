const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const {execSync} = require('child_process');

let vids = [];

let map;
const FILE = './data.json';

async function downloadVid(page, url){
  const options = {
    headers: {'Accept-Encoding': 'gzip', 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:71.0) Gecko/20100101 Firefox/71.0'}
  };
  const buffer = [];
  https.get(url, options, res => {
    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);
    gunzip.on('data', data => buffer.push(data.toString()));
    gunzip.on('end', () => console.log(buffer.join('')));
  });

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
  //for(let url of urls)
  //await downloadVid(page, url);
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
