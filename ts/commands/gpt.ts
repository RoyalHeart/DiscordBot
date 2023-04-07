import axios from 'axios';
import {
  ChannelType,
  ChatInputCommandInteraction,
  Message,
  TextChannel,
} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_GPT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export default async function gpt(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const query = interaction.options.get('query')?.value as string;
  await interaction.followUp('Ask: ' + query);
  interaction.followUp('ChatGPT is thinking...').then(async (message) => {
    const content = await getChatGPTResponse(query);
    message.edit('ChatGPT: ' + content);
  });
}

async function getChatGPTResponse(query: string): Promise<string> {
  const response = await axios.post(
    CHAT_GPT_CHAT_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: [{role: 'user', content: query}],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  console.log(response.data.choices);
  const content = response.data.choices[0].message.content;
  return content;
}
