import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const openweatherApiKey = process.env.OPENWEATHER_API_KEY;
export default async function (msg, tokens) {
    console.log(msg);
    let location = 'Ho Chi Minh';
    if (tokens.length > 0) {
        location = tokens.join('%20');
    }
    const message = await getCurrentWeather(location);
    msg.channel.send(message);
}
export async function weather(interaction) {
    await interaction.deferReply();
    let location = 'Ho Chi Minh';
    let mode = 'weather';
    try {
        location = interaction.options.get('location')?.value;
        mode = interaction.options.get('mode')?.value;
    }
    catch (error) {
        console.log('> error: ', error);
    }
    if (mode == 'weather') {
        const message = await getCurrentWeather(location);
        interaction.followUp(message);
    }
    else if (mode == 'forecast') {
        const message = await getForecastWeather(location);
        interaction.followUp(message);
    }
}
async function getCurrentWeather(location) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openweatherApiKey}`;
    try {
        const response = (await axios.get(weatherUrl, {
            headers: { 'Content-Type': 'application/json' },
        })).data;
        console.log(response);
        const temp = Math.round(response.main['temp'] - 273.15);
        const weather = response.weather[0]['main'];
        const description = response.weather[0]['description'];
        const time = timeConverter(response['dt'], response['timezone']);
        const message = `**${location}**, **${temp}°C**, **${weather}**, **${description}** at **${time}**`;
        return message;
    }
    catch (error) {
        console.log('> error: ', error);
        return '> Error getting weather information';
    }
}
async function getForecastWeather(location) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${openweatherApiKey}`;
    try {
        const response = (await axios.get(forecastUrl, {
            headers: { 'Content-Type': 'application/json' },
        })).data;
        var message = `Forecast Rain in ${location}: `;
        var haveRain = false;
        const timezone = response.city['timezone'];
        for (var index in response.list) {
            let forecast = response.list[index];
            let mainWeather = forecast.weather[0].main;
            if (mainWeather === 'Rain') {
                haveRain = true;
                const temp = Math.round(forecast.main.temp - 273.15);
                const description = forecast.weather[0].description;
                const time = timeConverter(forecast.dt, timezone);
                message += `\n**${temp}°C**, ${description} at ${time}`;
            }
        }
        if (!haveRain) {
            message += 'No rain for the next 5 days!';
        }
        return message;
    }
    catch (error) {
        console.log('> error: ', error);
        return '> Error getting weather information';
    }
}
function timeConverter(UNIX_timestamp, timezone) {
    var date = new Date((UNIX_timestamp + timezone - 25200) * 1000);
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
    // var sec = date.getSeconds();
    // var secString = sec < 10 ? `0${sec}` : sec;
    var time = `${day} ${month} ${year} ${hourString}:${minString}`;
    return time;
}
//# sourceMappingURL=weather.js.map