import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const openweatherApiKey = process.env.OPENWEATHER_API_KEY;

export default async function (
  msg: {channel: {send: (arg0: string) => void}},
  tokens: any
) {
  let location = 'Binh Duong';
  const message = await getWeather(location);
  msg.channel.send(message);
}

async function getWeather(location?: string): Promise<string> {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openweatherApiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?id=1566083&appid=${openweatherApiKey}}`;
  const response = (
    await axios.get(weatherUrl, {headers: {'Content-Type': 'application/json'}})
  ).data;
  console.log(response);
  const temp = (response.main['temp'] /= 10);
  const weather = response.weather[0]['main'];
  const description = response.weather[0]['description'];
  const time = timeConverter(response['dt']);
  const message = `Location: ${location}, Temp: ${temp}, weather: ${weather}, description: ${description}, Time: ${time}`;
  return message;
}
function timeConverter(UNIX_timestamp: number) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}
