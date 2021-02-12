



var LoadingOverlayLogic = (function () {

    function LoadingOverlayLogic(anchorElementQuery) {
        console.log("loaded LoadingOverlayLogic")

        this.anchorElementQuery = (anchorElementQuery == null) ? ".loadingoverlay_progress_wrapper" : anchorElementQuery; //anchorElementQuery;

        this.customElement = $("<div>", {
            id: "genericLoadingScreen",
            css: {"font-size": "20px", fontawesome: "far fa-spinner fa-spin" },
        });

        this.progress = new LoadingOverlayProgress();
        this.progressHandle = this.progress.Init();
        //this.progressHandle.appendTo($(this.anchorElementQuery));
        
        this.progress.UpdateText("");
        this.genericOverlayActive = false; 
        this.loadingOverlayStartTimes = {};
        this.messages = [];
        this.percentage = 0;
        this.percentAutoIncrementInterval;
    }

    LoadingOverlayLogic.prototype = {

        constructor: LoadingOverlayLogic,

        startGenericLoadingScreenWithDelay: function (identifier,  delay, initialDescription) {
            if (typeof (delay) == "undefined" || delay == null) { //if undefined 
                delay = 0; // default delay value
            }
            var currentTime = new Date();
            var startTime = new Date().setMilliseconds(currentTime.getMilliseconds() + delay);

            uuid = typeof (UUID) !== "undefined" ? UUID.generate() : identifier;
            Loading_OL.loadingOverlayStartTimes[uuid] = { "startTime": startTime, "identifier": identifier };

            //console.log("INIT: ", Loading_OL.loadingOverlayStartTimes[uuid]);

            if (typeof initialDescription !== 'undefined') {
                Loading_OL.loadingOverlayStartTimes[uuid].initialDescription = initialDescription
            }

            setTimeout(function () {
                Loading_OL.startGenericLoadingScreen();
            }, delay);
            //console.log(this.loadingOverlayStartTimes);
            //console.log("loadingscreen queued: ", Loading_OL.loadingOverlayStartTimes)
            return uuid;
        },

        startGenericLoadingScreen: function () {
            if (!(Loading_OL.genericOverlayActive)) {
                var startTimes;
                var start = false;
                for (startTimes in Loading_OL.loadingOverlayStartTimes) {
                    if (Loading_OL.loadingOverlayStartTimes[startTimes].startTime <= Date.now()) {
                        start = true;
                    }
                }
                    if (start) {
                        if (Loading_OL.genericOverlayActive === false) {
                            Loading_OL.genericOverlayActive = true;
                            if (Loading_OL.anchorElementQuery != '.layout.right') {
                            $.LoadingOverlay("show", {
                                custom: Loading_OL.progressHandle,
                                image: "",
                                color: "rgba(255, 255, 255, 0.0)",
                                });
                            }

                            $('.loadingoverlay_progress_wrapper').parent().addClass('Loading_OLWrapperContainer');
                            $('.loadingoverlay_progress_wrapper').addClass('Loading_OLWrapperContainer');

                            $(Loading_OL.anchorElementQuery).LoadingOverlay("show", {
                                custom: Loading_OL.customElement
                            });


                            try {
                                var container = $('.loadingoverlay.Loading_OLWrapperContainer');
                                container.insertAfter(container.next());
                                Loading_OL.updateDescription(Loading_OL.loadingOverlayStartTimes[startTimes].initialDescription);
                            } catch (e) {
                                console.log("loadingOverlay error");
                            }
                            //$.LoadingOverlay("show", {
                            //    custom: Loading_OL.customElement
                            //})
                        }
                    }
                    //console.log("loadingscreen started. remaining in queue: ", Loading_OL.loadingOverlayStartTimes)
                
            }
        },

        stopGenericLoadingScreenByName(name) {
            var id = Object.keys(Loading_OL.loadingOverlayStartTimes).find(function (e) { return Loading_OL.loadingOverlayStartTimes[e].identifier === name });
            Loading_OL.stopGenericLoadingScreen(id);
        },
        stopGenericLoadingScreen: function (uuid) {
            //var stop = true;
            if (uuid) {
                //console.log("STOP: ", Loading_OL.loadingOverlayStartTimes[uuid]);
                delete Loading_OL.loadingOverlayStartTimes[uuid];
                //console.log(Loading_OL.loadingOverlayStartTimes);
                var startTimes;
                //for (startTimes in Loading_OL.loadingOverlayStartTimes) {
                //    if (startTimes.startTime <= Date.now())
                //        stop = false;
                //}

                // the below code replaces the above in order to have the overlay stay up once it's up
                if (Object.keys(Loading_OL.loadingOverlayStartTimes).length > 0)
                {
                    //stop = false;
                }
            }
            //if (stop) {
            setTimeout(function () {
                if (Object.keys(Loading_OL.loadingOverlayStartTimes).length == 0)
                {
                    Loading_OL.overlayForceClose();
                }
            }, 200
            )
                //console.log("loadingscreen stopped. remaining in queue: ", Loading_OL.loadingOverlayStartTimes)
            //}
        },

        resetPercentText: function () {
            this.customElement.text(" ");
        },

        resetDescription: function () {
            this.progress.UpdateText("");
        },

        overlayForceClose: function (check) {
            //return;
            clearInterval(this.percentAutoIncrementInterval);
            this.percentage = 0;
            this.messages = [];
            $('.loadingoverlay').addClass('hidden');
            $(Loading_OL.anchorElementQuery).LoadingOverlay("hide");
            $.LoadingOverlay("hide");

            Loading_OL.genericOverlayActive = false;
            this.loadingOverlayStartTimes = {};
            setTimeout(function () {
                Loading_OL.resetPercentText();
                Loading_OL.resetDescription();
            }, 500);
        },
        
        checkNullIdentifierOverlays: function () {
            var count = 0;
            var nullIdentifierForceClosed = false;
            if (Object.keys(Loading_OL.loadingOverlayStartTimes).length > 0) {
                for (var i in Loading_OL.loadingOverlayStartTimes) {
                    if (Loading_OL.loadingOverlayStartTimes[i].identifier == null) {
                        count++;
                    }
                }
            }
            if (count > 0 && Object.keys(Loading_OL.loadingOverlayStartTimes).length == count) {
                console.log("null identifier force closed");
                console.log(Loading_OL.loadingOverlayStartTimes);
                //console.trace();

                Loading_OL.overlayForceClose();
                nullIdentifierForceClosed = true;
            }

            return nullIdentifierForceClosed;
        },

        checkIfOnly2DViewerRemaining: function () {
            var count = 0;
            var alien2DForceClosed = false;
            if (Object.keys(Loading_OL.loadingOverlayStartTimes).length > 0 && typeof AnnotationApplication !== "undefined") {
                for (var i in Loading_OL.loadingOverlayStartTimes) {
                    if (Loading_OL.loadingOverlayStartTimes[i].identifier == AnnotationApplication.loadingOverlayName) {
                        count++;
                    }
                }
            }
            if (count > 0 && Object.keys(Loading_OL.loadingOverlayStartTimes).length == count) {
                console.log("2d alien force closed");
                console.log(Loading_OL.loadingOverlayStartTimes);
                //console.trace();

                Loading_OL.overlayForceClose();
                alien2DForceClosed = true;
            }            

            return alien2DForceClosed;
        },

        checkForZombieOverlays: function () {
            var zombieOverlayKilled = false;

            if (Object.keys(Loading_OL.loadingOverlayStartTimes).length <= 0 && $(".loadingoverlay").length > 0) {
                
                console.log("zombie overlay killed");
                console.log(Loading_OL.loadingOverlayStartTimes);
                console.log("Zombie Overlays: ", $(".loadingoverlay").length);
                console.log($(".loadingoverlay"));
                
                //console.trace();

                Loading_OL.overlayForceClose();
                zombieOverlayKilled = true;
            }

            return zombieOverlayKilled;
        },

        listen2DOverlays: function () {
            var that = this;
            setTimeout(function () {
                var alien2DForceClosed = that.checkIfOnly2DViewerRemaining();
                that.listenZombieOverlays();
            }, 10000);
        },

        listenZombieOverlays: function () {
            var that = this;
            setTimeout(function () {
                var alien2DForceClosed = that.checkIfOnly2DViewerRemaining();
                var zombieOverlayKilled = that.checkForZombieOverlays();
                that.listenZombieOverlays();
            }, 10000);
        },

        listenNullIdentifierOverlays: function () {
            var that = this;
            setTimeout(function () {
                var nullIdentifierForceClosed = that.checkNullIdentifierOverlays();
                that.listenNullIdentifierOverlays();
            }, 3000);
        },

        updatePercentText: function (percent) {
            if (percent > 99 || percent == "100") { percent = "99"; }
            if (percent !== "NaN") {
                this.customElement.text(percent + "%");
            }
        },


        updateDescription: function (description)
        {
            if (typeof description == "undefined") {
                this.progress.UpdateText(" ");
            } else {

                //make sure the string is not too long...
                var sentences = description.split(/\r?\n/);
                var result = [];

                for (var i = 0; i < sentences.length; i++) {
                    var addString = sentences[i];
                    var maxChars = 85;
                    if (sentences[i].length > maxChars) {
                        var frontChars = 40;
                        var backChars = 40;

                        if (!this.messages.includes())
                            addString = sentences[i].substr(0, frontChars) +
                                " ... " +
                                sentences[i].substr(sentences[i].length - backChars);
                    }
                    if (!this.messages.includes(addString)) {
                        this.messages.push(addString);
                    }
                }
                //this.progress.UpdateText(unescape(result.join("")));

                result = this.messages.filter(function (n) { return n != ""; });
                if (result.length > 4) {
                    result = result.slice(-3);
                    result.unshift("...");
                }
                $('.loadingoverlay_progress_text').html(result.join("<br>"))
            } 
        }

    }
    return LoadingOverlayLogic;



})();

