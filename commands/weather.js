const openweather_api_key = process.env.OPENWEATHER_API_KEY;

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function (msg, tokens) {
  let location = "Binh Duong";
  let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openweather_api_key}`;
  let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?id=1566083&appid=${openweather_api_key}}`;
  let response = await (await fetch(weatherUrl)).json();
  console.log(response);
  let temp = response.main["temp"];
  temp /= 10;
  let weather = response.weather[0]["main"];
  let description = response.weather[0]["description"];
  let time = new Date(response["dt"]).toISOString().slice(11, -1);
  msg.channel.send(
    `Location: ${location}, Temp: ${temp}, weather: ${weather}, description: ${description}, Time: ${time}`
  );
};
