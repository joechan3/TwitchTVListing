/*global $, console, Mustache */

$(document).ready(function () {
    "use strict";
  
    function getTwitchJSON(callback) {
        var channels = ["StreamerHouse", "Monstercat", "esl_csgo", "summit1g", "BobRoss", "TwinGalaxies",
                        "Food", "MedryBW", "FreeCodeCamp", "comster404"],
            channelsCollection = [],
            apiURL = "https://api.twitch.tv/kraken/streams/",
            countJSONRecieved = 0,
            i;
    
        function ChannelMaker(twitchData, channelName) {
            //Status codes: 1 - Online, 2 - Offline, 3 - Closed
            
            //Channel is closed or never existed
            if (twitchData.hasOwnProperty("status")) {
                if (twitchData.status === 422) {
                    this.channelName = channelName;
                    this.logoImgSrc = "images/closed.jpeg";
                    this.status = 3;
                    this["class"] = "closed";
                }
            //Channel is offline
            } else if (twitchData.stream === null) {
                this.channelName = channelName;
                this.logoImgSrc = "images/offline.png";
                this.channelLink = "https://www.twitch.tv/" + channelName;
                this.status = 2;
                this["class"] = "offline";
            //Channel is online
            } else {
                this.channelName = channelName;
                this.logoImgSrc = twitchData.stream.channel.logo;
                //Limit description of stream to 24 characters (styling decision)
                this.description = (twitchData.stream.channel.status).substring(0, 18) + " . . .";
                this.channelLink = "https://www.twitch.tv/" + channelName;
                this.status = 1;
                this["class"] = "online";
            }
        }
        
        function sortChannelsCollection(collectionToSort) {
            //Make function pure
            var newArr = collectionToSort.slice(0);
            newArr.sort(function sortChannels(a, b) {
                return a.status - b.status;
            });
            
            return newArr;
        }
        
        function getChannelData(url, channelName) {
            var jqxhr = $.getJSON(url, function (data) {
                var channelObject = new ChannelMaker(data, channelName);
                channelsCollection.push(channelObject);
                countJSONRecieved += 1;
                //When all channels' JSON data have been received, sort the data and update the HTML
                if (countJSONRecieved === channels.length) {
                    channelsCollection = sortChannelsCollection(channelsCollection);
                    callback(channelsCollection);
                }
            })
                .fail(function (data) {
                    data.status = 422;
                    var channelObject = new ChannelMaker(data, channelName);
                    channelsCollection.push(channelObject);
                    countJSONRecieved += 1;
                    //When all channels' JSON data have been received, sort the data and update the HTML
                    if (countJSONRecieved === channels.length) {
                        channelsCollection = sortChannelsCollection(channelsCollection);
                        callback(channelsCollection);
                    }
                });
        }
        
        for (i = 0; i < channels.length; i += 1) {
            getChannelData(apiURL + channels[i], channels[i]);
        }
    
    }
    
    function updateHTML(collection) {
        var templateHTML = $("#listTemplateID").html(),
            mustacheRenderResult,
            i;
        
        //Remove loader
        $(".listing").empty();
        
        for (i = 0; i < collection.length; i += 1) {
            mustacheRenderResult = Mustache.render(templateHTML, collection[i]);
            $(".listing").append(mustacheRenderResult);
        }
    }
    
    getTwitchJSON(updateHTML);
  
});