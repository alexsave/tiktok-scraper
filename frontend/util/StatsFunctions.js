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

export const Cut = (data, minLikes) => data.filter(vid => vid.likes >= minLikes);

export const RoundTime = (data, timeIncrement) => data.map(vid => {
  const time = new Date(vid.uploadDate);
  if(timeIncrement !== 's')
    time.setSeconds(time.getSeconds() >= 30? 60: 0);
  if(timeIncrement === 'h')
    time.setMinutes(time.getMinutes() >= 30? 60: 0);
  return {...vid, uploadDate: time.getTime()};
});

