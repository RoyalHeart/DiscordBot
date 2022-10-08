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
  let time = timeConverter(response["dt"]);
  msg.channel.send(
    `Location: ${location}, Temp: ${temp}, weather: ${weather}, description: ${description}, Time: ${time}`
  );
};

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}
