import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const LLAMA_CHAT_URL = 'https://honest-skylark-virtually.ngrok-free.app/completion';
export default async function ask(interaction) {
    await interaction.deferReply();
    const query = interaction.options.get('query')?.value;
    const content = getLlamaResponse(query);
    await interaction.followUp('Ask: ' + query);
    const message = await interaction.followUp({
        content: 'Llama 2 is thinking...',
    });
    interaction
        .followUp({ content: `Llama: ${await content}` })
        .then(() => message.delete());
}
async function getLlamaResponse(query) {
    try {
        const response = await axios.post(LLAMA_CHAT_URL, {
            prompt: `This is a conversation between User and Llama, a friendly chatbot. Llama is helpful, kind, honest, good at writing, and never fails to answer any requests immediately and with precision.\nUser: ${query}\nLlama: `,
            n_predict: 400,
            stop: ['User:', 'User 1:'],
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data);
        const content = response.data.content;
        return content;
    }
    catch (error) {
        console.log('> error: ', error);
        return 'Can not call Llama now, please try again later.';
    }
}
//# sourceMappingURL=llama.js.map