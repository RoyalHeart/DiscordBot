import axios from 'axios';
import { TextChannel, } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_GPT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
function getTextChannel(message) {
    if (message.channel instanceof TextChannel) {
        return message.channel;
    }
    return null;
}
export default async function gpt(interaction) {
    const query = interaction.options.get('query')?.value;
    interaction.reply('Ask: ' + query);
    const content = await getChatGPTResponse(query);
    interaction.followUp('ChatGPT is thinking...');
    interaction.editReply('ChatGPT: ' + content);
}
async function getChatGPTResponse(query) {
    const response = await axios.post(CHAT_GPT_CHAT_URL, {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: query }],
    }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
    });
    console.log(response);
    const content = response.data.choices[0].message.content;
    return content;
}
//# sourceMappingURL=gpt.js.map