function cmacsHubLogic(loading_OL, isGlobal) {

    if (loading_OL) {
        var loading_OL = loading_OL;
        isGlobal = true;
        this.socket = isGlobal ? $.connection.globalHub : $.connection.cmacsHub;
        this.socket.client.statusPercent = function (percent) {
            if (percent > loading_OL.percentage) {
                loading_OL.percentage = percent;
            }
            clearInterval(loading_OL.percentAutoIncrementInterval);
            loading_OL.percentAutoIncrementInterval = setInterval(function () { loading_OL.percentage++; loading_OL.updatePercentText(loading_OL.percentage);}, 4000)
            loading_OL.updatePercentText(loading_OL.percentage);
        }

        this.socket.client.statusDescription = function (description) {
            if (description != "")
            {
                //loading_OL.messages = loading_OL.messages + "<br>" + description;
                loading_OL.updateDescription(description);
            }
            //loading_OL.progress.UpdateText(loading_OL.messages);
            //$('.loadingoverlay_progress_text').html(loading_OL.messages)
        }

        this.socket.client.statusMessage = function (msg) {
            // if you'd like an additional logging function, define LoadingOverlayLogic.statusMessage(msg);
            try {
                loading_OL.statusMessage(msg);
            }
            catch (e)
            // otherwise we'll try to log it using kendo, or the console
            {
                if ($('dialog').length > 0) {
                    ErrorMessageCustom(msg, 'dialog', msg);
                } else {
                    console.log(msg)
                }
            }
        }

        //start the service
        $.connection.hub.start().done(function () { });
    }
}