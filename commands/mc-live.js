var socket = require('socket.io-client')('wss://prism.theak.io:443');
var moment = require('moment');
var Discord = require(`discord.js`);
require('moment-recur');

module.exports = {
    name: 'mc-live',
	description: 'mc-live',
	execute(message, args) {

        //if(message.author.id != "187986160914661377") return;

        if(args.length >= 1 && args[0] == 'stop'){
            socket.off();
            socket.close();
            message.channel.send('MCTL Track Reporting Stopped');
            return false;
        } 
        if(args.length >= 1 && args[0] == 'livestop'){
            message.member.voiceChannel.leave();
            return false;
        } 
        if(args.length >= 1 && args[0] == 'live'){
            
            if(!socket.connected){
                socket.open();
                } 
                if(socket.hasListeners('new-track')){
                    //console.log('Off');
                    socket.off()
                }
                socket.on('new-track', function(data){
                    mctl = data
                    var track_artists = mctl.artists;
                    var artist_collection = "";
        
                    for (var i=0; i < track_artists.length; i++) {
                        if(i == 0) {
                            artist_collection = track_artists[i].name;
                        } else {
                            artist_collection = artist_collection + ", " + track_artists[i].name;
                        }
                    }
        
                        if(mctl.youtube != undefined)
                            {message.channel.send({embed: {
                                title: `🎶 Now Playing on Monstercat FM: ${artist_collection} - ${mctl.title} `,
                                url: "http://twitch.tv/monstercat",
        
                                color: 0x000000,
                                thumbnail: {
                                    url: mctl.album_cover,
                                },
                                description: `[Listen on Spotify](${mctl.track_shortlink}) \n[Listen on YouTube](${mctl.youtube})\n [MCTL Website](https://mctl.io/)`,
                                footer: {
                                    icon_url: "https://images-ext-1.discordapp.net/external/gJnNg5O5sQtjxqjfbPJxsteW3slu549UJ2sF7XQCYP0/https/mctl.io/assets/img/mctl-logo-square.png",
                                    text: "Information provided by mctl.io"
                                }
                            }});}
                            else{ message.channel.send({embed: {
                                title: `🎶 Now Playing on Monstercat FM: ${artist_collection} - ${mctl.title} `,
                                url: "http://twitch.tv/monstercat",
                
                                color: 0x000000,
                                thumbnail: {
                                    url: mctl.album_cover,
                                },
                                description: `[Listen on Spotify](${mctl.track_shortlink})\n [MCTL Website](https://mctl.io/)`,
                                footer: {
                                    icon_url: "https://images-ext-1.discordapp.net/external/gJnNg5O5sQtjxqjfbPJxsteW3slu549UJ2sF7XQCYP0/https/mctl.io/assets/img/mctl-logo-square.png",
                                    text: "Information provided by mctl.io"
                                }
                            }});}
                });
                socket.on('disconnect', function(){});
                //socket.on('pong', function(ms){});
                socket.emit('last-track')
                //socket.on('connect', function(){socket.emit('last-track');console.log('Running');console.log(socket.id); console.log(socket.connected);});
                return false;
        } 

        
        var myDate, recurrence;
        var format = 'hh:mm:ss';
        beforeTime = moment('14:50:00', format),
        afterTime = moment('15:05:00', format);
        myDate = moment();
        recurrence = myDate.recur().every(['wednesday']).daysOfWeek(); 
        //Snag title here or we run into scoping issues.
        //Scoping issues are an absolute pain.

        if(recurrence.matches(moment())){
            //console.log('Match!');
            if(moment().isBetween(beforeTime, afterTime)){
                
                var twitchStreams = require('twitch-get-stream')('f2o1xgopf1l3pw8tk907q91mhiyh5q');
                twitchStreams.get('monstercat')
                    .then(function(streams) {
                        //console.log(streams);
                        const Discord = require('discord.js');
                        const client = new Discord.Client();
                        var sourceStream = null;
                        for(var i = 0; i < streams.length; i++){
                            if(streams[i] != null && streams[i].quality.toLowerCase() == 'audio only'){
                                sourceStream = streams[i];
                            }
                        }

                        
                        console.log(sourceStream);
                        if(sourceStream != null){
                            if (message.member.voiceChannel) {
                            message.member.voiceChannel.join()
                            .then(connection => { // Connection is an instance of VoiceConnection
                                //message.reply('I have successfully connected to the channel!');
                                connection.playArbitraryInput(sourceStream.url);
                                const embed = new Discord.RichEmbed()
                                    .setTitle('Monstercat: Call of the Wild')
                                    .setDescription(`Now Playing \n\n [Listen on Monstercat.com](https://live.monstercat.com/)`)
                                    .setColor(0xDD2E44)
                                    .setThumbnail(`https://www.monstercat.com/podcast/itunes_cover.jpg`)
                                message.channel.send({embed: embed});
                            }).error(err => {
                                message.channel.send('There was an error connecting to the stream');
                            });
                            }
                        }
                    });
                console.log('And we\'re playing!');
                
            } else {
                if(moment().isAfter(afterTime)){
                    //message.channel.send('We missed the stream! Come back next week :c');
                } else {
                    difference = moment().to(beforeTime);
                    //message.channel.send('It\'s too early! Come back in ' + difference);
                    const embed = new Discord.RichEmbed()
                        
                        .setTitle('Monstercat: Call of the Wild')
                        .setDescription(`Next episode ${difference} \n\n [Listen on Monstercat.com](https://live.monstercat.com/)`)
                        .setColor(0xDD2E44)
                        .setThumbnail(`https://www.monstercat.com/podcast/itunes_cover.jpg`)
                    message.channel.send({embed: embed});
                }
            }
        } else {
            //need a moment for next wednesday.
            var nextWednesday;
            const dayINeed = 3; // for Wednesday
            //const dayINeed = 5;
            const today = moment().isoWeekday();

            // if we haven't yet passed the day of the week that I need:
            if (today <= dayINeed) { 
            // then just give me this week's instance of that day
                nextWednesday = moment().isoWeekday(dayINeed);
            } else {
            // otherwise, give me *next week's* instance of that same day
                nextWednesday = moment().add(1, 'weeks').isoWeekday(dayINeed);
            }
            difference = moment().to(nextWednesday);
            //message.channel.send('Come back in ' + difference);
            const embed = new Discord.RichEmbed()
                
                .setTitle('Monstercat: Call of the Wild')
                .setDescription(`Next episode ${difference} \n\n [Listen on Monstercat.com](https://live.monstercat.com/)`)
                .setColor(0xDD2E44)
                .setThumbnail(`https://www.monstercat.com/podcast/itunes_cover.jpg`)
            message.channel.send({embed: embed});
        }
         


        return false;
    }};
