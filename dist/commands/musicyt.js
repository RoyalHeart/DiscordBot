import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, } from '@discordjs/voice';
import { ChannelType, Guild, GuildMember, } from 'discord.js';
import ytdl from 'ytdl-core';
import { getYoutubeVideoUrl } from './yt.js';
let queue = new Map();
export default async function playyt(interaction) {
    let song;
    let serverQueue;
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
    await interaction.deferReply();
    const channel = interaction.channel;
    const query = interaction.options.get('query').value;
    console.log('> Query:', query);
    const url = await getUrlFromQuery(query);
    const songInfo = await ytdl.getInfo(url);
    song = createSong(songInfo);
    const voiceChannel = interaction.member.voice.channel;
    const guildId = interaction.guild.id || '';
    if (!queue.get(guildId)) {
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
                connection: null,
                songs: [song],
                volume: 5,
                playing: true,
                isLoop: false,
            };
            serverQueue = queueContruct;
            queueContruct.connection = connection;
            queue.set(interaction.guild.id, queueContruct);
            connection.subscribe(player);
            player.play(song.resource);
            await interaction.followUp({
                content: `> Playing **${song.title}**`,
            });
        }
        catch (err) {
            console.log(err);
            queue.delete(guildId);
            player.stop();
            return interaction.channel.send(err);
        }
    }
    else {
        const serverQueue = queue.get(guildId);
        serverQueue.songs.push(song);
        if (queue.get(guildId).player.state.status === 'idle') {
            queue.get(guildId).player.play(song.resource);
            return interaction.channel.send(`> Playing **${song.title}**`);
        }
        await interaction.followUp(`> Adding ${song.title} to queue`);
        await interaction.deleteReply();
        return interaction.channel.send(`> Add **${song.title}** to the queue!`);
    }
    queue.get(guildId).player.on(AudioPlayerStatus.Buffering, async (e) => {
        console.log('> Loading', queue.get(guildId).songs[0].title);
    });
    queue.get(guildId).player.on(AudioPlayerStatus.Playing, (e) => {
        console.log('> Playing', queue.get(guildId).songs[0].title);
    });
    queue.get(guildId).player.on(AudioPlayerStatus.AutoPaused, (e) => {
        queue.get(guildId).player.play(queue.get(guildId).songs[0].resource);
        console.log('> Auto pause, play again');
    });
    queue.get(guildId).player.on(AudioPlayerStatus.Idle, async (e) => {
        console.log('> Idle');
        let currentSong = queue.get(guildId).songs.shift();
        let nextRelatedSong = getNextRelatedSong(currentSong);
        // loop song by create and add again
        if (queue.get(guildId).isLoop) {
            song = createSong(currentSong.songInfo);
            queue.get(guildId).songs.push(song);
            queue.get(guildId).player.play(song.resource);
        }
        // play next random related song
        if (queue.get(guildId).songs.length == 0) {
            song = await nextRelatedSong;
            queue.get(guildId).songs.push(song);
            console.log('> Song url:', song.url);
            await channel.send({
                content: `> Playing related song **${song.title}**`,
            });
            queue.get(guildId).player.play(song.resource);
            // play next query song
        }
        else {
            song = queue.get(guildId).songs[0];
            console.log('> Next song title' + song.title);
            if (song) {
                await channel.send({
                    content: `> Playing **${song.title}**`,
                });
                queue.get(guildId).player.play(song.resource);
            }
        }
    });
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
    if (queue.get(guildId).isLoop) {
        interaction.reply({ content: '> Stop looping current song' });
    }
    else {
        interaction.reply({ content: '> Looping current song' });
    }
    setTimeout(async () => {
        await interaction.deleteReply();
    }, 2000);
    queue.get(guildId).isLoop = !queue.get(guildId).isLoop;
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
    const song = queue.get(guildId).songs.shift();
    const nextSong = queue.get(guildId).songs[0];
    if (nextSong) {
        channel.send({
            content: `> Skip to **${nextSong.title}**`,
        });
        return queue.get(guildId).player.play(nextSong.resource);
    }
    else {
        if (song) {
            const nextSong = await getNextRelatedSong(song);
            queue.get(guildId).songs.push(nextSong);
            channel.send({
                content: `> Skip to next related song **${nextSong.title}**`,
            });
            queue.get(guildId).player.play(nextSong.resource);
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
    const guildId = interaction.guild.id;
    queue.get(guildId).player.pause();
    interaction.reply({ content: `> Pausing` });
    setTimeout(async () => {
        await interaction.deleteReply();
    }, 2000);
    channel.send(`> Pausing`);
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
    queue.get(guildId).player.unpause();
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
    queue.get(guildId).player.pause();
    queue.get(guildId).connection.disconnect();
    queue.get(guildId).connection.destroy();
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
    const stream = ytdl(songInfo.videoDetails.video_url, {
        filter: 'audioonly',
        highWaterMark: 1 << 30,
        liveBuffer: 20000,
        // dlChunkSize: 4096,
        dlChunkSize: 0,
        quality: 'lowestaudio',
    });
    const resource = createAudioResource(stream, {
        metadata: {
            title: songInfo.videoDetails.title,
        },
    });
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