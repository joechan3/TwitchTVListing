//jslint browser:true, this: true
//global $, Mustache

$(document).ready(function () {
    "use strict";

    function getTwitchJSON(callback) {
        var channels = ["StreamerHouse", "Monstercat", "esl_csgo", "summit1g", "BobRoss", "TwinGalaxies",
            "Food", "MedryBW", "FreeCodeCamp", "comster404"
        ];
        var channelsCollection = [];
        var apiURL = "https://api.twitch.tv/kraken/streams/";
        var countJSONRecieved = 0;

        function ChannelMaker(twitchData, channelName) {
            //Status codes: 1 - Online, 2 - Offline, 3 - Closed

            //Channel is closed or never existed
            if (twitchData.hasOwnProperty("status")) {
                if (twitchData.status === 422) {
                    this.channelName = channelName;
                    this.logoImgSrc = "images/closed.jpeg";
                    this.status = 3;
                    this.classType = "closed";
                }
                //Channel is offline
            } else if (twitchData.stream === null) {
                this.channelName = channelName;
                this.logoImgSrc = "images/offline.png";
                this.channelLink = "https://www.twitch.tv/" + channelName;
                this.status = 2;
                this.classType = "offline";
                //Channel is online
            } else {
                this.channelName = channelName;
                this.logoImgSrc = twitchData.stream.channel.logo;
                //Limit description of stream to 24 characters (styling decision)
                this.description = (twitchData.stream.channel.status).substring(0, 18) + " . . .";
                this.channelLink = "https://www.twitch.tv/" + channelName;
                this.status = 1;
                this.classType = "online";
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
            $.getJSON(url, function (data) {
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

        channels.forEach(function getData(channel){
            getChannelData(apiURL + channel, channel);
        });

    }

    function updateHTML(collection) {
        var templateHTML = $("#listTemplateID").html();
        var mustacheRenderResult;

        //Remove loader
        $(".listing").empty();

        collection.forEach(function render(item){
            mustacheRenderResult = Mustache.render(templateHTML, item);
            $(".listing").append(mustacheRenderResult);
        });

    }

    getTwitchJSON(updateHTML);

});