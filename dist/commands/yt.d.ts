import { ChatInputCommandInteraction, Message } from 'discord.js';
export default function (msg: Message, tokens: string[]): Promise<void>;
export declare function yt(interaction: ChatInputCommandInteraction): Promise<void>;
export declare function getYoutubeVideoUrl(title: string): Promise<string>;
