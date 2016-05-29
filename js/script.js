/*global $, console */

$(document).ready(function () {
    "use strict";
  
    function getTwitchJSON() {
        var channels = ["syndicate", "riotgames", "esl_csgo", "summit1g", "LIRIK", "Nightblue3", "captainsparklez", "PhantomL0rd", "sodapoppin", "FreeCodeCamp"],
            channelsCollection = [],
            apiURL = "https://api.twitch.tv/kraken/streams/",
            i;
    
        function ChannelMaker(twitchData, channelName) {
            //Channel closed or never existed
            if (twitchData.hasOwnProperty("status")) {
                if (twitchData.status === 422) {
                    this.channelName = channelName;
                    this.status = "Closed";
                }
            //Channel is offline
            } else if (twitchData.stream === null) {
                this.channelName = channelName;
                this.status = "Offline";
            //Channel is online
            } else {
                this.channelName = channelName;
                this.logoImgSrc = twitchData.stream.channel.logo;
                //Limit description of stream to 24 characters (styling decision)
                this.description = (twitchData.stream.channel.game).substring(0, 18) + " . . .";
                this.channelLink = twitchData.stream.channel.url;
                this.status = "Online";
            }

        }
    
        function getChannelData(url, channelName) {
            $.getJSON(url, function (data) {
                var channelObject = new ChannelMaker(data, channelName);
                return channelObject;
            });
        }
    
        for (i = 0; i < channels.length; i += 1) {
            channelsCollection.push(getChannelData(apiURL + channels[i], channels[i]));
        }
    
        console.log(channelsCollection);
    }
  
    getTwitchJSON();
  
});