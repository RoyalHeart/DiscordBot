import axios from 'axios';
import { ChannelType } from 'discord.js';
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;
const OCR_SPACE_IMAGE_URL = `https://api.ocr.space/parse/image`;
const OCR_SPACE_IMAGEURL_URL = `https://api.ocr.space/parse/imageurl`;
export default async function (msg, tokens) {
    if (msg.channel.type === ChannelType.GuildText) {
        msg.channel.send('ocr');
    }
}
export async function ocr(interaction) {
    await interaction.deferReply();
    interaction.followUp('OCR with OCR Space...');
    var image = interaction.options.get('image');
    console.log(image);
    const imageUrl = image?.attachment?.url;
    const text = await getOcrText(imageUrl);
    interaction.editReply(text);
}
async function getOcrText(imageUrl) {
    const ocrUrl = `${OCR_SPACE_IMAGEURL_URL}?apikey=${OCR_SPACE_API_KEY}&url=${imageUrl}&isOverlayRequired=true&iscreatesearchablepdf=true&issearchablepdfhidetextlayer=true`;
    // const response = await fetch(ocrUrl);
    try {
        const response = await axios.get(ocrUrl);
        const text = response.data.ParsedResults[0].ParsedText;
        const pdfLink = response.data.SearchablePDFURL;
        const result = `Text: ${text}\nPDF link: ${pdfLink}`;
        return result;
    }
    catch (error) {
        console.log('> Error:', error);
        return 'Error';
    }
}
//# sourceMappingURL=ocr.js.map