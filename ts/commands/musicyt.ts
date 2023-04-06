import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
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
import ytdl from 'ytdl-core';
import {getYoutubeVideoUrl} from './yt.js';

let queue = new Map<string, ServerQueue>();
export default async function playyt(interaction: ChatInputCommandInteraction) {
  let song: Song;
  let serverQueue: ServerQueue;
  const player = createAudioPlayer({
    behaviors: {
      maxMissedFrames: 20,
    },
  });
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

  const query = interaction.options.get('query')?.value as string;
  console.log('> Query:', query);
  const url = await getUrlFromQuery(query);
  const songInfo = await ytdl.getInfo(url);
  song = createSong(songInfo);

  const voiceChannel = interaction.member.voice.channel;
  const guildId: string = interaction.guild.id || '';
  if (!queue.get(guildId)) {
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
        connection: null as any,
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
    } catch (err) {
      console.log(err);
      queue.delete(guildId);
      player.stop();
      return interaction.channel!.send(err);
    }
  } else {
    queue.get(guildId)?.songs.push(song);
    if (player.state.status === 'idle') {
      player.play(song.resource);
      return interaction.channel.send(`> Playing **${song.title}**`);
    }
    await interaction.followUp(`> Adding ${song.title} to queue`);
    await interaction.deleteReply();
    return interaction.channel.send(`> Add **${song.title}** to the queue!`);
  }

  player.on(AudioPlayerStatus.Buffering, async (e: any) => {
    console.log('> Loading', queue.get(guildId)!.songs[0].title);
  });
  player.on(AudioPlayerStatus.Playing, (e: any) => {
    console.log('> Playing', queue.get(guildId)!.songs[0].title);
  });
  player.on(AudioPlayerStatus.AutoPaused, (e) => {
    player.play(queue.get(guildId)!.songs[0].resource);
    console.log('> Auto pause');
  });
  player.on(AudioPlayerStatus.Idle, async (e) => {
    console.log('> Idle');
    let currentSong = queue.get(guildId)?.songs.shift()!;
    let nextRelatedSong = getNextRelatedSong(currentSong);
    // loop song by create and add again
    if (queue.get(guildId)?.isLoop) {
      song = createSong(currentSong.songInfo);
      queue.get(guildId)?.songs.push(song);
      player.play(song.resource);
    }
    // play next random related song
    if (queue.get(guildId)?.songs.length == 0) {
      song = await nextRelatedSong;
      queue.get(guildId)?.songs.push(song);
      console.log('> Song url:', song.url);
      await channel.send({
        content: `> Playing related song **${song.title}**`,
      });
      player.play(song.resource);
      // play next query song
    } else {
      song = queue.get(guildId)!.songs[0];
      console.log('> Next song title' + song.title);
      if (song) {
        await channel.send({
          content: `> Playing **${song.title}**`,
        });
        player.play(song.resource);
      }
    }
  });
}

export async function loopyt(interaction: ChatInputCommandInteraction) {
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
  const guildId: string = interaction.guild.id || '';
  if (queue.get(guildId)?.isLoop) {
    interaction.reply({content: '> Stop looping current song'});
  } else {
    interaction.reply({content: '> Looping current song'});
  }
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  queue.get(guildId)!.isLoop = !queue.get(guildId)?.isLoop;
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
  const song = queue.get(guildId)?.songs.shift();
  const nextSong = queue.get(guildId)?.songs[0];
  if (nextSong) {
    channel.send({
      content: `> Skip to **${nextSong.title}**`,
    });
    return queue.get(guildId)?.player.play(nextSong.resource);
  } else {
    if (song) {
      const nextSong = await getNextRelatedSong(song);
      queue.get(guildId)?.songs.push(nextSong);
      channel.send({
        content: `> Skip to next related song **${nextSong.title}**`,
      });
      queue.get(guildId)?.player.play(nextSong.resource);
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
  queue.get(guildId)?.player.pause();
  interaction.reply({content: `> Pausing`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  channel.send(`> Pausing`);
}

export async function resumeyt(interaction: ChatInputCommandInteraction) {
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
  const guildId = interaction.guild.id;
  queue.get(guildId)?.player.unpause();
  interaction.reply({content: `> Resume`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  interaction.channel.send({content: `> Resume`});
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
  connection: any;
  songs: Array<Song>;
  volume: 5;
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
  const stream = ytdl(songInfo.videoDetails.video_url, {
    filter: 'audioonly',
    highWaterMark: 1 << 30,
    liveBuffer: 20000,
    // dlChunkSize: 4096,
    dlChunkSize: 0, //disabling chunking is recommended in discord bot
    quality: 'lowestaudio',
  });

  const resource = createAudioResource(stream, {
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
