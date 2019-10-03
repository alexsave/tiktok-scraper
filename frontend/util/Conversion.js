export const UnixToSeconds = unix => {
  const dt = new Date(unix);
  const now = new Date();
  now.setHours(dt.getHours());
  now.setMinutes(dt.getMinutes());
  now.setSeconds(dt.getSeconds());
  return now.getTime();
};

//this is so that we can plot the 'average week'
export const UnixToSecondsOfWeek = unix => {
  const unixTime = new Date(unix);
  const now = new Date();
  const diffDayOfWeek = (unixTime.getDay() - now.getDay());
  now.setHours(unixTime.getHours());
  now.setMinutes(unixTime.getMinutes());
  now.setSeconds(unixTime.getSeconds());
  now.setDate(now.getDate() + diffDayOfWeek);
  return now.getTime();
};

export const WeekdayName = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];
