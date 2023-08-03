import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const VTTS_URL = 'https://ntt123-viettts.hf.space/run/predict';
export default async function speak(interaction) {
    await interaction.deferReply();
    const query = interaction.options.get('query')?.value;
    const content = getChatGPTResponse(query);
    await interaction.followUp('Ask: ' + query);
    const message = await interaction.followUp({
        content: 'Loading',
    });
    interaction
        .followUp({ content: `ChatGPT: ${await content}` })
        .then(() => message.delete());
}
async function getChatGPTResponse(query) {
    try {
        const response = await axios.post(VTTS_URL, {
            data: [query],
        }, {
            headers: {
                'Content-Type': 'application/json',
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
//# sourceMappingURL=speak.js.map