import TikGraph from "./graph";

while(document.body.hasChildNodes())
  document.body.removeChild(document.body.firstChild);

const root = document.createElement('div');
document.body.appendChild(root);
new TikGraph(root);

if(module.hot)
  module.hot.accept();
