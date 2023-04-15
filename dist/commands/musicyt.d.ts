import { ButtonInteraction, ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
export default function playyt(interaction: ChatInputCommandInteraction): Promise<void | Message<true> | import("discord.js").InteractionResponse<boolean>>;
export declare function addyt(interaction: ModalSubmitInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function loopyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function skipyt(interaction: ChatInputCommandInteraction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
export declare function pauseyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function resumeyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean>> | undefined;
export declare function stopyt(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
export declare function downloadyt(interaction: ButtonInteraction): Promise<import("discord.js").InteractionResponse<boolean> | "temp.mp3" | undefined>;
