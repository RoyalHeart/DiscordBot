# DiscordBot
Hi this is a small discord bot i made to help me understand more on how to use API. It is highly inspired by the videos of The coding train. If you want a more in-depth tutorial then you should check his channel on Youtube.

# Setup
- It require node.js to run this bot.

- npm is used to manage packet

# How to run the bot
Make sure you add a .env file (an .env.example is given) at the base directory (DiscordBot) with all the required API key for different services so that all service can be connected.
The .env file should look like this
```properties
APPLICATION_ID=YOUR_APP_ID
TOKEN=YOUR_BOT_TOKEN
TENOR_API_KEY=YOUR_GIF_KEY
OPENWEATHER_API_KEY=YOUR_WEATHER_KEY
YOUTUBE_API_KEY=YOUR_YOUTUBE_KEY
COIN_MARKET_CAP_API_KEY=YOUR_CRYPTOCOIN_KEY
MONGODB_URI=YOUR_URI_MONGODB
```

Go to the terminal and change directory to the directory you clone this repository and run this to get all the packages needed
```terminal
npm install
```

Then run this and the bot will be online
```terminal
npm start
```
# Feedback
Any recommendations or feedback is welcome, you can contact me via my email [hoangtam3062002@gmail.com](mailto:hoangtam3062002@gmail.com)
