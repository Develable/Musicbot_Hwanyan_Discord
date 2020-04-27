const { Client } = require('discord.js');
const ytdl = require('ytdl-core');
const Discord = require("discord.js");
const client = new Client();
const setting = require("./settings.json");

const Token = setting.Token;
const prefix = setting.prefix;

const cmdlist = ['재생', '일시정지', '재시작', '건너뛰기', '접속', '추가', '재생목록', '도움말'];

let queue = {};
let playing = {};
let pausing = {};
let dispatcher;

const commands = {
	'재생': (msg) => {
		if (queue[msg.guild.id] === undefined) {
			let PlayerrEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: EMPTY_LIST", `추가된 노래가 없다냥!, **${prefix} 추가** 로 노래를 추가하라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(PlayerrEmbed);
		}
		if (!msg.guild.voiceConnection) {
			let NoVoiceEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: CHANNEL_NOT_JOINED", `채널에 접속되어있지 않다냥!, **${prefix} 접속** 으로 채널에 접속하라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(NoVoiceEmbed);
		}
		if (queue[msg.guild.id].playing) return msg.channel.send('이미 재생중이다냥...');
		queue[msg.guild.id].playing = true;
		playing[msg.guild.id] = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.send('모든 곡을 재생했다냥\n고로 난 나가겠다냥!').then(() => {
				queue[msg.guild.id].playing = false;
				playing[msg.guild.id] = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.send(`**${song.requester}**(이)가 신청한 **${song.title}**(을)를 재생하겠다냥!`);
			dispatcher = msg.guild.voiceConnection.playStream(ytdl(song.url, { audioonly: true }), { passes : 1 });
			dispatcher.on('end', () => {
				play(queue[msg.guild.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					play(queue[msg.guild.id].songs.shift());
				});
			});
		})(queue[msg.guild.id].songs.shift());
	},
	'일시정지': (msg) => {
		if (playing[msg.guild.id] != true) {
			let PlayerrEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: SONG_NOT_PLAYING", `노래를 안 틀고 있다냥!, **${prefix} 재생** 으로 노래를 틀으라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(PlayerrEmbed);
		}
		dispatcher.pause();
		msg.channel.send("노래를 멈췄다냥!");
		pausing[msg.guild.id] = true;
	},
	'재시작': (msg) => {
		if (pausing[msg.guild.id] != true) {
			let PauseEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: NOT_PAUSING", `일시정지 중이 아니다냥!, **${prefix} 일시정지** 로 노래를 일시정지하라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(PauseEmbed);
		}
		dispatcher.resume();
		msg.channel.send("노래를 다시 틀겠다냥!");
		pausing[msg.guild.id] = false;
	},
	'건너뛰기': (msg) => {
		if (playing[msg.guild.id] != true) {
			let PlayerrEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: SONG_NOT_PLAYING", `노래를 안 틀고 있다냥!, **${prefix} 재생** 으로 노래를 틀으라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(PlayerrEmbed);
		}
		dispatcher.end();
		msg.channel.send("노래를 건너뛴다냥!");
	},
	'접속': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			var channel = ''+voiceChannel;
			channel = channel.split('#');
			if (!voiceChannel || voiceChannel.type !== 'voice') {
				let joinerrEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: CANNOT_JOIN_CHANNEL", `네 채널에 들어갈 수 없다냥...\n네가 음성채널에 있는지, 내가 연결과 발언권을 가지고 있는지 다시 확인해라냥 -_-`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
				return msg.channel.send(joinerrEmbed);
			}
			voiceChannel.join().then(connection => {
				resolve(connection);
				msg.channel.send(`${msg.member.voiceChannel} 에 접속했다냥!`);
			}).catch(err => reject(err));
		});
	},
	'추가': (msg) => {
		let url = msg.content.split(' ')[2];
		if (url == '' || url === undefined) {
			let adderrEmbed = new Discord.RichEmbed()
			.setTitle("문제가 생겼다냥!")
			.setColor(0xff0000)
			.addField("ERR :: URL_IS_EMPTY", `**${prefix} 추가** 뒤에 유튜브 링크가 와야한다냥!`)
			.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(adderrEmbed);
		}
		ytdl.getInfo(url, (err, info) => {
			if(err) {
				let adderrEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField(""+err+"", `올바른 유튜브 링크인지 다시 확인 해 보라냥!\n검색은 아직 지원 안한다냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
				return msg.channel.send(adderrEmbed);
			}
			if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
			queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
			msg.channel.sendMessage(`**${info.title}**(을)를 재생목록에 추가했다냥!`);
		});
	},
	'재생목록': (msg) => {
		if (queue[msg.guild.id] === undefined) {
			let PlayErrEmbed_2 = new Discord.RichEmbed()
			.setTitle("문제가 생겼다냥!")
			.setColor(0xff0000)
			.addField("ERR :: EMPTY_LIST", `추가된 노래가 없다냥!, **${prefix} 추가** 로 노래를 추가하라냥!`)
			.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			return msg.channel.send(PlayErrEmbed_2);
		}
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} 이며, ${song.requester}(이)가 신청했다냥!`);});
		msg.channel.sendMessage(`__**${msg.guild.name}**__ 서버에는 지금 **${tosend.length}**개의 노래가 추가되어 있다냥! ${(tosend.length > 15 ? '***(다만, 15개까지만 보여준다냥!)***' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'도움말': (msg) => {
		let helpEmbed = new Discord.RichEmbed()
			.setTitle("화냥봇 도움말!")
			.setColor(0x00ff77)
			.addField(`${prefix} 도움말`, "이 도움말을 볼 수 있다냥!")
			.addField(`${prefix} 채널접속`, "너의 음성채널에 접속한다냥!")
			.addField(`${prefix} 추가`, "너가 듣고 싶은 노래를 추가할 수 있다냥!")
			.addField(`${prefix} 재생`, "추가해논 노래를 재생한다냥!")
			.addField(`${prefix} 일시정지`, "노래를 일시정지한다냥!")
			.addField(`${prefix} 재시작`, "노래를 다시 튼다냥!")
			.addField(`${prefix} 건너뛰기`, "노래를 건너 뛴다냥!")
			.addField(`${prefix} 재생목록`, "재생목록을 보여준다냥!")
			.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
		msg.channel.send(helpEmbed);
	}/**,
	'reboot': (msg) => {
		if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
	}*/
};

client.on('ready', () => {
	console.log('화냥봇 준비 완료!\nMade By Endom. | Text By HwaHyang. | ⓒ Team.화공\n\n이용 도중 오류 발생 시, 아래 연락처로 연락주세요!\nEmail : kangs7721@naver.com | Discord : https://invite.gg/rutapofficial');
});

client.on('message', msg => {
	
	if (playing[msg.guild.id] == undefined) {
		playing[msg.guild.id] = false;
	} if (pausing[msg.guild.id] == undefined) {
		pausing[msg.guild.id] = false;
	}
	var seconCnt = 0;
	var msgC = msg.content.split(" ");
	var cmd = msgC[0];
	var msgSecon = msgC[1];

	if (cmd == prefix) {
		for (var i = 0; i < cmdlist.length; i++) {
			if (msgSecon == cmdlist[i]) {
				seconCnt++;
			}
		}
		if (seconCnt == 0) {
			let noCmdEmbed = new Discord.RichEmbed()
				.setTitle("문제가 생겼다냥!")
				.setColor(0xff0000)
				.addField("ERR :: NOT_COMMAND", `알 수 없는 명령어다냥!, **${prefix} 도움말** 로 명령어를 확인하라냥!`)
				.setFooter("Made By Endom. | Text By HwaHyang. | ⓒ Team.화공");
			msg.channel.send(noCmdEmbed);
		} else {
			commands[msgC[1]](msg);
			seconCnt = 0;
		}
	}

});
client.login(Token);