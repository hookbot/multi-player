var App = App || {};
App.LoadAssetsState = App.LoadAssetsState || {};

App.LoadAssetsState = (function () {
    "use strict";

    // constructor: Run only once at compile time
    var fn = function (game) {
        Phaser.State.call(this, game);
    };
    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    // init: Run every time this state is started or restart:
    fn.prototype.init = function () {
        this.game.assets = this.game.assets || {};
        this.game.assetsMustLoad = this.game.assetsMustLoad || {};
        this.game.assetsPreLoad = this.game.assetsPreLoad || {};
        this.game.assetsLoaded = this.game.assetsLoaded || {};
        this.game.assetsNextState = this.game.assetsNextState || "DefaultNextState";
    };

    // preload: Call "preload_TYPE" routine on each asset
    fn.prototype.preload = function () {
        for (var type in this.game.assetsMustLoad) {
            this.game.assetsPreLoad[type] = this.game.assetsPreLoad[type] || {};
            this.game.assetsLoaded[type] = this.game.assetsLoaded[type] || {};
            var handler = this["preload_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in this.game.assetsMustLoad[type]) {
                    if (!this.game.assetsLoaded[type][key] &&
                        !this.game.assetsPreLoad[type][key]) {
                        var data = this.game.assetsMustLoad[type][key];
                        //this.game.assetsPreLoad[type][key] = handler(key,data);
                        this.game.assetsPreLoad[type][key] = this["preload_" + type](key,data);
                    }
                    delete this.game.assetsMustLoad[type][key];
                }
            }
            else {
                console.log('Asset handler "preload_' + type + '" not defined');
            }
            delete this.game.assetsMustLoad[type];
        }
    };

    // create: Call "process_TYPE" routine on each asset once preload is complete
    fn.prototype.create = function () {
        for (var type in this.game.assetsPreLoad) {
            this.game.assetsLoaded[type] = this.game.assetsLoaded[type] || {};
            var handler = this["process_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in this.game.assetsPreLoad[type]) {
                    this.game.assetsLoaded[type][key] = 1;
                    var preload_data = this.game.assetsPreLoad[type][key];
                    delete this.game.assetsPreLoad[type][key];
                    this["process_" + type](key,preload_data);
                    //handler(key,preload_data);
                }
            }
            else {
                console.log('Asset handler "process_' + type + '" not defined');
            }
        }

        if (_.keys(this.game.assetsMustLoad).length) {
            // Found more assets to left to load?
            // Need to run through this process again:
            console.log("Restarting STATE because found more assets not loaded yet",this.game.assetsMustLoad);
            this.game.state.restart();
        }
        else {
            // Everything is loaded?
            // Finally we can process to the next state:
            this.game.state.start(this.game.assetsNextState);
        }
    };

    // preload_TYPE(KEY,DATA):
    //   Define how to preload TYPE asset into KEY from DATA
    // process_TYPE:
    //   Now that asset has been loaded, populate final Object into game.assets.KEY, if appropriate
    //   If other assets are required to be loaded, then also populate
    //   this.game.assetsMustLoad.<NEWTYPE>.<NEWKEY> with more dependency DATA assets

    // preload_assets
    fn.prototype.preload_assets = function(key, data) {
        console.log("loadAssets.preload_assets",key,data)
        game.load.json(key, data);
        return data;
    };

    // process_assets
    fn.prototype.process_assets = function(key, data) {
        var assetsRequire = this.game.cache.getJSON(key);
        console.log("Must Load More Assets:",assetsRequire);
        // Merge assetsRequire into assetsMustLoad
        for (var type in assetsRequire) {
            this.game.assetsMustLoad[type] = this.game.assetsMustLoad[type] || {};
            for (var k in assetsRequire[type]) {
                this.game.assetsMustLoad[type][k] = assetsRequire[type][k];
            }
        }
        this.game.assets[key] = assetsRequire;
    };

    // preload_spritesheet
    fn.prototype.preload_spritesheet = function(key, data) {
        console.log("loadAssets.preload_spritesheet",key,data)
        this.game.load.spritesheet(key, data.file, data.frameWidth, data.frameHeight);
        return data;
    };

    // process_spritesheet
    fn.prototype.process_spritesheet = function(key, data) {
        console.log("loadAssets.process_spritesheet",key,data)
        //this.game.assets[key] = Object.create(Phaser.Sprite.prototype);
    };

    return fn;
})();
