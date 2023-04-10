import axios from 'axios';
import {ChannelType, ChatInputCommandInteraction, Message} from 'discord.js';

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;
const OCR_SPACE_IMAGE_URL = `https://api.ocr.space/parse/image`;
const OCR_SPACE_IMAGEURL_URL = `https://api.ocr.space/parse/imageurl`;
export default async function (msg: Message, tokens: any) {
  if (msg.channel.type === ChannelType.GuildText) {
    msg.channel.send('ocr');
  }
}

export async function ocr(interaction: ChatInputCommandInteraction) {
  await interaction.reply('OCR with OCR Space...');
  const image = interaction.options.get('image');
  var language = 'eng';
  try {
    language = interaction.options.get('language')!.value as string;
  } catch (error) {
    console.log('> error: ', error);
  }
  console.log(image);
  const imageUrl = image?.attachment?.url as string;
  const text = await getOcrText(imageUrl, language);
  interaction.editReply(text);
}

async function getOcrText(imageUrl: string, language: string): Promise<string> {
  var ocrUrl = `${OCR_SPACE_IMAGEURL_URL}?apikey=${OCR_SPACE_API_KEY}&url=${imageUrl}&isOverlayRequired=true&iscreatesearchablepdf=true&language=${language}`;
  if (language === 'vie') {
    ocrUrl += `&OCREngine=3&issearchablepdfhidetextlayer=false`;
  }
  if (language === 'eng') {
    ocrUrl += `&issearchablepdfhidetextlayer=true`;
  }
  if (language === 'chs') {
    ocrUrl += `&issearchablepdfhidetextlayer=false`;
  }
  if (language === 'kor') {
    ocrUrl += `&issearchablepdfhidetextlayer=false`;
  }
  if (language === 'jpn') {
    ocrUrl += `&issearchablepdfhidetextlayer=false`;
  }
  try {
    const response = await axios.get(ocrUrl);
    const text = response.data.ParsedResults[0].ParsedText as string;
    const pdfLink = response.data.SearchablePDFURL;
    const result = `Text: ${text}\nPDF link: ${pdfLink}`;
    return result;
  } catch (error) {
    console.log('> error:', error);
    return 'Error';
  }
}
