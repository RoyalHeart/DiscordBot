import axios from 'axios';
import {ChatInputCommandInteraction} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const openweatherApiKey = process.env.OPENWEATHER_API_KEY;

export default async function (
  msg: {channel: {send: (arg0: string) => void}},
  tokens: any
) {
  console.log(msg);
  let location = 'Ho Chi Minh';
  if (tokens.length > 0) {
    location = tokens.join('%20');
  }
  const message = await getCurrentWeather(location);
  msg.channel.send(message);
}

export async function weather(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  let location = 'Ho Chi Minh';
  let mode = 'weather';
  try {
    location = interaction.options.get('location')?.value as string;
    mode = interaction.options.get('mode')?.value as string;
  } catch (error) {
    console.log('> error: ', error);
  }
  if (mode == 'weather') {
    const message = await getCurrentWeather(location);
    interaction.followUp(message);
  } else if (mode == 'forecast') {
    const message = await getForecastWeather(location);
    interaction.followUp(message);
  }
}

async function getCurrentWeather(location: string): Promise<string> {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openweatherApiKey}`;
  try {
    const response = (
      await axios.get(weatherUrl, {
        headers: {'Content-Type': 'application/json'},
      })
    ).data;
    console.log(response);
    const temp = Math.round((response.main['temp'] as number) * 10) / 100;
    const weather = response.weather[0]['main'];
    const description = response.weather[0]['description'];
    const time = timeConverter(response['dt']);
    const message = `Location: **${location}**, Temp: **${temp}°C**, weather: **${weather}**, description: **${description}**, Time: **${time}**`;
    return message;
  } catch (error) {
    console.log('> error: ', error);
    return '> Error getting weather information';
  }
}

async function getForecastWeather(location: string) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${openweatherApiKey}`;
  try {
    const response = (
      await axios.get(forecastUrl, {
        headers: {'Content-Type': 'application/json'},
      })
    ).data;
    console.log(response);
    var message = 'Forecast Rain: ';
    var haveRain = false;
    for (var index in response.list) {
      let forecast = response.list[index];
      let mainWeather = forecast.weather[0].main;
      if (mainWeather === 'Rain') {
        haveRain = true;
        const temp = Math.round((forecast.main.temp as number) * 10) / 100;
        const weather = mainWeather;
        const description = forecast.weather[0].description;
        const time = timeConverter(forecast.dt);
        message += `\n-Location: **${location}**, Temp: **${temp}°C**, weather: **${weather}**, description: **${description}**, Time: **${time}**`;
      }
    }
    if (!haveRain) {
      message += 'No rain for the next 5 days!';
    }
    return message;
  } catch (error) {
    console.log('> error: ', error);
    return '> Error getting weather information';
  }
}

function timeConverter(UNIX_timestamp: number) {
  var date = new Date(UNIX_timestamp * 1000);
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
  var year = date.getFullYear();
  var month = months[date.getMonth()];
  var day = date.getDate();
  var hour = date.getHours();
  var hourString = hour < 10 ? `0${hour}` : hour;
  var min = date.getMinutes();
  var minString = min < 10 ? `0${min}` : min;
  var sec = date.getSeconds();
  var secString = sec < 10 ? `0${sec}` : sec;
  var time = `${day} ${month} ${year} ${hourString}:${minString}:${secString}`;
  return time;
}
