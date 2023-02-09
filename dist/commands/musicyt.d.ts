import { ChatInputCommandInteraction } from 'discord.js';
export declare function test(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export default function playyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").Message<true> | import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function skipyt(interaction: ChatInputCommandInteraction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
export declare function pauseyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function resumeyt(interaction: ChatInputCommandInteraction): Promise<void>;
