export const UnixToSeconds = unix => {
  let dt = new Date(unix);
  let now = new Date();
  now.setHours(dt.getHours());
  now.setMinutes(dt.getMinutes());
  now.setSeconds(dt.getSeconds());
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
