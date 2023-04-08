import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import {
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  NewsChannel,
  TextChannel,
  VoiceBasedChannel,
} from 'discord.js';
import ytdl, {videoFormat} from 'ytdl-core';
import {getYoutubeVideoUrl} from './yt.js';

let queue = new Map<string, ServerQueue>();
export default async function playyt(interaction: ChatInputCommandInteraction) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  await interaction.deferReply();
  const channel = interaction.channel;
  var server: ServerQueue;
  var song: Song;
  try {
    const query = interaction.options.get('query')!.value as string;
    console.log('> Query:', query);
    const url = await getUrlFromQuery(query);
    const songInfo = await ytdl.getInfo(url);
    song = createSong(songInfo);
    const voiceChannel = interaction.member.voice.channel;
    const guildId: string = interaction.guild.id || '';
    if (!queue.get(guildId)) {
      const player = createAudioPlayer({
        behaviors: {
          maxMissedFrames: 20,
        },
      });
      try {
        const connection = joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guildId as string,
          adapterCreator: interaction.member.guild.voiceAdapterCreator as any,
          selfMute: false,
        });
        const queueContruct: ServerQueue = {
          player: player,
          textChannel: interaction.channel,
          voiceChannel: voiceChannel,
          connection: connection,
          songs: [song],
          playing: true,
          isLoop: false,
        };
        server = queueContruct;
        queue.set(guildId, queueContruct);
        connection.subscribe(player);
        player.play(song.resource);
        await interaction.followUp({
          content: `> Playing **${song.title}**`,
        });
      } catch (err) {
        console.log(err);
        queue.delete(guildId);
        player.stop();
        return interaction.channel!.send(err);
      }
    } else {
      const serverQueue = queue.get(guildId);
      server = serverQueue as ServerQueue;
      serverQueue!.songs.push(song);
      if (queue.get(guildId)!.player.state.status === 'idle') {
        queue.get(guildId)!.player.play(song.resource);
        return interaction.channel.send(`> Playing **${song.title}**`);
      }
      await interaction.followUp(`> Adding ${song.title} to queue`);
      await interaction.deleteReply();
      return interaction.channel.send(`> Add **${song.title}** to the queue!`);
    }

    server.player.on(AudioPlayerStatus.Buffering, async (e: any) => {
      console.log('> Loading', server.songs[0].title);
    });
    server.player.on(AudioPlayerStatus.Playing, (e: any) => {
      console.log('> Playing', server.songs[0].title);
    });
    server.player.on(AudioPlayerStatus.AutoPaused, (e) => {
      server.player.play(server.songs[0].resource);
      console.log('> Auto pause, play again');
    });
    server.player.on(AudioPlayerStatus.Idle, async (e) => {
      try {
        console.log('> Idle');
        let currentSong = server.songs.shift()!;
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
        } else {
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
      } catch (error) {
        console.log('> Error: ' + error);
      }
    });
  } catch (error) {
    console.log('> Error: ' + error);
  }
}

export async function loopyt(interaction: ChatInputCommandInteraction) {
  if (!(interaction.channel!.type === ChannelType.GuildText)) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const guildId: string = interaction.guild.id || '';
  const server = queue.get(guildId);
  if (server!.isLoop) {
    interaction.reply({content: '> Stop looping current song'});
  } else {
    interaction.reply({content: '> Looping current song'});
  }
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  server!.isLoop = !server!.isLoop;
}

export async function skipyt(interaction: ChatInputCommandInteraction) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  interaction.reply({content: '> Skiping to next song'});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  const channel = interaction.channel;
  const guildId = interaction.guild.id;
  const server = queue.get(guildId);
  const song = server!.songs.shift();
  const nextSong = server!.songs[0];
  if (nextSong) {
    channel.send({
      content: `> Skip to **${nextSong.title}**`,
    });
    return server!.player.play(nextSong.resource);
  } else {
    if (song) {
      const nextSong = await getNextRelatedSong(song);
      server!.songs.push(nextSong);
      channel.send({
        content: `> Skip to next related song **${nextSong.title}**`,
      });
      server!.player.play(nextSong.resource);
    } else {
      channel.send({
        content: `> No related song`,
      });
    }
  }
}

export async function pauseyt(interaction: ChatInputCommandInteraction) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const channel = interaction.channel;
  const guildId = interaction.guild.id;
  const server = queue.get(guildId);
  server!.player.pause();
  interaction.reply({content: `> Pausing`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  channel.send(`> Pausing`);
}

export function resumeyt(interaction: ChatInputCommandInteraction) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const channel = interaction.channel;
  const guildId = interaction.guild.id;
  const server = queue.get(guildId);
  server!.player.unpause();
  interaction.reply({content: `> Resuming`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  channel.send({content: `> Resume`});
}
export function stopyt(interaction: ChatInputCommandInteraction) {
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
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const channel = interaction.channel;
  const guildId = interaction.guild.id;
  const server = queue.get(guildId);
  server!.player.pause();
  server!.connection.disconnect();
  server!.connection.destroy();
  queue.delete(guildId);
  interaction.reply({content: `> Stoping...`});
  setTimeout(async () => {
    interaction.deleteReply();
  }, 2000);
  channel.send({content: `> Stop`});
}
interface Song {
  resource: AudioResource;
  title: string;
  url: string;
  songInfo: ytdl.videoInfo;
}
interface ServerQueue {
  player: AudioPlayer;
  textChannel: NewsChannel | TextChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection;
  songs: Array<Song>;
  playing: true;
  isLoop: boolean | null;
}

function isUrl(url: string): boolean {
  var expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  var regex = new RegExp(expression);
  return url.match(regex) !== null;
}

async function getUrlFromQuery(query: string): Promise<string> {
  let url;
  if (!isUrl(query)) {
    url = await getYoutubeVideoUrl(query);
  } else {
    url = query;
  }
  return url;
}

function createSong(songInfo: ytdl.videoInfo): Song {
  console.log(songInfo.formats);
  const stream = () => {
    if (songInfo.formats[0].isLive) {
      const format = ytdl.chooseFormat(songInfo.formats, {
        quality: [128, 127, 120, 96, 95, 94, 93],
      });
      console.log(format);
      return format.url;
    } else
      return ytdl.downloadFromInfo(songInfo, {
        filter: 'audioonly',
        highWaterMark: 1 << 30,
        liveBuffer: 20000,
        quality: 'lowestaudio',
        dlChunkSize: 0, //disabling chunking is recommended in discord bot
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

  const resource = createAudioResource(stream(), {
    metadata: {
      title: songInfo.videoDetails.title,
    },
  });

  const song: Song = {
    resource: resource,
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    songInfo: songInfo,
  };

  return song;
}

async function getNextRelatedSong(song: Song): Promise<Song> {
  const relatedVideos = song.songInfo.related_videos;
  const randomIndex = Math.floor(Math.random() * relatedVideos.length);
  const nextSongId = relatedVideos[randomIndex].id;
  const nextSongUrl = `https://youtube.com/watch?v=${nextSongId}`;
  const nextSongInfo = await ytdl.getInfo(nextSongUrl);
  const nextSong = createSong(nextSongInfo);
  return nextSong;
}
