"use strict";

const TimeGroups={
    "very_short": {
        min:30,
        max:45
    },
    "short": {
        min:40,
        max:60
    },
    "medium": {
        min:50,
        max:90
    },
    "long": {
        min:60,
        max:180
    },
    "very_long": {
        min:120,
        max:300
    },
};

const PASS_IT_APP = {
    init: function (){
        this.setState(history.state);
        this.addUiListeners();
        this.setVolume();
    
        show($("youAreIt"), false);
        show($("start"), true);
        show($("resume"), false);
        show($("stop"), false);
        show($("pause"), false);
    },

    setInstallPromptHandler: function(){
        window.onbeforeinstallprompt = function(event){
            // Prevent Chrome <= 67 from automatically showing the prompt
            event.preventDefault();
            // Stash the event so it can be triggered later.
            app.installPromptEvent = event;

            show($('install-app'), true);
        };
        return this;
    },

    setState: function(state){
        if (state){
            if (state["volume"]){
                $("volume").value = state["volume"];
            }
            if (state["timer"]){
                $("timer").value = state["timer"];
            }
        }
    },

    getState: function(){
        return {
            "volume":$("volume").value,
            "timer":$("timer").value,
        };
    },

    addUiListeners: function(){
        var self = this;
        $("volume").addEventListener("change", () => self.setVolume());
        $("timer").addEventListener("change", () => self.updateAll());
        $("install-app").addEventListener("click", () => self.installApp());
        $("start").addEventListener("click", () => self.startTimer());
        $("resume").addEventListener("click", () => self.resumeTimer());
        $("stop").addEventListener("click", () => self.stopTimer());
        $("pause").addEventListener("click", () => self.pauseTimer());
    },

    setVolume : function(){
        this.saveState();
        let mp = this.getMidiPlayer();
        mp.setVolume($("volume").value);
    },

    installApp: function(){
        show($('install-app'), false);
      
        // Show the modal add to home screen dialog
        this.installPromptEvent.prompt();
        // Wait for the user to respond to the prompt
        this.installPromptEvent.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.debug('User accepted the A2HS prompt');
            } else {
              console.debug('User dismissed the A2HS prompt');
            }
            // Clear the saved prompt since it can't be used again
            this.installPromptEvent = null;
        });
    },

    saveState: function() {
        history.replaceState( this.getState(), window.title, window.location);
    },

    startTimer: function() {
        var self = this
        
        if (exists(self.timer)) {
            self.timer.stop();
        }
        
        self.timer = Object.create(TIMER)
            .init(() => self.gameComplete(),self.getRandomTime())
            .start();
        
        show($("youAreIt"), false);
        show($("start"), false);
        show($("resume"), false);
        show($("stop"), true);
        show($("pause"), true);

        $("rootNode").classList.add("running");
        $("rootNode").classList.remove("paused");
        $("rootNode").classList.remove("complete");
    },

    resumeTimer: function(){
        var self = this
        
        if (exists(self.timer)) {
            self.timer.resume();
        }
        
        show($("youAreIt"), false);
        show($("start"), false);
        show($("resume"), false);
        show($("stop"), true);
        show($("pause"), true);

        $("rootNode").classList.add("running");
        $("rootNode").classList.remove("paused");
        $("rootNode").classList.remove("complete");

    },

    stopTimer:function(){
        if (exists(this.timer)) {
            this.timer.stop();
            this.timer=null;
        }
        show($("youAreIt"), false);
        show($("start"), true);
        show($("resume"), false);
        show($("stop"), false);
        show($("pause"), false);
        
        $("rootNode").classList.remove("running");
        $("rootNode").classList.remove("paused");
        $("rootNode").classList.remove("complete");
    },
    pauseTimer:function(){
        if (exists(this.timer)) {
            this.timer.pause();
        }
        show($("youAreIt"), false);
        show($("start"), false);
        show($("resume"), true);
        show($("stop"), true);
        show($("pause"), false);
        
        $("rootNode").classList.remove("running");
        $("rootNode").classList.add("paused");
        $("rootNode").classList.remove("complete");
    },

    updateAll:function() {
        this.saveState();
    
    },

    getMidiPlayer: function(){
        if (!exists(this.midiplayer)){
            this.midiplayer = Object.create(MIDI_PLAYER).init(2);
        }
        return this.midiplayer;
    },

    getRandomTime:function(){
        let tg = TimeGroups[$("timer").value];
        return randomNumber(tg.min,tg.max)*1000;
    },

    resetGame:function(){

        show($("youAreIt"), false);
        show($("start"), true);
        show($("stop"), false);
        show($("pause"), false);
        
        $("rootNode").classList.remove("running");
        $("rootNode").classList.remove("paused");
        $("rootNode").classList.remove("complete");
    },

    gameComplete:function(){
        this.stopTimer();
        var self = this

        self.timer = Object.create(TIMER)
            .init(() => self.resetGame(), 10000)
            .start();
        
        var mp = this.getMidiPlayer();
       
        show($("youAreIt"), true);
        show($("start"), true);
        show($("stop"), false);
        show($("pause"), false);
        
        $("rootNode").classList.remove("running");
        $("rootNode").classList.remove("paused");
        $("rootNode").classList.add("complete");
        
        mp.playNote(["A:4", "A:5", "A:4"]);
    }
};

/* HTML functions */
const app = Object.create(PASS_IT_APP).setInstallPromptHandler();

function init(){
    app.init();
}

