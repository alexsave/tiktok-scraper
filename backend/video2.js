const fs = require('fs');
const request = require('request');
const https = require('https');
const zlib = require('zlib');
const path = require('path');
const {execSync} = require('child_process');

let vids = [];

let map;
const FILE = './data.json';
const headers = {'Accept-Encoding': 'gzip', 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:71.0) Gecko/20100101 Firefox/71.0'};

const downloadVids = (urls, cb) => {
  if(urls.length === 0)
    cb();

  const url = urls.pop();
  const fileName = url.split('/').pop() + '.mp4';
  const location = path.resolve(__dirname, '..', 'videos', fileName);

  const buffer = [];
  https.get(url, {headers}, res => {
    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);
    gunzip.on('data', data => buffer.push(data.toString()));
    gunzip.on('end', () => {
      const raw = buffer.join('');
      //we'll use regex, no fancy modules
      const regex =/<video.*?src="(.*?)"/m;
      const src = regex.exec(raw)[1];
      if(!src)
        downloadVids(urls, cb);

      downloadFromSrc(src, location, () => downloadVids(urls, cb));
    });
  });
};

const downloadFromSrc = (src, location, cb) => {
  const file = fs.createWriteStream(location);
  request({ url: src })
    .pipe(file)
    .on('finish', () => {
      console.log(location);
      vids.push(location);
      setTimeout(cb, 800);
    })
    .on('error', cb);
};

function run(username){
  const userdata = map[username];
  if(!userdata)
    console.log('user not available');
  execSync('rm -rf videos && mkdir videos');
  execSync(`rm -f ${username}.mp4`);

  const ids = Object.keys(userdata.tiktoks);
  let urls = ids.map(id => `https://www.tiktok.com/@${username}/video/${id}`);
  downloadVids(urls, () => composeVideos(username));
}

const composeVideos = username => {
  //video composition
  for(let vid of vids)
    execSync(`ffmpeg -i ${vid} -c copy -bsf:v h264_mp4toannexb ${vid}.ts`);

  let something = vids.join('.ts|') + '.ts';

  execSync(`ffmpeg -i "concat:${something}" -c copy -absf aac_adtstoasc ${username}.mp4`);

  execSync('rm -rf videos/');

};

let raw = fs.readFileSync(FILE);
map = JSON.parse(raw);
console.log('loaded file');

run('qzim');
