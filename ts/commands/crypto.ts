import axios from 'axios';
import {Message} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const coinMarketCapApiKey = process.env.COIN_MARKET_CAP_API_KEY;
const COIN_MARKET_CAP_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD`;
const COIN_MARKET_CAP_SANDBOX_URL =
  'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=USD&start=1&limit=10';
const ETHER_ID = 1027;
const LUNC_ID = 4172;
const TRX_ID = 1958;
const BTC_ID = 1;
export default async function (msg: Message, tokens: string[]) {
  const message = (await getLatest10Crypto()) as string;
  msg.channel.send(message);
}

async function getLatest10Crypto() {
  try {
    const response = await axios.get(COIN_MARKET_CAP_URL, {
      headers: {
        'Accept-Encoding': 'application/json',
        'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
      },
    });

    const data = response.data.data;
    console.log(data);
    let message = '';
    for (let numCrypto in data) {
      if (data[numCrypto]) {
        const cryptoCurrency = data[numCrypto];
        const price = cryptoCurrency.quote.USD.price;
        const name = cryptoCurrency.name;
        message += name + ': ' + price + '\n';
      }
    }
    console.log(message);
    return message;
  } catch (error) {
    console.log(error);
  }
}
export async function test() {
  try {
    let response = await axios.get(COIN_MARKET_CAP_SANDBOX_URL, {
      headers: {
        'Accept-Encoding': 'application/json',
        'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
