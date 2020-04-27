const Discord = require("discord.js");
const dscl = new Discord.Client();
const setting = require("./game_setting.json");

const Token = setting.Token;
const owner = setting.owner;
const prefix = setting.prefix;

dscl.on("ready", () => {
    console.log("화냥봇 게임모듈 준비!");
});

dscl.on("message", (msg) => {
    var msgC = msg.content.split(" ");
	var cmd = msgC[0];
	var msgSecon = msgC[1];

    if (cmd == prefix) {
		if (msg.author.id == owner) {
			switch(msgSecon) {
				case "게임설정":
					var gametext = '';
					msg.delete();
					for (var i = 2; i < msgC.length; i++) {
						gametext = gametext + (msgC[i] + ' ');
					}
					dscl.user.setActivity(gametext, {type: "PLAYING"});
					msg.channel.send(`**${gametext}**을(를) 플레이한다냥!`);
					break;
			}
		} else {
			msg.reply("어디서 주인도 아닌게 까부냥! ㅇㅅㅇ");
		}
	}
});

dscl.login(Token);