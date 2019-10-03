//setFullYear(2000)
//setMonth(0)
//setDate(1)
export const UnixToSeconds = unix => {
  let dt = new Date(unix);
  let res = (dt.getUTCSeconds() + 60* dt.getUTCMinutes() + 60*60 *dt.getUTCHours())*1000;
  //this is due to gmt vs est
  if(res < 5*60*60*1000)
    res += 24*60*60*1000;
  return res;
};
