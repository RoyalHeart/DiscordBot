import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, } from '@discordjs/voice';
import { ActionRowBuilder, ChannelType, EmbedBuilder, Guild, GuildMember, ModalBuilder, TextInputBuilder, } from 'discord.js';
import ytdl from 'ytdl-core';
import { getYoutubeVideoUrl } from './yt.js';
const COMPONENT_PLAYING = [
    {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Add',
                style: 1,
                custom_id: 'playyt',
            },
            {
                type: 2,
                label: 'Pause',
                style: 2,
                custom_id: 'pauseyt',
            },
            {
                type: 2,
                label: 'Skip',
                style: 3,
                custom_id: 'skipyt',
            },
            {
                type: 2,
                label: 'Stop',
                style: 4,
                custom_id: 'stopyt',
            },
        ],
    },
    {
        type: 1,
        components: [
            {
                type: 3,
                custom_id: 'audio',
                options: [
                    {
                        label: 'Highest audio',
                        value: 'highestaudio',
                        description: 'Choose highest audio quality',
                    },
                    {
                        label: 'Lowest audio',
                        value: 'lowestaudio',
                        description: 'Choose lowest audio quality',
                    },
                ],
            },
        ],
    },
];
const COMPONENT_PAUSE = [
    {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Add',
                style: 1,
                custom_id: 'playyt',
            },
            {
                type: 2,
                label: 'Resume',
                style: 2,
                custom_id: 'resume',
            },
            {
                type: 2,
                label: 'Skip',
                style: 3,
                custom_id: 'skipyt',
            },
            {
                type: 2,
                label: 'Stop',
                style: 4,
                custom_id: 'stopyt',
            },
        ],
    },
    {
        type: 1,
        components: [
            {
                type: 3,
                custom_id: 'audio',
                options: [
                    {
                        label: 'Highest audio',
                        value: 'highestaudio',
                        description: 'Choose highest audio quality',
                    },
                    {
                        label: 'Lowest audio',
                        value: 'lowestaudio',
                        description: 'Choose lowest audio quality',
                    },
                ],
            },
        ],
    },
];
let queue = new Map();
let messagesQueue = new Map();
export default async function playyt(interaction) {
    if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    const channel = interaction.channel;
    var server;
    var song;
    try {
        const user = interaction.member.user;
        const voiceChannel = interaction.member.voice.channel;
        const guildId = interaction.guild.id || '';
        const userId = user.id;
        const userImageUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}`;
        const userName = user.username;
        if (!queue.get(guildId)) {
            await interaction.deferReply();
            const query = interaction.options.get('query').value;
            console.log('> Query:', query);
            const url = await getUrlFromQuery(query);
            const songInfo = await ytdl.getInfo(url);
            song = createSong(songInfo);
            const player = createAudioPlayer({
                behaviors: {
                    maxMissedFrames: 20,
                },
            });
            try {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.member.guild.voiceAdapterCreator,
                    selfMute: false,
                });
                const queueContruct = {
                    player: player,
                    textChannel: interaction.channel,
                    voiceChannel: voiceChannel,
                    connection: connection,
                    songs: [song],
                    playing: true,
                    isLoop: false,
                    message: undefined,
                };
                server = queueContruct;
                queue.set(guildId, queueContruct);
                var embed = new EmbedBuilder()
                    .setColor(0xe76680)
                    .setAuthor({
                    name: userName,
                    iconURL: userImageUrl,
                    url: `https://discord.com/users/${userId}`,
                })
                    // .setDescription()
                    // .setThumbnail(song.songInfo.videoDetails.thumbnails[0].url)
                    .setTitle(song.title)
                    .setURL(song.url)
                    .setImage(song.songInfo.videoDetails.thumbnails[0].url)
                    .setTimestamp()
                    .setFooter({
                    text: 'Source: youtube.com',
                });
                connection.subscribe(player);
                player.play(song.resource);
                var newMessage = {
                    content: `> Playing from Youtube`,
                    embeds: [embed],
                    components: COMPONENT_PLAYING,
                };
                var message = await interaction.editReply(newMessage);
                messagesQueue.set(guildId, message);
            }
            catch (err) {
                console.log(err);
                queue.delete(guildId);
                player.stop();
                return interaction.channel.send(err);
            }
        }
        else {
            server = queue.get(guildId);
            var modal = new ModalBuilder()
                .setTitle('Add song URL or name')
                .setCustomId('addyt')
                .setComponents(new ActionRowBuilder().setComponents(new TextInputBuilder()
                .setLabel('Song query')
                .setCustomId('query')
                .setStyle(1)));
            return interaction.showModal(modal);
        }
        server.player.on(AudioPlayerStatus.Buffering, async (e) => {
            console.log('> Loading', server.songs[0].title);
        });
        server.player.on(AudioPlayerStatus.Playing, (e) => {
            console.log('> Playing', server.songs[0].title);
        });
        server.player.on(AudioPlayerStatus.AutoPaused, (e) => {
            server.player.play(server.songs[0].resource);
            console.log('> Auto pause, play again');
        });
        server.player.on(AudioPlayerStatus.Idle, async (e) => {
            try {
                console.log('> Idle');
                let currentSong = server.songs.shift();
                let nextRelatedSong = getNextRelatedSong(currentSong);
                // loop song by create and add again
                if (server.isLoop) {
                    song = createSong(currentSong.songInfo);
                    console.log('> Song url:', song.url);
                    server.songs.push(song);
                    server.player.play(song.resource);
                }
                // play next random related song
                if (server.songs.length == 0) {
                    song = await nextRelatedSong;
                    server.songs.push(song);
                    console.log('> Song url:', song.url);
                    await channel.send({
                        content: `> Playing related song **${song.title}**`,
                    });
                    server.player.play(song.resource);
                    // play next query song
                }
                else {
                    song = server.songs[0];
                    console.log('> Song url:', song.url);
                    console.log('> Next song title' + song.title);
                    if (song) {
                        await channel.send({
                            content: `> Playing **${song.title}**`,
                        });
                        server.player.play(song.resource);
                    }
                }
            }
            catch (error) {
                console.log('> error: ' + error);
            }
        });
    }
    catch (error) {
        console.log('> error: ' + error);
    }
}
export async function addyt(interaction) {
    if (!(interaction.channel.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    try {
        await interaction.deferReply();
        const guildId = interaction.guild.id;
        const server = queue.get(guildId);
        const query = interaction.fields.fields.get('query').value;
        console.log('> Query:', query);
        const url = await getUrlFromQuery(query);
        const songInfo = await ytdl.getInfo(url);
        var song = createSong(songInfo);
        const user = interaction.member.user;
        const voiceChannel = interaction.member.voice.channel;
        const userId = user.id;
        const userImageUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}`;
        const userName = user.username;
        if (!server) {
            return interaction.reply('Please run /playyt first');
        }
        else {
            server.songs.push(song);
            let embed = new EmbedBuilder()
                .setColor(0xe76680)
                .setAuthor({
                name: userName,
                iconURL: userImageUrl,
                url: `https://discord.com/users/${userId}`,
            })
                // .setDescription()
                // .setThumbnail(song.songInfo.videoDetails.thumbnails[0].url)
                .setTitle(server.songs[0].title)
                .setURL(server.songs[0].url)
                .setImage(server.songs[0].songInfo.videoDetails.thumbnails[0].url)
                .setTimestamp()
                .setFooter({
                text: 'Source: youtube.com',
            })
                .setFields({
                name: `Add`,
                value: `**${song.title}**`,
            });
            var message = messagesQueue.get(guildId);
            await message.edit({
                content: `> Playing from Youtube`,
                embeds: [embed],
                components: COMPONENT_PLAYING,
            });
            await interaction.followUp(`> Adding ${song.title} to queue`);
            await interaction.deleteReply();
        }
    }
    catch (error) {
        console.log('> error: ', error);
        interaction.channel.send('Error no server found');
    }
}
export async function loopyt(interaction) {
    if (!(interaction.channel.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    const guildId = interaction.guild.id || '';
    const server = queue.get(guildId);
    if (server.isLoop) {
        interaction.reply({ content: '> Stop looping current song' });
    }
    else {
        interaction.reply({ content: '> Looping current song' });
    }
    setTimeout(async () => {
        await interaction.deleteReply();
    }, 2000);
    server.isLoop = !server.isLoop;
}
export async function skipyt(interaction) {
    if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    interaction.reply({ content: '> Skiping to next song' });
    setTimeout(async () => {
        await interaction.deleteReply();
    }, 2000);
    const channel = interaction.channel;
    const guildId = interaction.guild.id;
    const server = queue.get(guildId);
    const song = server.songs.shift();
    const nextSong = server.songs[0];
    if (nextSong) {
        channel.send({
            content: `> Skip to **${nextSong.title}**`,
        });
        return server.player.play(nextSong.resource);
    }
    else {
        if (song) {
            const nextSong = await getNextRelatedSong(song);
            server.songs.push(nextSong);
            channel.send({
                content: `> Skip to next related song **${nextSong.title}**`,
            });
            server.player.play(nextSong.resource);
        }
        else {
            channel.send({
                content: `> No related song`,
            });
        }
    }
}
export async function pauseyt(interaction) {
    if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    const channel = interaction.channel;
    try {
        const guildId = interaction.guild.id;
        const server = queue.get(guildId);
        server.player.pause();
        interaction.reply({ content: `> Pausing` });
        setTimeout(async () => {
            await interaction.deleteReply();
        }, 2000);
        channel.send(`> Pausing`);
    }
    catch (error) {
        console.log('> error: ', error);
        channel.send(`Error`);
    }
}
export function resumeyt(interaction) {
    if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    const channel = interaction.channel;
    const guildId = interaction.guild.id;
    const server = queue.get(guildId);
    server.player.unpause();
    interaction.reply({ content: `> Resuming` });
    setTimeout(async () => {
        await interaction.deleteReply();
    }, 2000);
    channel.send({ content: `> Resume` });
}
export function stopyt(interaction) {
    if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return interaction.reply({
            content: 'You are not in a channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.guild instanceof Guild)) {
        return interaction.reply({
            content: 'You are not in a guild channel!',
            ephemeral: true,
        });
    }
    if (!(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
        });
    }
    const channel = interaction.channel;
    const guildId = interaction.guild.id;
    const server = queue.get(guildId);
    server.player.pause();
    server.connection.disconnect();
    server.connection.destroy();
    queue.delete(guildId);
    interaction.reply({ content: `> Stoping...` });
    setTimeout(async () => {
        interaction.deleteReply();
    }, 2000);
    channel.send({ content: `> Stop` });
}
function isUrl(url) {
    var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    var regex = new RegExp(expression);
    return url.match(regex) !== null;
}
async function getUrlFromQuery(query) {
    let url;
    if (!isUrl(query)) {
        url = await getYoutubeVideoUrl(query);
    }
    else {
        url = query;
    }
    return url;
}
function createSong(songInfo) {
    const stream = () => {
        if (songInfo.formats[0].isLive) {
            const format = ytdl.chooseFormat(songInfo.formats, {
                quality: [128, 127, 120, 96, 95, 94, 93],
            });
            console.log(format);
            return format.url;
        }
        else
            return ytdl.downloadFromInfo(songInfo, {
                filter: 'audioonly',
                highWaterMark: 1 << 30,
                liveBuffer: 10000,
                quality: 'highestaudio',
                // quality: 'lowestaudio',
                dlChunkSize: 1 << 30, //disabling chunking is recommended in discord bot
                // dlChunkSize: 0, //disabling chunking is recommended in discord bot
            });
    };
    // ytdl(songInfo.videoDetails.video_url, {
    //   // filter: 'audioonly',
    //   highWaterMark: 1 << 30,
    //   liveBuffer: 20000,
    //   // dlChunkSize: 4096,
    //   dlChunkSize: 0, //disabling chunking is recommended in discord bot
    //   quality: 'lowestaudio',
    //   format: {itag: 94} as videoFormat,
    // });
    const resource = createAudioResource(stream());
    const song = {
        resource: resource,
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        songInfo: songInfo,
    };
    return song;
}
async function getNextRelatedSong(song) {
    const relatedVideos = song.songInfo.related_videos;
    const randomIndex = Math.floor(Math.random() * relatedVideos.length);
    const nextSongId = relatedVideos[randomIndex].id;
    const nextSongUrl = `https://youtube.com/watch?v=${nextSongId}`;
    const nextSongInfo = await ytdl.getInfo(nextSongUrl);
    const nextSong = createSong(nextSongInfo);
    return nextSong;
}
//# sourceMappingURL=musicyt.js.map