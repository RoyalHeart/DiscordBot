import {Player, QueryType, Queue} from 'discord-player';
import {ChatInputCommandInteraction, GuildMember} from 'discord.js';
import {client} from '../deploy.js';
import ytdl from 'ytdl-core';
import {getYoutubeVideoUrl} from './yt.js';
export async function test(interaction: ChatInputCommandInteraction) {
  let url = await getYoutubeVideoUrl('hi ren');
  const info = await ytdl.getBasicInfo(url);
  // console.log('> info', info);
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return void interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const voiceChannel = interaction.member.voice.channel;
  console.log('> voice channel', voiceChannel);
  info.videoDetails.title;
}
let havePlayer: boolean = false;
let player: Player;
export default async function (interaction: ChatInputCommandInteraction) {
  if (!havePlayer) {
    player = getPlayer();
    havePlayer = true;
  }
  const queue = player!.createQueue(interaction.guild!, {
    metadata: interaction.channel,
  });
  if (!interaction.isCommand() || !interaction.guildId) return;

  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  if (interaction.commandName === 'play') {
    await interaction.deferReply();
    const query = interaction.options.get('query')?.value as string;
    const searchResult = await player!
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })
      .catch(() => {});
    if (!searchResult || !searchResult.tracks.length)
      return void interaction.followUp({content: 'No results were found!'});
    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      void player!.deleteQueue(interaction.guildId);
      return void interaction.followUp({
        content: 'Could not join your voice channel!',
      });
    }
    await interaction.followUp({
      content: `⏱ | Loading your ${
        searchResult.playlist ? 'playlist' : 'track'
      }...`,
    });
    searchResult.playlist
      ? queue.addTracks(searchResult.tracks)
      : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
  } else if (interaction.commandName === 'skip') {
    await interaction.deferReply();
    const queue = player!.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | No music is being played!',
      });
    const currentTrack = queue.current;
    const success = queue.skip();
    return void interaction.followUp({
      content: success
        ? `✅ | Skipped **${currentTrack}**!`
        : '❌ | Something went wrong!',
    });
  } else if (interaction.commandName === 'stop') {
    await interaction.deferReply();
    const queue = player!.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | No music is being played!',
      });
    queue.destroy();
    return void interaction.followUp({content: '🛑 | Stopped the player!'});
  } else {
    interaction.reply({
      content: 'Unknown command!',
      ephemeral: true,
    });
  }
}

function getPlayer(): Player {
  const player = new Player(client, {ytdlOptions: {quality: 'lowestaudio'}});
  player.on('error', (queue, error) => {
    console.log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  });
  player.on('connectionError', (queue, error) => {
    console.log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );
  });

  player.on('trackStart', (queue: Queue<any>, track) => {
    console.log(queue);
    queue.metadata.send(
      `🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
    );
  });

  player.on('trackAdd', (queue: Queue<any>, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });

  player.on('botDisconnect', (queue: Queue<any>) => {
    queue.metadata.send(
      '❌ | I was manually disconnected from the voice channel, clearing queue!'
    );
  });

  player.on('channelEmpty', (queue: Queue<any>) => {
    queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
  });

  player.on('queueEnd', (queue: Queue<any>) => {
    queue.metadata.send('✅ | Queue finished!');
  });
  return player;
}
// async function execute(message, serverQueue) {
//   const args = message.content.split(' ');

//   const voiceChannel = message.member.voice.channel;
//   if (!voiceChannel)
//     return message.channel.send(
//       'You need to be in a voice channel to play music!'
//     );
//   const permissions = voiceChannel.permissionsFor(message.client.user);
//   if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
//     return message.channel.send(
//       'I need the permissions to join and speak in your voice channel!'
//     );
//   }

//   const songInfo = await ytdl.getInfo(args[1]);
//   let song: Song = {
//     title: songInfo.videoDetails.title,
//     url: songInfo.videoDetails.video_url,
//   };
//   interface Song {
//     title: string;
//     url: string;
//   }
//   if (!serverQueue) {
//     const queueContruct = {
//       textChannel: message.channel,
//       voiceChannel: voiceChannel,
//       connection: null,
//       songs: [song],
//       volume: 5,
//       playing: true,
//     };

//     queue.set(message.guild.id, queueContruct);

//     queueContruct.songs.push(song);

//     try {
//       var connection = await voiceChannel.join();
//       queueContruct.connection = connection;
//       play(message.guild, queueContruct.songs[0]);
//     } catch (err) {
//       console.log(err);
//       queue.delete(message.guild.id);
//       return message.channel.send(err);
//     }
//   } else {
//     serverQueue.songs.push(song);
//     return message.channel.send(`${song.title} has been added to the queue!`);
//   }
// }

// function skip(message, serverQueue) {
//   if (!message.member.voice.channel)
//     return message.channel.send(
//       'You have to be in a voice channel to stop the music!'
//     );
//   if (!serverQueue)
//     return message.channel.send('There is no song that I could skip!');
//   serverQueue.connection.dispatcher.end();
// }

// function stop(message, serverQueue) {
//   if (!message.member.voice.channel)
//     return message.channel.send(
//       'You have to be in a voice channel to stop the music!'
//     );
//   serverQueue.songs = [];
//   serverQueue.connection.dispatcher.end();
// }
// const queue = new Map();
// function play(guild, song) {
//   const serverQueue = queue.get(guild.id);
//   if (!song) {
//     serverQueue.voiceChannel.leave();
//     queue.delete(guild.id);
//     return;
//   }

//   const dispatcher = serverQueue.connection
//     .play(ytdl(song.url))
//     .on('finish', () => {
//       serverQueue.songs.shift();
//       play(guild, serverQueue.songs[0]);
//     })
//     .on('error', (error) => console.error(error));
//   dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
//   serverQueue.textChannel.send(`Start playing: **${song.title}**`);
// }
