import { ChatInputCommandInteraction } from 'discord.js';
export default function (msg: {
    channel: {
        send: (arg0: string) => void;
    };
}, tokens: any): Promise<void>;
export declare function weather(interaction: ChatInputCommandInteraction): Promise<void>;
