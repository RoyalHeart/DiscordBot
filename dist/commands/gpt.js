import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_GPT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
export default async function gpt(interaction) {
    await interaction.deferReply();
    const query = interaction.options.get('query')?.value;
    const content = getChatGPTResponse(query);
    await interaction.followUp('Ask: ' + query);
    const message = await interaction.followUp({
        content: 'ChatGPT is thinking...',
    });
    interaction
        .followUp({ content: `'ChatGPT: ' + ${await content}` })
        .then(() => message.delete());
}
async function getChatGPTResponse(query) {
    try {
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
    catch (error) {
        console.log('> error: ', error);
        return 'Can not call ChatGPT now, please try again later.';
    }
}
//# sourceMappingURL=gpt.js.map