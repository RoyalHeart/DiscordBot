import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_GPT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
export default async function gpt(interaction) {
    await interaction.deferReply();
    const query = interaction.options.get('query')?.value;
    await interaction.followUp('Ask: ' + query);
    interaction.followUp('ChatGPT is thinking...').then(async (message) => {
        const content = await getChatGPTResponse(query);
        message.edit('ChatGPT: ' + content);
    });
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
    console.log(response.data.choices);
    const content = response.data.choices[0].message.content;
    return content;
}
//# sourceMappingURL=gpt.js.map