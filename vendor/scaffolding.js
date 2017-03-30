var App = App || {};

App.LoadAssetsState = (function () {
    "use strict";

    console.log("LoadAssetsState Compiling ...");
    // constructor: Run only once at compile time
    var fn = function (game) {
        console.log("LoadAssetsState.constructor Running...");
        Phaser.State.call(this, game);
    };
    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;
    fn.assetManager = null;

    // init: Run every time this state is started or restart:
    fn.prototype.init = function (startAssetsManager) {
        console.debug("LoadAssets.init");
        fn.assetManager = startAssetsManager;
        fn.assetManager.initState();
    };

    // preload: Run after init:
    fn.prototype.preload = function () {
        console.debug("LoadAssets.preload");
        fn.assetManager.preloadState();
    };

    // create: Run once all preload "load" calls have been loaded:
    fn.prototype.create = function () {
        console.debug("LoadAssets.create");
        fn.assetManager.createState();
    };

    return fn;
})();

// SYNTAX: this.game.assetManager = new App.AssetManager(this.game,{{'assetsConfig':ASSETS_JSON_FILE},'nextState':STATE_KEY});
App.AssetManager = (function () {
    "use strict";

    console.log("AssetManager Compiling ...");
    // constructor
    var fn = function (game, args) {
        console.log("AssetManager.constructor Running...");
        this.game = game;
        for (var namespace in App) {
            var s = namespace.match(/^(\w+)State$/);
            if (s) {
                var key = s[1];
                if (key && !this.game.state.states[key])
                    this.game.state.add(key,App[namespace]);
            }
        }
        args = args || {};
        if (args.assetsConfig) {
            var must = args.assetsConfig;
            if (typeof must === 'string') must = {'Config':must};
            this.mustLoad = {"assets":must};
        }
        else {
            this.mustLoad = {};
        }
        if (args.nextState) {
            this.nextState = args.nextState;
        }
        else if (this.state._pendingState) {
            // If no nextState is explicitly specified, then just use the next pending State
            this.nextState = this.state._pendingState;
            this.state._pendingState = null;
        }
        else {
            console.error("SYNTAX: this.game.assetManager = new App.AssetManager(this.game,{{'assetsConfig':ASSETS_JSON_FILE},'nextState':STATE_KEY})");
        }
        // Initialize one-time variables
        this.assets = {};
        // Launch the state loop passing myself, the Asset Manager object
        this.game.state.start('LoadAssets', undefined, undefined, this);
    };

    // init: Run every time this state is started or restart:
    fn.prototype.initState = function () {
        console.debug("AssetManager.initState: Running ...");
        // Initialize variables at the beginning of each LoadAssets round
        this.preLoad = {};
        this.postLoad = {};
    };

    // preload: Call "preload_TYPE" routine on each asset
    fn.prototype.preloadState = function () {
        console.log("AssetManager.preloadState: Running ...");

        for (var type in this.mustLoad) {
            var handler = this["preload_" + type];
            this.postLoad[type] = this.postLoad[type] || {};
            if (handler && "function" === typeof handler) {
                this.preLoad[type] = this.preLoad[type] || {};
                for (var key in this.mustLoad[type]) {
                    if (!this.postLoad[type][key] &&
                        !this.preLoad[type][key]) {
                        var data = this.mustLoad[type][key];
                        this.preLoad[type][key] = this["preload_" + type](key,data);
                    }
                    delete this.mustLoad[type][key];
                }
            }
            else {
                console.log('Asset handler "preload_' + type + '" not defined');
            }
            delete this.mustLoad[type];
        }
    };

    // create: Call "process_TYPE" routine on each asset once preload is complete
    fn.prototype.createState = function () {
        console.log("AssetManager.createState: Running ...");
        for (var type in this.preLoad) {
            this.postLoad[type] = this.postLoad[type] || {};
            var handler = this["process_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in this.preLoad[type]) {
                    if (!this.postLoad[type][key]) {
                        this.postLoad[type][key] = 1;
                        var preload_data = this.preLoad[type][key];
                        this["process_" + type](key,preload_data);
                    }
                    delete this.preLoad[type][key];
                }
            }
            else {
                console.log('WARNING: Asset handler "process_' + type + '" not defined');
            }
            delete this.preLoad[type];
        }

        if (_.keys(this.mustLoad).length) {
            // Found more assets to left to load?
            // Need to run through this process again:
            console.log("Restarting STATE because found more assets not loaded yet",this.mustLoad);
            this.game.state.restart(undefined, undefined, this);
        }
        else {
            // Everything is loaded?
            // Finally we can process to the next state:
            this.game.state.start(this.nextState);
        }
    };

    // Intended to run assetManager.spawn() within init() of the State world to Spawn the given assets.
    // spawn: Call "spawn_TYPE" routine on each asset:
    fn.prototype.spawn = function (config) {
        console.log("AssetManager.spawn: Running ...",config);
        for (var type in config) {
            var handler = fn.prototype["spawn_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in config[type]) {
                    if (this.assets[key]) {
                        var loaded_data = this.assets[key];
                        this["spawn_" + type](key,loaded_data);
                    }
                }
            }
            else {
                console.log('WARNING: Asset handler "spawn_' + type + '" not defined');
            }
        }
    };

    // ==== HELPER FUNCTIONS ====
    fn.prototype.dirname = function (filename) {
        return filename.match( /.*\// );
        //return filename.replace(/^(.*\/)[^\/]*/,'$1');
    };

    fn.prototype.basename = function (filename) {
        return filename.replace( /.*\//, "" );
    };

    // ==== ASSET TYPE DEFINITIONS ====
    // preload_TYPE(KEY,DATA):
    //   Define how to preload TYPE asset into KEY from DATA
    // process_TYPE(KEY,DATA):
    //   Now that asset has been loaded, populate any final data into this.assets.KEY
    //   If other assets are required to be loaded, then also populate
    //   this.mustLoad.<NEWTYPE>.<NEWKEY> with more dependency DATA assets
    // spawn_TYPE(KEY,DATA):
    //   Use this.assets.KEY to Spawn and generate all State dependent Objects,
    //   such as sprites or anything that relies on the current game.world.

    // ==== assets ====

    // preload_assets
    fn.prototype.preload_assets = function(key, data) {
        console.log("AssetManager.preload_assets",key,data);
        this.game.load.json(key, data);
        return data;
    };

    // process_assets
    fn.prototype.process_assets = function(key, data) {
        console.log("AssetManager.process_assets",key);
        var assetsRequire = this.game.cache.getJSON(key);
        console.log("Must Load More Assets:",assetsRequire);
        // Merge assetsRequire into assetsMustLoad
        for (var type in assetsRequire) {
            this.mustLoad[type] = this.mustLoad[type] || {};
            for (var k in assetsRequire[type]) {
                this.mustLoad[type][k] = assetsRequire[type][k];
            }
        }
        this.assets[key] = assetsRequire;
    };

    // spawn_assets
    fn.prototype.spawn_assets = function(key, data) {
        // nothing to do
    };

    // ==== spritesheet ====

    // preload_spritesheet
    fn.prototype.preload_spritesheet = function(key, data) {
        console.log("AssetManager.preload_spritesheet",key,data);
        this.game.load.spritesheet(key, data.file, data.frameWidth, data.frameHeight);
        return data;
    };

    // process_spritesheet
    fn.prototype.process_spritesheet = function(key, data) {
        console.log("AssetManager.process_spritesheet",key,data);
    };

    // spawn_spritesheet
    fn.prototype.spawn_spritesheet = function(key, data) {
        // nothing to do
    };

    // ==== atlas ====

    // preload_atlas
    fn.prototype.preload_atlas = function(key, data) {
        console.log("AssetManager.preload_atlas",key,data);
        if (data.json) {
            this.game.load.atlas(key, data.file, data.json, undefined, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        }
        else {
            this.game.load.atlas(key, data.file, undefined, data.data, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
        }
        return data;
    };

    // process_atlas
    fn.prototype.process_atlas = function(key, data) {
        console.log("AssetManager.process_atlas",key,data);
        // nothing to do yet
    };

    // spawn_atlas
    fn.prototype.spawn_atlas = function(key, data) {
        // nothing to do
    };

    // ==== sound ====

    // preload_sound
    fn.prototype.preload_sound = function(key, data) {
        console.log("AssetManager.preload_sound",key,data.file);
        this.game.load.audio(key, data.file);
        return data;
    };

    // process_sound
    fn.prototype.process_sound = function(key, data) {
        // nothing to do yet
    };

    // spawn_sound
    fn.prototype.spawn_sound = function(key, data) {
        // nothing to do
    };

    // ==== image ====

    // preload_image
    fn.prototype.preload_image = function (key, data) {
        console.log("AssetManager.preload_image",key,data.file);
        this.game.load.image(key, data.file);
    };

    // process_image
    fn.prototype.process_image = function (key, data) {
        // nothing to do yet
    };

    // spawn_image
    fn.prototype.spawn_image = function(key, data) {
        // nothing to do
    };

    // ==== json ====

    // preload_json
    fn.prototype.preload_json = function (key, data) {
        console.log("AssetManager.preload_json",key,data.file);
        this.game.load.json(key, data);
    };

    // process_json
    fn.prototype.process_json = function (key, data) {
        this.assets[key] = this.game.cache.getJSON(key);
    };

    // spawn_json
    fn.prototype.spawn_json = function(key, data) {
        // nothing to do
    };

    // ==== tilemap ====

    // preload_tilemap
    fn.prototype.preload_tilemap = function (key, data) {
        console.log("AssetManager.preload_tilemap",key,data.json);
        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
        return data;
    };

    // process_tilemap
    fn.prototype.process_tilemap = function (key, data) {
        console.log("AssetManager.process_tilemap",key,data);
        var tilemap_data = this.game.cache.getTilemapData(key).data;
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            var s = tilesets[tileset];
            // Tiled App doesn't include "rows" for some reason?
            // So we can just calculate it from the "tilecount":
            var rows = s.tilecount/s.columns;
            // Hack imagewidth and imageheight to match dimensions how the Tiled treats it:
            s.imagewidth  = s.margin * 2 - s.spacing + (s.tilewidth  + s.spacing) * s.columns;
            s.imageheight = s.margin * 2 - s.spacing + (s.tileheight + s.spacing) * rows;
        }
        data.parsed = Phaser.TilemapParser.parseTiledJSON(tilemap_data);
        data.animations = {};
        if (data.parsed.objects) {
            for (var objectGroupName in data.parsed.objects) {
                var objects = data.parsed.objects[objectGroupName];
                for (var i in objects) {
                    var object = objects[i];
                    object.properties = object.properties || {};
                    var gid = object.gid;
                    var p = data.parsed.tiles[gid];
                    if (p) {
                        var map = tilesets[p[2]];
                        var tileid = gid - map.firstgid;
                        if (!(tileid in map.tiles) || !map.tiles[tileid].animation) {
                            console.log("Object " + object.name + " pinned to gid " + gid + " without any animation");
                            // Spoof gid to pretend like it has an animation of one frame (itself)
                            map.tiles[tileid] = map.tiles[tileid] || {};
                            map.tiles[tileid].animation = [{
                                duration : 1000,
                                tileid : tileid
                            }];
                        }
                    }
                    else {
                        console.warn("Unable to locate tiles object? gid " + gid);
                    }
                }
            }
        }
        for (var tileset in tilesets) {
            var name = tilesets[tileset].name;
            var fullpath = fn.prototype.dirname(data.json) + tilesets[tileset].image;
            var load_atlas = {};
            var tiles = tilesets[tileset].tiles;
            if (tiles) {
                var f = tilesets[tileset].firstgid;
                for (var tile_id in tiles) {
                    var anim = tiles[tile_id].animation;
                    if (anim) {
                        var tileset_tileid = Math.floor(tile_id);
                        var tileset_gid = f + tileset_tileid;
                        var animation_name = 'unnamed_animation_for_gid_' + tileset_gid;
                        if (tilesets[tileset].tileproperties &&
                            tilesets[tileset].tileproperties[tileset_tileid] &&
                            tilesets[tileset].tileproperties[tileset_tileid].animation_name) {
                            animation_name = tilesets[tileset].tileproperties[tileset_tileid].animation_name;
                        }
                        data.animations[tileset_gid] = data.animations[tileset_gid] || [];
                        console.debug("TILESET WITH ANIMATIONS [" + name + "] TileID " + tileset_tileid + " + " + f + " => " + tileset_gid);
                        for (var frame in anim) {
                            var frame_tileid = anim[frame].tileid;
                            var frame_gid = f + frame_tileid;
                            console.debug("FRAME[" + frame + "] : TileID " + frame_tileid + " => " + frame_gid + " FOR " + anim[frame].duration + " ms");
                            var tinfo = data.parsed.tiles[frame_gid];
                            data.animations[tileset_gid].push({
                                gid : frame_gid,
                                duration : anim[frame].duration,
                                x : tinfo[0],
                                y : tinfo[1],
                                w : tilesets[tinfo[2]].tilewidth,
                                h : tilesets[tinfo[2]].tileheight,
                                image_key : tilesets[tinfo[2]].name,
                                animation_name : animation_name,
                            });
                            if (tinfo[2] == tileset) load_atlas[tileset_gid]++;
                        }
                    }
                }
            }
            var frames = {};
            if (_.keys(load_atlas).length) {
                // Found animations for this image
                // Populate the corresponding frames
                for (var atlas_gid in load_atlas) {
                    var anims = data.animations[atlas_gid];
                    for (var i in anims) {
                        frames["gid_"+atlas_gid+"_frame_"+i] = { frame: anims[i] };
                    }
                }
            }
            // Normal load "image" is a subset of load "atlas"
            // So always use "atlas" just to be safe and clean
            this.mustLoad.atlas = this.mustLoad.atlas || {};
            this.mustLoad.atlas[name] = {
                file: fullpath,
                data: { frames: frames },
            };
        }
        this.assets[key] = data;
    };

    // spawn_tilemap
    fn.prototype.spawn_tilemap = function(key, data) {
        console.log("AssetManager.spawn_tilemap",key,data);
        var tilemap = {};

        tilemap.map = this.game.add.tilemap(key);

        var tilemap_data = this.game.cache.getTilemapData(key).data;
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            tilemap.map.addTilesetImage(tilesets[tileset].name, tilesets[tileset].name);
        }

        tilemap.layers = {};

        for (var layer in tilemap_data.layers) {
            if (tilemap_data.layers[layer].type == "tilelayer") {
                var tiled_layer_name = tilemap_data.layers[layer].name;

                tilemap.layers[tiled_layer_name] = tilemap.map.createLayer(tiled_layer_name);

                if (tilemap_data.layers[layer].properties && tilemap_data.layers[layer].properties.isCollisionLayer) {
                    var collision_id_last  = 1;
                    for (var id in tilemap_data.layers[layer].data) {
                        if (tilemap_data.layers[layer].data[id] > collision_id_last) {
                            collision_id_last = tilemap_data.layers[layer].data[id];
                        }
                    }
                    tilemap.map.setCollisionBetween(1, collision_id_last + 1, true, tiled_layer_name);
                }
            }
            else if (tilemap_data.layers[layer].type == "objectgroup") {
                var objects = tilemap_data.layers[layer].objects;
                for (var i in objects) {
                    var object_gid = objects[i].gid;
                    var type = objects[i].type;
                    var args = {
                        image_key    : objects[i].name,
                        tiled_object : objects[i],
                        anim         : {},
                    };
                    if (object_gid && type) {
                        var tinfo = data.parsed.tiles[object_gid];
                        var animation_gids = {};
                        if (tinfo) {
                            var tileset = tinfo[2];
                            args.image_key = tilesets[tileset].name;
                            var p = tilesets[tileset].tileproperties;
                            for (var tileid in p) {
                                if (p[tileid].animation_name) {
                                    var anim_gid = tilesets[tileset].firstgid + Math.floor(tileid);
                                    animation_gids[anim_gid] = p[tileid].animation_name;
                                }
                            }
                        }
                        if (!_.keys(animation_gids).length) {
                            // No explicitly named animations?
                            var anims = data.animations[object_gid];
                            if (anims && anims.length) {
                                // Just use the main object_gid animation
                                animation_gids[object_gid] = anims[0].animation_name;
                            }
                        }
                        for (var anim_gid in animation_gids) {
                            var animation_name = animation_gids[anim_gid];
                            var anims = data.animations[object_gid];
                            var duration = anims[0].duration;
                            var frames = [];
                            for (var f in anims) {
                                frames.push("gid_" + anim_gid + "_frame_" + f);
                            }
                            args.anim[anim_gid] = {
                                animation_name : animation_name,
                                duration       : duration,
                                frames         : frames,
                            };
                        }
                        args.init = function (sprite, a) {
                            sprite.width  = a.tiled_object.width;
                            sprite.height = a.tiled_object.height;
                            if (a.anim) {
                                // Initialize animations provided
                                for (var anim_gid in a.anim) {
                                    var g = a.anim[anim_gid];
                                    // Convert duration to FramesPerSecond
                                    var framesPerSecond = 1;
                                    if (g.duration && g.duration > 0)
                                        framesPerSecond = 1000 / g.duration;
                                    console.debug("INIT (" + a.tiled_object.gid + ":" + anim_gid + ") ANIM (" + framesPerSecond + " fps):",g);
                                    sprite.animations.add(g.animation_name, g.frames, framesPerSecond, true);
                                }
                                if (a.anim[a.tiled_object.gid]) {
                                    // Automatically fire up if main gid animation
                                    console.debug("FIRE UP ANIM!",a.tiled_object.gid,a.anim[a.tiled_object.gid].animation_name);
                                    sprite.animations.play(a.anim[a.tiled_object.gid].animation_name);
                                }
                            }
                        };
                        tilemap.map.createFromObjects(
                            tilemap_data.layers[layer].name,
                            objects[i].name,
                            args,      // Sprite image key name
                            undefined, // Sprite frame name
                            true,
                            false,
                            this.game.world,
                            eval(type),
                            true
                        );
                    }
                }
            }
        }

        this.assets.tilemap = this.assets.tilemap || {};
        this.assets.tilemap[key] = tilemap;
    };

    return fn;
})();
