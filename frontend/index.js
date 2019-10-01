import MyCanvas from './js/MyCanvas';

while(document.body.hasChildNodes())
  document.body.removeChild(document.body.firstChild);

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const myCanvas = new MyCanvas();
myCanvas.render(canvas);

if(module.hot)
  module.hot.accept();
