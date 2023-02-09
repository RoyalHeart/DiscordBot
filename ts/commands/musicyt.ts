import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import {
  BaseGuildTextChannel,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  TextBasedChannelMixin,
} from 'discord.js';
import ytdl from 'ytdl-core';
import {getYoutubeVideoUrl} from './yt.js';
import {Channel} from 'diagnostics_channel';
import {Readable} from 'stream';

export async function test(interaction: ChatInputCommandInteraction) {
  let url = await getYoutubeVideoUrl('hi ren');
  const info = await ytdl.getBasicInfo(url);
  // console.log('> info', info);
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const voiceChannel = interaction.member.voice.channel;
  console.log('> voice channel', voiceChannel);
  info.videoDetails.title;
}
interface Song {
  resource: AudioResource;
  title: string;
  url: string;
}

let serverQueue: any;
let queue = new Map();
const player = createAudioPlayer({
  behaviors: {
    maxMissedFrames: 20,
  },
});
function isUrl(url: string): boolean {
  var expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  var regex = new RegExp(expression);
  return url.match(regex)!.length > 0;
}
export default async function playyt(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const query = interaction.options.get('query')?.value as string;
  let url;
  if (!isUrl(query)) {
    url = await getYoutubeVideoUrl(query);
  } else {
    url = query;
  }
  const songInfo = await ytdl.getInfo(url);
  const stream = ytdl(url, {
    filter: 'audioonly',
    quality: 'lowestaudio',
  });
  const resource = createAudioResource(stream, {
    metadata: {
      title: songInfo.videoDetails.title,
    },
    // inlineVolume: true,
  });
  let song: Song = {
    resource: resource,
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };
  if (!(interaction.channel instanceof BaseGuildTextChannel)) {
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
  const voiceChannel = interaction.member.voice.channel;
  if (!serverQueue) {
    try {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId as string,
        adapterCreator: interaction.member.guild.voiceAdapterCreator as any,
        selfMute: false,
      });
      const queueContruct = {
        textChannel: interaction.channel,
        voiceChannel: voiceChannel,
        connection: null as any,
        songs: [resource],
        volume: 5,
        playing: true,
      };
      serverQueue = queueContruct;
      queue.set(interaction.guild.id, queueContruct);
      queueContruct.connection = connection;
      try {
        connection.subscribe(player);
        player.play(song.resource);
        await interaction.followUp({
          content: `> Playing **${song.title}**`,
        });
      } catch (err) {
        console.log(err);
      }
      //   serverQueue.connection.subscribe(player);
      //   plays(queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(interaction.guild.id);
      player.stop();
      return interaction.channel!.send(err);
    }
  } else {
    await interaction.followUp(`> Adding ${song.title} to queue`);
    await interaction.deleteReply();
    serverQueue.songs.push(song);
    return interaction.channel.send(`> Add **${song.title}** to the queue!`);
  }
  player.on(AudioPlayerStatus.Buffering, async (e: any) => {
    // const title = await e.resource['metadata']['title'];
    console.log('> Loading', song.title);
  });
  player.on(AudioPlayerStatus.Playing, (e: any) => {
    // const title = e.resource['metadata']['title'];
    console.log('> Playing', song.title);
  });
  player.on(AudioPlayerStatus.AutoPaused, (e) => {
    console.log('> Auto pause');
  });
  player.on(AudioPlayerStatus.Idle, async (e) => {
    console.log('> Idle');
    serverQueue.songs.shift();
    const nextSong = serverQueue.songs[0];
    if (nextSong) {
      player.play(nextSong.resource);
      await interaction.channel?.send({
        content: `> Playing **${song.title}**`,
      });
    } else {
      await interaction.channel?.send({
        content: `> Queue is empty`,
      });
    }
  });
}

export async function skipyt(interaction: ChatInputCommandInteraction) {
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
  serverQueue.songs.shift();
  const nextSong = serverQueue.songs[0];
  if (nextSong) {
    interaction.channel?.send({
      content: `> Skip to ${nextSong.title}`,
    });
    return player.play(nextSong.resource);
  } else {
    interaction.channel?.send({
      content: `> No next song`,
    });
  }
}
export async function pauseyt(interaction: ChatInputCommandInteraction) {
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
  player.pause();
  interaction.reply({content: `> Pausing`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  interaction.channel?.send({content: `> Pausing`});
}
export async function resumeyt(interaction: ChatInputCommandInteraction) {
  player.unpause();
  interaction.reply({content: `> Resume`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  interaction.channel?.send({content: `> Resume`});
}
