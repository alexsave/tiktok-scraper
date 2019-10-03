export const DataTransform = (data, transformType) => {
  if(transformType !== 'avg')
    return data;

  const timeLikes = {};
  data.forEach(vid => {
    const key = new Date(vid.x).getTime();
    if(!timeLikes[key])
      timeLikes[key] = [];
    timeLikes[key].push(vid.y);
  });

  return Object.keys(timeLikes).map(time => ({
    x: parseInt(time),
    y: Math.round(timeLikes[time].reduce((a,b) => a+b, 0)/timeLikes[time].length)
  }));
};
