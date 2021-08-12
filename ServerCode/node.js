var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: 10731});

var messages=[];
var _isAlive = false;
var _isBroadcasting = false;

var _interval = null;
var _heartbeatInterval = null;
var _playerList = [];
var _playerID = 0;
var _gameTime = 0;
var _gameIntervalTime = 40;
var _gameState = null;

var _rooms = {
    0: {
        model: null,
        clientList: []
    },
    1: {
        model: null,
        clientList: []
    },
    2: {
        model: null,
        clientList: []
    }
};

// Validating Connection
function noop() {}

function heartbeat(ws) {
  ws.isAlive = true;
  if (ws.joinID != -1){
    for (let wc of _rooms[ws.joinID].clientList){
        console.log("heartbeat: " + wc.playerID + " " + wc.isAlive);
    }
  }
}

wss.broadcast = function(message){
    for(let ws of this.clients){
        if (ws.bufferedAmount == 0){
            ws.send(message);
        }
    }
}

wss.broadcastRoom = function(room){
    var msg = {
        type: "state",
        state: new GameModelSimple(room.model)
    };
    for (let ws of room.clientList){
        if (ws.bufferedAmount == 0){
            ws.send(JSON.stringify(msg));
        }
    }
}

// When a client 'ws' joins the server
wss.on('connection', function(ws) {
    
    ws.isAlive = true;
    ws.playerID = null;
    ws.joinID = -1;
    ws.on('pong', function() {
        heartbeat(ws);
        console.log("was ponged directly");
    });
    
    var playerID;
    var joinID;
	ws.on('message', function(message) {
        
        var msg=JSON.parse(message);
        switch(msg.type){
            
            // pinging back heartbeat
            case "pong":
                heartbeat(ws);
                break;
            
            // player wants to join the game
            case "join":
            
                // Can't have duplicate clients online
                if (isClientOnline(ws) || isPlayerOnline(msg.playerID)){
                    var newMsg = {
                        type: "fail",
                        onlineID: msg.playerID,
                        message: "The player " + msg.playerID + " is already online!"
                    };
                    ws.send(JSON.stringify(newMsg));
                }
                else if (_rooms[msg.joinID] == null){
                    var newMsg = {
                        type: "fail",
                        message: "That game lobby doesn't exist!"
                    };
                    ws.send(JSON.stringify(newMsg));
                }
                else{
                    ws.playerID = msg.playerID;
                    ws.joinID = msg.joinID;
                    // _playerList.push(msg.playerID);
                    _rooms[msg.joinID].clientList.push(ws);
                    console.log(_rooms[msg.joinID].clientList.length);
                    // add them to spawn queue
                    playerID = msg.playerID;
                    joinID = msg.joinID;
                    _rooms[joinID].model.addToSpawnQueue(playerID, msg.color);
                    var newMsg = {
                        type: "join",
                        playerID: playerID
                    };
                    ws.send(JSON.stringify(newMsg));
                    console.log("Added a new player");
                }
                break;
                
            case "control-move":
                _rooms[joinID].model.applyPlayerMove(playerID, msg.x, msg.y);
                break;
                
            case "control-rotate":
                _rooms[joinID].model.applyPlayerRotate(playerID, msg.x, msg.y);
                break;
                
            case "control-shoot":
                _rooms[joinID].model.applyPlayerShoot(playerID, msg.x, msg.y);
                break;
                
            case "control-release":
                _rooms[joinID].model.applyPlayerRelease(playerID);
                break;
                
            case "control-swapToBuild":
                _rooms[joinID].model.applyPlayerSwapToBuild(playerID);
                break;
                
            case "control-swapWeapon":
                _rooms[joinID].model.applyPlayerSwapWeapon(playerID, msg.weaponID);
                break;
                
            // deleting a player from the game
            case "delete":
                removeClientFromAllRooms(ws);
                //_gameState.removePlayer(playerID);
                break;
        }
	});
});

_heartbeatInterval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false){
        // terminate connection, and player
        return terminateClient(ws);
    }
    ws.isAlive = false;
    var pingMsg = {
        type: "ping"
    };
    ws.send(JSON.stringify(pingMsg));
    ws.ping(noop);
  });
}, 30000);

function terminateClient(ws){
    // remove from all rooms
    removeClientFromAllRooms(ws);
    ws.terminate();
}
function removeClientFromAllRooms(ws){
    for (var i = 0; i < 3; i++){
        removeClientFromRoom(ws, _rooms[i]);
    }
}
function removeClientFromRoom(ws, room){
    // Remove in-game player
    room.model.removePlayer(ws.playerID);
    
    // Remove client from room
    var index = room.clientList.indexOf(ws);
    if (index != -1){
        room.clientList.splice(index, 1);
    }
}

function isClientOnline(ws){
    for (var i = 0; i < 3; i++){
        if (_rooms[i].clientList.includes(ws)){
            return true;
        }
    }
    return false;
}
function isPlayerOnline(playerID){
    for (var i = 0; i < 3; i++){
        var clientList = _rooms[i].clientList;
        for (var j = 0; j < clientList.length; j++){
            if (clientList[j].playerID == playerID){
                return true;
            }
        }
    }
    return false;
}

wss.on('close', function() {
    clearInterval(_heartbeatInterval);
    console.log('disconnected');
});

///////////////////////////////////////////////////////////////////////////////
// ALL BELOW IS ASSIGNMENT 2 CODE
///////////////////////////////////////////////////////////////////////////////

// MODEL

// HELPER FUNCTIONS
function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }
function randomRange(n1, n2) { 
	var diff = n2 - n1;
	return Math.random() * diff + n1;
}
function shuffle(array) {
 	var currentIndex = array.length, temporaryValue, randomIndex;

 	// While there remain elements to shuffle...
 	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
    		array[randomIndex] = temporaryValue;
	}
  	return array;
}
function getRandomArrayElement(array){
	if (array.length > 0){
		return array[randint(array.length - 1)];
	}
	return null;
}
function getHexColor(colorStr) {
    var a = document.createElement('div');
    a.style.color = colorStr;
    var colors = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
    document.body.removeChild(a);
    return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
}
function convertGameTimeToSeconds(gameTime){
	return gameTime * _gameIntervalTime / 1000;
}
function convertSecondsToGameTime(seconds){
	return seconds * 1000 / _gameIntervalTime;
}

const _baseSpeed = 2;
const _baseHArcY = -4;
const _baseHArcR = 20;
const _baseGunY = -30;
var _actorID = 1;

class GameModel {
	constructor(ID){
        this.ID = ID;
		//this.canvas = canvas;

		// Game logic
        this.gameScore = 0;

		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.terrainActors = []; // all terrain actors
		this.player=null; // a special actor, the player
        this.players = []; // all player actors on the stage
        this.killedPlayers = [];
        this.spawnQueue = [];
        this.playerSpawnLocations = [];
        this.itemSpawnLocations = [];
        this.itemSpawnCountdown = 240;
        this.maxItems = 12;

		// the default stage properties
		this.width=4800;
		this.height=4800;
		//this.canvasWidth = canvas.width;
		//this.canvasHeight = canvas.height;
		this.positionOffset = new Pair(0, 0);
		this.stageActor = null;
		this.playerSpawnLocations = [
            new Pair(Math.floor(this.width/2) - 100, Math.floor(this.height/2) - 100)
        
        ];

		// set stage / wave specifics based on stage name
		this.setStage("Basic");
	}

	// Player
	createPlayer(playerID, color){
		var style = new ContextStyle();
        style.colorString = color;
        //ColourCStyle(255,255,255,1);
		style.setOutline("black");
        var playerShape = new Circle(16, style);
		var player = new Player(this, new Pair(0,0), playerID, [playerShape], _baseSpeed + 1);
        
        // Create default player weapon
        var w = this.createWeapon_Gun(player.shapes[0].contextStyle.clone());
		player.addWeapon(w);
        
        // Create default player block
        player.addBlock(new BuildingBlock_HP(this, 32, 32, 50));
        
		return player;
	}
    
	spawnPlayer(playerID){
        var actor = this.createPlayer(playerID);
		var spawn = getRandomArrayElement(this.playerSpawnLocations);
		actor.setPosition(spawn.x, spawn.y);
		this.addPlayer(actor, playerID);
        return actor;
	}
    
    addToSpawnQueue(playerID, color){
        // remove them from killedPlayers list
        var index=this.killedPlayers.indexOf(playerID);
        if (index != -1){
            this.killedPlayers.splice(index,1);
        }
        
        var actor = this.createPlayer(playerID, color);
        actor.team = playerID;
        actor.enabled = false;
        this.spawnQueue.push(actor);
    }
    
    spawnPlayersInQueue(){
    // Attempt to spawn players in the queue if possible
		var spawnQueue = this.spawnQueue.slice();
		if (spawnQueue.length > 0){
			for (var i = 0; i < spawnQueue.length; i++){
                var player = spawnQueue[i];
                var spawnSuccess = this.spawnPlayerAtRandom(player);
                // if spawn is successful, remove it from the spawn queue
                if (spawnSuccess){
                    this.spawnQueue.splice(i, 1);
                    break;
                }
            }
		}
    }
    
    // Tries to spawn the given player at a random spawn point, and returns true if it was possible
	spawnPlayerAtRandom(player){
		var spawn = null;
		// Shuffle the spawn points
		var shuffledSpawns = shuffle(this.playerSpawnLocations.slice());
		for (var i = 0; i < shuffledSpawns.length; i++){
			var canUseSpawn = true;
			spawn = shuffledSpawns[i];
			var collidingActors = this.getCollidingActors(spawn, player);
			for(var j=0;j<collidingActors.length;j++){
				if (!collidingActors[j].canPassThrough(player)){
					canUseSpawn = false;
					break;
				}
			}
			if (canUseSpawn){
				break;
			}
			else{
				spawn = null;
			}
		}

		// Spawn player
		if (spawn){
			console.log("Player spawned at " + spawn);
			this.spawnPlayerAt(player, spawn);
			return true;
		}
		return false;
	}
    
    spawnPlayerAt(player, spawn){
        player.setPosition(spawn.x, spawn.y);
        player.enabled = true;
		this.addPlayer(player);
    }
    
	// Player-related functions
    getPlayer(playerID){
        for(var i=0;i<this.players.length;i++){
			if(this.players[i].playerID == playerID){
				return this.players[i];
			}
		}
        return null;
    }
    getAllPlayers(){
        return this.players;
    }
	addPlayer(player){
		this.addActor(player);
        this.players.push(player);
	}
	removePlayer(playerID){
        var playerActor = this.getPlayer(playerID);
        if (playerActor != null){
            // remove them from the player list
            this.killedPlayers.push(playerID);
            
            // Drop items when KO'd:
            
            
            var index=this.players.indexOf(playerActor);
            if (index !=-1 ){
                this.players.splice(index,1);
            }
            this.removeActor(playerActor);
        }
	}

    applyPlayerControls(playerID, controlInput){
        var dx = controlInput["horizontal"];
        var dy = controlInput["vertical"];
        
        var player = this.getPlayer(playerID);
        if (player){
            // rotating
            var aimLocation = controlInput["aimLocation"];
            if (aimLocation){
                player.aimAt(new Pair(aimLocation.x, aimLocation.y));
            }
            
            var newDx = controlInput["horizontal"];
            var newDy = controlInput["vertical"];
            
            // moving player body
            player.move(newDx, newDy);
            // slow down player
            if (newDx == 0){
                player.stopMovingX();
            }
            if (newDy == 0){
                player.stopMovingY();
            }

            if (controlInput["shoot"]){
                // building something
                if (player.isBuilding){
                    if (player.canBuild()){
                        player.buildBlock();
                    }
                }
                else{
                    // firing player weapon
                    if (aimLocation && player.canShootWeapon()){
                        player.shootWeapon(new Pair(aimLocation.x, aimLocation.y));
                    }
                }
            }

            // release fire
            if (controlInput["release"]){
                player.releaseTrigger();
            }

            // interact
            if (controlInput["interact"]){
                player.queueInteract();
            }

            if (controlInput["building"]){
                if (player.isBuilding){
                    player.stopBuilding();
                }
                else {
                    player.startBuilding();
                }
            }

            // swap weapon / build
            var swapID = controlInput["swapID"];
            var willSwap = controlInput["willSwap"];
            if (willSwap){
                if (player.isBuilding){
                    player.queueBlockSwap(swapID);
                }
                else{
                    player.queueWeaponSwap(swapID);
                }
            }
        }
    }

    applyPlayerMove(playerID, x, y){
        var player = this.getPlayer(playerID);
        if (player){
            player.move(x, y);
            // slow down player
            if (x == 0){
                player.stopMovingX();
            }
            if (y == 0){
                player.stopMovingY();
            }
        }
    }
    applyPlayerRotate(playerID, x, y){
        var player = this.getPlayer(playerID);
        if (player){
            player.aimAt(new Pair(x, y));
        }
    }
    applyPlayerShoot(playerID, x, y){
        var player = this.getPlayer(playerID);
        if (player){
            player.aimAt(new Pair(x, y));
            // building
            if (player.isBuilding){
                if (player.canBuild()){
                    player.buildBlock();
                }
            }
            else{
                // firing player weapon
                if (player.canShootWeapon()){
                    player.shootWeapon(new Pair(x, y));
                }
            }
        }
    }
    applyPlayerRelease(playerID){
        var player = this.getPlayer(playerID);
        if (player){
            player.releaseTrigger();
        }
    }
    applyPlayerSwapToBuild(playerID){
        var player = this.getPlayer(playerID);
        if (player){
            if (player.isBuilding){
                player.stopBuilding();
            }
            else {
                player.startBuilding();
            }
        }
    }
    applyPlayerSwapWeapon(playerID, weaponID){
        var player = this.getPlayer(playerID);
        if (player){
            if (player.isBuilding){
                player.queueBlockSwap(weaponID);
            }
            else{
                player.queueWeaponSwap(weaponID);
            }
        }
    }

    // General actor-related functions
	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// WEAPONS
	createBulletShape(width, height, style){
		var shape = new BulletShape(width, height, style);
		return shape;
	}
    createHandleShape(addSize, style){
		var arc = new Arc(_baseHArcR + addSize, 5 * Math.PI / 4, 7 * Math.PI / 4, style);
        return arc;
    }

	createWeapon(
		weaponID,
		shape,
		position,
		name,
		damage,
		bulletSpread,
		ammo,
		ammoMag,
		ammoPerShot,
		cooldown,
		maxRange,
		bulletSpeed){
		var w = new Weapon(weaponID, this, position, name, shape);
		w.damage = damage;
		//w.damage += this.wave / 7;

		w.bulletSpread = bulletSpread;
		w.ammo = ammo;
		w.ammoMag = ammoMag;
		w.ammoPerShot = ammoPerShot;
		
		w.cooldown = cooldown; 
		//w.cooldown -= this.wave / 15; 
		//w.cooldown = Math.max(0.05, w.cooldown);
		
		w.maxRange = maxRange;
		
		w.bulletSpeed = bulletSpeed;
		//w.bulletSpeed += bulletSpeed * (this.wave / 15);
		//w.bulletSpeed = Math.min(20, w.bulletSpeed);

		return w;
	}

	createWeapon_Gun(style){
		var arc = this.createHandleShape(0, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY));
		var gun = new Rectangle(8, 16, new ColourCStyle(0,0,0,1));

		var weapon = this.createWeapon(
			"Pistol",
			[gun, arc],
			new Pair(0, _baseGunY),
			"Pistol",
			10, 5, 75, 15, 1, 0.75, 5, 8
		);
		var bulletShape = this.createBulletShape(4, 6, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(0, 0), 1, 1, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
    createWeapon_DualPistol(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(8, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 8));
        var ang = 15;
		var gun1 = new Rectangle(8, 16, new ColourCStyle(0,0,0,1));
        gun1.setOffsetPosition(new Pair(10, 6));
        var gun2 = new Rectangle(8, 16, new ColourCStyle(0,0,0,1));
        gun2.setOffsetPosition(new Pair(-10, 6));
        
        gun1.setOffsetAngle(-ang);
        gun2.setOffsetAngle(ang);

		var weapon = this.createWeapon(
			"D. Pistol",
			[gun1, gun2, arc],
			new Pair(0, _baseGunY - 4),
			"D. Pistol",
			10, 10, 90, 30, 2, 0.75, 5, 8
		);
		var bulletShape = this.createBulletShape(4, 6, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(6, -3), 1, 1, -ang, new NullShape(), [bulletShape]
		));
        weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(-6, -3), 1, 1, ang, new NullShape(), [bulletShape]
		));
		return weapon;
	}

	createWeapon_Shotgun(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(12, new StrokeCStyle(0,0,0,1,4));
        arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 12));
        var gun = new Rectangle(12, 20, new ColourCStyle(0,0,0,1));
		var rod1 = new Rectangle(2, 6, new ColourCStyle(0,0,0,1));
		rod1.setOffsetPosition(new Pair(-4, -10));
		var rod2 = new Rectangle(2, 6, new ColourCStyle(0,0,0,1));
        rod2.setOffsetPosition(new Pair(0, -10));
		var rod3 = new Rectangle(2, 6, new ColourCStyle(0,0,0,1));
        rod3.setOffsetPosition(new Pair(4, -10));

		var weapon = this.createWeapon(
			"Shotgun",
			[gun, rod1, rod2, rod3, arc],
			new Pair(0, _baseGunY - 4),
			"Shotgun",
			4, 24, 36, 12, 1, 1.75, 1, 10
		);
		var bulletShape = this.createBulletShape(4, 6, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(0, -16), 1, 6, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
    createWeapon_Rifle(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(8, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 12));
		var gun = new Rectangle(10, 24, new ColourCStyle(0,0,0,1));
        var barrel = new Rectangle(6, 8, new ColourCStyle(0,0,0,1));
        barrel.setOffsetPosition(new Pair(0, -16));

		var weapon = this.createWeapon(
			"Rifle",
			[gun, barrel, arc],
			new Pair(0, _baseGunY - 4),
			"Rifle",
			14, 12, 90, 30, 1, 0.5, 5, 7
		);
		var bulletShape = this.createBulletShape(6, 9, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(0, 0), 1, 1, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
    createWeapon_SMG(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(4, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 6));
		var gun = new Rectangle(8, 20, new ColourCStyle(0,0,0,1));
        var side = new Rectangle(8, 4, new ColourCStyle(0,0,0,1));
        side.setOffsetPosition(new Pair(6, 0));
        var barrel = new Rectangle(4, 8, new ColourCStyle(0,0,0,1));
        barrel.setOffsetPosition(new Pair(0, -12));

		var weapon = this.createWeapon(
			"SMG",
			[gun, side, barrel, arc],
			new Pair(0, _baseGunY - 6),
			"SMG",
			7, 10, 150, 50, 1, 0.2, 2, 7
		);
		var bulletShape = this.createBulletShape(4, 6, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(0, 0), 1, 1, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
    createWeapon_DualSMG(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(16, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 16));
        var ang = 20;
		var gun1 = new Rectangle(8, 20, new ColourCStyle(0,0,0,1));
        gun1.setOffsetPosition(new Pair(9, 6));
        var barrel1 = new Rectangle(4, 8, new ColourCStyle(0,0,0,1));
        barrel1.setOffsetPosition(new Pair(9, -6));
        var gun2 = new Rectangle(8, 20, new ColourCStyle(0,0,0,1));
        gun2.setOffsetPosition(new Pair(-9, 6));
        var barrel2 = new Rectangle(4, 8, new ColourCStyle(0,0,0,1));
        barrel2.setOffsetPosition(new Pair(-9, -6));
        var side1 = new Rectangle(8, 4, new ColourCStyle(0,0,0,1));
        side1.setOffsetPosition(new Pair(12, 10));
        var side2 = new Rectangle(8, 4, new ColourCStyle(0,0,0,1));
        side2.setOffsetPosition(new Pair(-12, 10));
        
        gun1.setOffsetAngle(-ang);
        gun2.setOffsetAngle(ang);
        barrel1.setOffsetAngle(-ang);
        barrel2.setOffsetAngle(ang);
        side1.setOffsetAngle(-ang);
        side2.setOffsetAngle(ang);

		var weapon = this.createWeapon(
			"Dual SMG",
			[gun1, gun2, side1, side2, barrel1, barrel2, arc],
			new Pair(0, _baseGunY - 2),
			"Dual SMG",
			7, 20, 240, 80, 2, 0.2, 2, 7
		);
		var bulletShape = this.createBulletShape(4, 6, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(2, -4), 1, 1, -ang, new NullShape(), [bulletShape]
		));
        weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(-2, -4), 1, 1, ang, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
    createWeapon_Sniper(style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
        var arc = this.createHandleShape(-4, new StrokeCStyle(0,0,0,1,4));
		arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY + 28));
		var gun = new Rectangle(4, 72, new ColourCStyle(0,0,0,1));
        var reticle = new Circle(4, new StrokeCStyle(0,0,0,1,2));
        reticle.setOffsetPosition(new Pair(10, 30));

		var weapon = this.createWeapon(
			"S.Rifle",
			[gun, arc, reticle],
			new Pair(0, _baseGunY - 30),
			"S.Rifle",
			30, 0, 24, 8, 1, 2.5, 10, 20
		);
		var bulletShape = this.createBulletShape(4, 12, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(this,
			new Pair(0, -36), 1, 1, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}
    
	// ITEMS
	createItemRing(){
		var shape = new Circle(24, new StrokeCStyle(255,255,255,1,4));
		return shape;
	}
    
    createMoneyPack(amount){
        var stop1 = new GradientStop(0, 255, 255, 255, 1);
		var stop2 = new GradientStop(1, 232, 196, 0, 1);
        var style = new GradientStyle(true, true, [stop1, stop2]);
		style.horizontalGrd = false;
        style.setOutline("black");
		style.outlineWidth = 1;
        
        var b1 = new Polygon(
            [new Pair(-10, -4), new Pair(10, -4), new Pair(15, 4), new Pair(-15, 4)], 
            style);
        b1.setOffsetPosition(new Pair(0, -4));
        var b2 = new Polygon(
            [new Pair(-10, -4), new Pair(10, -4), new Pair(15, 4), new Pair(-15, 4)], 
            style);
        b2.setOffsetPosition(new Pair(-15, 4));
        var b3 = new Polygon(
            [new Pair(-10, -4), new Pair(10, -4), new Pair(15, 4), new Pair(-15, 4)], 
            style);
        b3.setOffsetPosition(new Pair(15, 4));
        var ring = this.createItemRing();
        
        var actor = new MoneyPickup(this, new Pair(0,0), [b1, b2, b3, ring], amount);
        return actor;
    }

	createAmmoPack(){
		var stop1 = new GradientStop(0, 255, 255, 255, 1);
		var stop2 = new GradientStop(1, 192, 192, 192, 1);
        var style = new GradientStyle(true, true, [stop1, stop2]);
		style.horizontalGrd = false;
        style.setOutline("black");
		style.outlineWidth = 1;
		var s1 = this.createBulletShape(8, 20, style);
		var s2 = this.createBulletShape(8, 20, style);
		s2.setOffsetPosition(new Pair(-12, 0));
		var s3 = this.createBulletShape(8, 20, style);
        s3.setOffsetPosition(new Pair(12, 0));
		var ring = this.createItemRing();

		var actor = new AmmoPickup(this, new Pair(0,0), [s1, s2, s3, ring]);
		return actor;		
	}
	
	createHealthPack(amount, max){
        var stop1 = new GradientStop(0, 255, 255, 255, 1);
        var stop2 = new GradientStop(1, 96, 252, 96, 1);
        var style = new GradientStyle(true, true, [stop1, stop2]);
        style.horizontalGrd = false;
        style.setOutline("black");
        style.outlineWidth = 1;
        
        var plus = new Polygon(
            [new Pair(-4, -20), new Pair(4, -20), new Pair(4, -4), new Pair(20, -4), 
            new Pair(20, 4), new Pair(4, 4), new Pair(4, 20), new Pair(-4, 20),
            new Pair(-4, 4), new Pair(-20, 4), new Pair(-20, -4), new Pair(-4, -4)],
            style);
            
		var ring = this.createItemRing();
        var actor = new HealthPickup(this, new Pair(0,0), [plus, ring], amount, max); 
        return actor;
    }
    
    createRandomWeapon(style){
        var rand = Math.random();
        // 5%
        if (rand < 0.05){
            return this.createWeapon_Sniper(style);
        }
        // 7%
        else if (rand < 0.12){
            return this.createWeapon_DualSMG(style);
        }
        // 7%
        else if (rand < 0.19){
            return this.createWeapon_DualPistol(style);
        }
        // 11%
        else if (rand < 0.30){
            return this.createWeapon_SMG(style);
        }
        // 20%
        else if (rand < 0.50){
            return this.createWeapon_Rifle(style);
        }
        // 15 %
        else if (rand < 0.65){
            return this.createWeapon_Shotgun(style);
        }
        // 35 %
        return this.createWeapon_Gun(style);
    }
    
    createWeaponDrop(style){
        return this.createRandomWeapon(style);
    }
    
    addMoneyPickup(position, amount){
        var item = this.createMoneyPack(amount);
        item.setPosition(position.x, position.y);
        this.addActor(item);
    }

	addHealthPickup(position, amount, max){
		var item = this.createHealthPack(amount, max);
		item.setPosition(position.x, position.y);
		this.addActor(item);
	}

	addAmmoPickup(position){
		var item = this.createAmmoPack();
		item.setPosition(position.x, position.y);
		this.addActor(item);
	}
    
    addWeaponDrop(position){
        var weapon = this.createRandomWeapon(style);
        var pickup = null;
        return pickup;
    }
    
    // Tries to spawn an item at a random spawn point, and returns true if it was possible
	spawnItemAtRandom(){
		var spawn = null;
		// Shuffle the spawn points
		var shuffledSpawns = shuffle(this.itemSpawnLocations.slice());
		for (var i = 0; i < shuffledSpawns.length; i++){
			var canUseSpawn = true;
			spawn = shuffledSpawns[i];
			if (canUseSpawn){
				break;
			}
			else{
				spawn = null;
			}
		}

		// Spawn item
		if (spawn){
			this.spawnRandomItemAt(spawn);
			return true;
		}
		return false;
	}
    
    spawnRandomItemAt(spawn){
        var spawnPos = new Pair(spawn.x + randint(25), spawn.y + randint(25));
        var rand = Math.random();
        
        // Money
        if (rand < 0.35){
            this.addMoneyPickup(spawnPos, 50);
        }
        // Health
        else if (rand < 0.575){
            var maxHP = (Math.random() < 0.1);
            this.addHealthPickup(spawnPos, 30, maxHP);
        }
        // Ammo
        else if (rand < 0.80){
            this.addAmmoPickup(spawnPos);
        }
        else{
            // Weapon
        }
    }

	// BLOCKS
    createHPBlock(width, length, HP){
		var gStops = [];
		for (var i = 0; i < 2; i++){
			var red=randint(255), green=randint(255), blue=randint(255);
			var stop = new GradientStop(i, red, green, blue, 1);
			gStops.push(stop);
		}
                var style = new GradientStyle(false, true, gStops);
		style.setOutline("white");
                var shape = new Rectangle(width, length, style);
		var block = new ActorHPBlock(this, new Pair(0,0), shape, HP);
		return block;
	}
    
	addHPBlock(position, width, length, HP){
		var gStops = [];
		for (var i = 0; i < 2; i++){
			var red=randint(255), green=randint(255), blue=randint(255);
			var stop = new GradientStop(i, red, green, blue, 1);
			gStops.push(stop);
		}
                var style = new GradientStyle(false, true, gStops);
		style.setOutline("white");
                var shape = new Rectangle(width, length, style);
		var block = new ActorHPBlock(this, position, shape, HP);
		this.addActor(block);
	}

	// Actor lists
	getAllEnemies(){
        return [];
	}
	getAllItems(){
		var items = [];
		for(var i=0;i<this.actors.length;i++){
                if (this.actors[i] instanceof ItemPickup){
				items.push(this.actors[i]);
			}
        }
		return items;
	}
	getAllBlocks(){
		var blocks = [];
		for(var i=0;i<this.actors.length;i++){
            if (this.actors[i] instanceof ActorHPBlock){
                blocks.push(this.actors[i]);
            }
        }
        return blocks;
	}
    getAllTerrain(){
        return this.terrainActors;
    }

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
        // Spawn in players if need be
        this.spawnPlayersInQueue();
        
        // Spawn items if need be
        var items = this.getAllItems();
        if (this.itemSpawnCountdown == 0){
            // Spawn random item
            if (items.length < this.maxItems){
                this.spawnItemAtRandom();
            }
            this.itemSpawnCountdown = 240;
        }
        else{
            this.itemSpawnCountdown--;
        }
        
        
		// Run actor steps only if enabled
		for(var i=0;i<this.actors.length;i++){
			if (this.actors[i].enabled){
				this.actors[i].step();
			}
		}
	}

	// ACTOR INTERACTION

	// Calculates if two rectangles 1 & 2 intersect, where a rectangle z is defined by its top
	// left corner position lz, and its bottom right corner position rz
	willRectanglesIntersect(l1, r1, l2, r2){
		if (l1.x > r2.x || l2.x > r1.x){
                        return false;
                }

                if (l1.y > r2.y || l2.y > r1.y){
                        return false;
                }
                return true;
	}
	willActorsCollide(position1, actor1, position2, actor2){
		var hitBoxes1 = actor1.getCollisions(position1);
		var hitBoxes2 = actor2.getCollisions(position2);

		// Check all the hitboxes of actor1 and actor2
		for(var i = 0; i < hitBoxes1.length; i++){
			var box1 = hitBoxes1[i];
			for(var j = 0; j < hitBoxes2.length; j++){
				var box2 = hitBoxes2[j];
				// If any two hitboxes intersect, the actors collide
				if (this.willRectanglesIntersect(box1[0], box1[1], box2[0], box2[1])){
					return true;
				}
			}
		}
		return false;
        }
	getCollidingActors(position, actor){
		var collidingActors = [];
        var allActors = this.getAllActors();
		// Can't collide with self or descendants or ancestors
		for (var i=0;i<allActors.length;i++){
			if (actor != allActors[i]
			//&& !actor.isInFamilyTree(this.actors[i])
			&& allActors[i].enabled){
				var otherPosition = allActors[i].getTruePosition();
				var collision = this.willActorsCollide(position, actor, otherPosition, allActors[i]);
				if (collision){
					collidingActors.push(allActors[i]);
				}
			}
		}
		return collidingActors;
	}

	getDistance(actor1, actor2){
		var truePos1 = actor1.getTruePosition();
		var truePos2 = actor2.getTruePosition();
		return truePos1.distanceTo(truePos2);

		//return Math.sqrt(Math.pow(truePos1.x - truePos2.x, 2) + Math.pow(truePos1.y - truePos2.y, 2));
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
    getActorByID(actorID){
        var allActors = this.getAllActors();
        for(var i=0;i<allActors.length;i++){
            var actor = allActors[i].getActorInTree(actorID);
            if (actor){
                return actor;
            }
		}
		return null;
    }
    getActors(){
        return this.actors;
    }
	getAllActors(){
		var actors = [];
		for(var i=0;i<this.actors.length;i++){
			actors.push(this.actors[i]);
        }
		for (var i=0;i<this.terrainActors.length;i++){
			actors.push(this.terrainActors[i]);
		}
		return actors;
	}
	getAllCharacters(){
		var actors = [];
        for(var i=0;i<this.actors.length;i++){
			if (this.actors[i] instanceof ActorCharacter){
				actors.push(this.actors[i]);
			}
        }
        return actors;
	}
	
	// OTHER ACTORS
	addTerrainActor(actor){
		this.terrainActors.push(actor);
	}
	createTerrain(position, width, height, layer, speedMod, style){
		var shape = new Rectangle(width, height, style);
		var terrain = new TerrainActor(this, position, [shape], layer, speedMod);
		return terrain;
	}
	
	createTeleporter(position, toPosition){
		var teleporter = new TransporterActor(this, position);
		if (toPosition){
			teleporter.setToLocation(toPosition);
		}
		return teleporter;
	}

	// STAGE
	setStage(stageName){
		if (stageName == "Basic"){
			this.width=4800;
			this.height=4800;
            
            var offsetL = 800;
            var offsetH = 800;

			var l = this.width - offsetL;
			var h = this.height - offsetH;
			var thickness = 32;
			var wallStyle = new ColourCStyle(0,0,0,1);
			
			var topWall = new Rectangle(l, thickness, wallStyle);
			topWall.setOffsetPosition(new Pair(0, -h/2));
			var bottomWall = new Rectangle(l, thickness, wallStyle);
			bottomWall.setOffsetPosition(new Pair(0, h/2));
			var leftWall = new Rectangle(thickness, h, wallStyle);
			leftWall.setOffsetPosition(new Pair(-l/2, 0));
			var rightWall = new Rectangle(thickness, h, wallStyle);
			rightWall.setOffsetPosition(new Pair(l/2, 0));

			this.stageActor = new StageActor(this, new Pair(this.width/2, this.height/2), stageName, [topWall, bottomWall, leftWall, rightWall]);
			this.addActor(this.stageActor);

			this.mapCenter = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
            
            this.playerSpawnLocations = [
            
                // center
                new Pair(Math.floor(this.width/2), Math.floor(this.height/2)),
                
                // center right
                new Pair(Math.floor(this.width/2) + Math.floor(offsetL/2), Math.floor(this.height/2)),
                
                // center left
                new Pair(Math.floor(this.width/2) - Math.floor(offsetL/2), Math.floor(this.height/2)),
                
                // center bottom
                new Pair(Math.floor(this.width/2), Math.floor(this.height/2) + Math.floor(offsetH/2)),
                
                // center top
                new Pair(Math.floor(this.width/2), Math.floor(this.height/2) - Math.floor(offsetH/2))
            
            ];

			// Terrain
            var baseStyle = (this.ID == 0)? new ColourCStyle(64,128,64,1) :
                (this.ID == 1)? new ColourCStyle(128,64,64,1) : 
                new ColourCStyle(64,64,128,1);
            var lightStyle = new ColourCStyle(255,255,255,0.25);
            var darkStyle = new ColourCStyle(0,0,0,0.25);
            
			var baseTerrain = this.createTerrain(
				new Pair(this.width/2, this.height/2),
                    this.width,
                    this.height,
                    1,
                    1,
                    baseStyle);
			this.addTerrainActor(baseTerrain);
			var fastTerrain = this.createTerrain(
				new Pair(this.mapCenter.x + offsetL, this.mapCenter.y + offsetH), 
				400, 
				400,
				2,
				2, 
				lightStyle);
			this.addTerrainActor(fastTerrain);
			var slowTerrain = this.createTerrain(
                new Pair(this.mapCenter.x - offsetL, this.mapCenter.y - offsetH),
                200,
                200,
                2,
                0.5,
                darkStyle);
            this.addTerrainActor(slowTerrain);

			// Transporters
			var t1 = this.createTeleporter(new Pair(offsetL + 100, offsetH + 100), null); // top left corner
			var t2 = this.createTeleporter(new Pair(l - 100, h - 100), null); // bottom right corner
			//var t3 = this.createTeleporter(new Pair(this.mapCenter.x, this.mapCenter.y - offsetH), new Pair(this.mapCenter.x, this.mapCenter.y + offsetH));
			t1.setToTransporter(t2);
			t2.setToTransporter(t1);

			this.addActor(t1);
			this.addActor(t2);
			//this.addActor(t3);
            
            // Item Spawn Locations
            this.itemSpawnLocations = [
                new Pair(this.mapCenter.x - offsetL, this.mapCenter.y + offsetH),
                new Pair(this.mapCenter.x + offsetL, this.mapCenter.y - offsetH),
                new Pair(this.mapCenter.x + offsetL, this.mapCenter.y + offsetH),
                new Pair(this.mapCenter.x - offsetL, this.mapCenter.y - offsetH),
                new Pair(offsetL + 100, h - 100),
                new Pair(l - 100, offsetH + 100),
                new Pair(this.mapCenter.x + offsetL + offsetL, this.mapCenter.y + offsetH + offsetH),
                new Pair(this.mapCenter.x - offsetL - offsetL, this.mapCenter.y - offsetH - offsetH),
                new Pair(this.mapCenter.x, this.mapCenter.y + offsetH + offsetH),
                new Pair(this.mapCenter.x, this.mapCenter.y - offsetH - offsetH),
                new Pair(this.mapCenter.x + offsetL + offsetL, this.mapCenter.y),
                new Pair(this.mapCenter.x - offsetL - offsetL, this.mapCenter.y)
            ];
            this.maxItems = 10;
            this.itemSpawnCountdown = 240;
            
            // Spawn some barriers
            

			//this.bossSpawnLocations = [];
		}
	}


} // End Class GameModel

class Pair {
        constructor(x,y){
                this.x=x; this.y=y;
        }

        toString(){
                return "("+this.x+","+this.y+")";
        }

        normalize(){
                var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
                this.x=this.x/magnitude;
                this.y=this.y/magnitude;
        }
	
	plus(other){
		return new Pair(this.x + other.x, this.y + other.y);
	}

	minus(other){
		return new Pair(this.x - other.x, this.y - other.y);
	}

	times(other){
		return new Pair(this.x * other.x, this.y * other.y);
	}

	magnitude(){
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	dot(other){
		return this.x * other.x + this.y * other.y;
	}

	distanceTo(other){
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}

	rotateOnAngle(angle){
		var radianAngle = angle * Math.PI / 180;
		var x = this.x * Math.cos(radianAngle) - this.y * Math.sin(radianAngle);
		var y = this.x * Math.sin(radianAngle) + this.y * Math.cos(radianAngle);
		return new Pair(x, y);
	}

	scaleBy(value){
		this.x *= value;
		this.y *= value;
	}
    
    clone(){
        return new Pair(this.x, this.y);
    }

} // End Pair Class

class ContextStyle {
	constructor(){
		// colour
		this.colorString = null;
		this.red = 0;
		this.green = 0;
		this.blue = 0;
		this.alpha = 1;

		// fill / stroke
		this.fill = true;
		this.lineWidth = 1;
	
		// outline
		this.outline = false;
		this.outlineWidth = 4;
		this.outlineColorString = null;
		this.outlineRed = 0;
		this.outlineGreen = 0;
		this.outlineBlue = 0;
		this.outlineAlpha = 0;

		// gradient
		this.isGradient = false;
		this.isGradientLinear = true;
		this.gradientStops = [];
		this.autoCalculateGrd = true;
		this.horizontalGrd = true;

		// gradient specific values
		// if autoCalculateGrd is false, use these values to define the gradient
		this.grdx1 = 0;
		this.grdy1 = 0;
		this.grdr1 = 0;
		this.grdx2 = 0;
		this.grdy2 = 0;
		this.grdr2 = 0;

		// misc effects
		this.cc = false; //counter-clockwise for arcs
		this.imageSrc = ""; // for images
	}
	getColor(){
		if (this.colorString){
			return getHexColor(this.colorString);
		}
		return 'rgba('+this.red+','+this.green+','+this.blue+','+this.alpha+')';
	}
	setColor(color){
		this.colorString = color;
	}
	setColorRGBA(red, green, blue, alpha){
                this.red = red;
                this.green = green;
                this.blue = blue;
                this.alpha = alpha;
        }
	getOutlineColor(){
		if (this.outlineColorString){
			return getHexColor(this.outlineColorString);
		}
		return 'rgba('+this.outlineRed+','+this.outlineGreen+','+this.outlineBlue+','+this.outlineAlpha+')';
	}
	setOutline(color){
		this.outlineColorString = color;
		this.outline = true;
	}
	setOutlineColorRGBA(red, green, blue, alpha){
		this.outlineRed = red;
		this.outlineGreen = green;
		this.outlineBlue = blue;
		this.outlineAlpha = alpha;
	}
	addGradientStop(stop){
		if (this.gradientStops.length == 0){
			stop.value = 0;
			this.gradientStops.push(stop);
		}
		this.isGradient = true;
	}
	clone(){
		var cloneStyle = new ContextStyle();
		// colour
                cloneStyle.colorString = this.colorString;
                cloneStyle.red = this.red;
                cloneStyle.green = this.green;
                cloneStyle.blue = this.blue;
                cloneStyle.alpha = this.alpha;

                // fill / stroke
                cloneStyle.fill = this.fill;
                cloneStyle.lineWidth = this.lineWidth;

                // outline
                cloneStyle.outline = this.outline;
                cloneStyle.outlineWidth = this.outlineWidth;
                cloneStyle.outlineColorString = this.outlineColorString;
                cloneStyle.outlineRed = this.outlineRed;
                cloneStyle.outlineGreen = this.outlineGreen;
                cloneStyle.outlineBlue = this.outlineBlue;
                cloneStyle.outlineAlpha = this.outlineAlpha;

		// gradient
                cloneStyle.isGradient = this.isGradient;
                cloneStyle.isGradientLinear = this.isGradientLinear;
                cloneStyle.gradientStops = []; 
		for (var i = 0; i < this.gradientStops.length; i++){
			cloneStyle.addGradientStop(this.gradientStops[i].clone());
		}
                cloneStyle.autoCalculateGrd = this.autoCalculateGrd;
                cloneStyle.horizontalGrd = this.horizontalGrd;

                // gradient specific values
                // if autoCalculateGrd is false, use these values to define the gradient
                cloneStyle.grdx1 = this.grdx1;
                cloneStyle.grdy1 = this.grdy1;
                cloneStyle.grdr1 = this.grdr1;
                cloneStyle.grdx2 = this.grdx2;
                cloneStyle.grdy1 = this.grdy2;
                cloneStyle.grdr2 = this.grdr2;

                // misc effects
                cloneStyle.cc = this.cc; //counter-clockwise for arcs
                cloneStyle.imageSrc = this.imageSrc; // for images
		return cloneStyle;
	}
} // End Context Style Class

class NullCStyle extends ContextStyle {
	constructor(){
		super();
		this.alpha = 0;
	}
}

class ImageCStyle extends ContextStyle {
	constructor(imageSrc){
		super();
		this.imageSrc = imageSrc;
	}
}

class ColourCStyle extends ContextStyle {
	constructor(red, green, blue, alpha){
		super();
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}
}

class StrokeCStyle extends ColourCStyle{
	constructor(red, green, blue, alpha, lineWidth){
        super(red, green, blue, alpha);
		this.fill = false;
		this.lineWidth = lineWidth;
    }
}

class GradientStyle extends ContextStyle {
	constructor(isLinear, autoCalculate, stops){
		super();
		this.isGradient = true;
		this.isGradientLinear = isLinear;
		this.autoCalculateGrd = autoCalculate;
		this.gradientStops = stops;
	}
}

class GradientStop {
	constructor(value, red, green, blue, alpha){
		this.value = value;
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}
	getColor(){
		return 'rgba('+this.red+','+this.green+','+this.blue+','+this.alpha+')';
	}
	clone(){
		var cloneGS = new GradientStop(this.value, this.red, this.green, this.blue, this.alpha);
		return cloneGS;
	}
}

// GAME OBJECTS

class Shape {
	constructor(contextStyle){
        this.shapeType = "";
		this.offsetPosition = new Pair(0, 0);
		this.offsetAngle = 0;
		this.contextStyle = contextStyle;
		this.ignoreCollisions = false;
	}
	getGradient(context){
		return (this.contextStyle.isGradientLinear)?
			context.createLinearGradient(0, 0, 0, 0) :
                        context.createRadialGradient(0, 0, 0, 0, 0, 0);
	}
	getStyle(context){
		var style = this.contextStyle.getColor();
                if (this.contextStyle.isGradient){
                        var grd = this.getGradient(context);
                        style = grd;
        }
		return style;
	}
	setOffsetPosition(position){
		this.offsetPosition.x = position.x;
		this.offsetPosition.y = position.y;
	}
	setOffsetAngle(angle){
		this.offsetAngle = angle;
	}
	draw(context, position, rotation){
		//console.log("drawing shape...");
	}
	getCollisionPoints(rootPosition){
		return [new Pair(rootPosition.x, rootPosition.y)];
	}
	getWidth(){
		return 0;
	}
	getHeight(){
		return 0;
	}
}

class NullShape extends Shape {
	constructor(){
		super(new NullCStyle());
        this.shapeType = "null";
	}
}

class Rectangle extends Shape {
	constructor(width, height, contextStyle){
        super(contextStyle);
        this.shapeType = "rectangle";
        this.width = width;
		this.height = height;
    }
	getRectCorner(){
		return new Pair(this.offsetPosition.x - this.width/2, this.offsetPosition.y - this.height/2);
	}
	getGradient(context){
		var rectCorner = this.getRectCorner();
		var right = rectCorner.x + ((this.contextStyle.horizontalGrd)? this.width : 0);
		var bottom = rectCorner.y + ((!this.contextStyle.horizontalGrd)? this.height : 0);

		var x1 = (this.contextStyle.autoCalculateGrd)? rectCorner.x : this.contextStyle.x1;
		var y1 = (this.contextStyle.autoCalculateGrd)? rectCorner.y : this.contextStyle.y1;
		var x2 = (this.contextStyle.autoCalculateGrd)? right : this.contextStyle.x2;
		var y2 = (this.contextStyle.autoCalculateGrd)? bottom : this.contextStyle.y2;

		var grd = (this.contextStyle.isGradientLinear)?
			context.createLinearGradient(x1, y1, x2, y2) :
			context.createRadialGradient(0, 0, this.width * 0.1, 0, 0, this.width * 0.9);
		for (var i = 0; i < this.contextStyle.gradientStops.length; i++){
               		var stop = this.contextStyle.gradientStops[i];
                    grd.addColorStop(stop.value, stop.getColor());
                }
		return grd;
	}
	draw(context, rootPosition, angle){
		var xTrns = rootPosition.x;
                var yTrns = rootPosition.y;
		var rectCorner = this.getRectCorner();

		// transform context
		var prevLineWidth = context.lineWidth;
		var prevAlpha = context.globalAlpha;
        context.translate(xTrns, yTrns);
        context.rotate((angle + this.offsetAngle) * Math.PI / 180);

		var style = this.getStyle(context);
		// main shape
                if (this.contextStyle.fill){
                        context.fillStyle = style;
                        context.fillRect(rectCorner.x, rectCorner.y, this.width, this.height);
                }
                else{
                    context.strokeStyle = style;
                    context.lineWidth = this.contextStyle.lineWidth;
                    context.strokeRect(rectCorner.x, rectCorner.y, this.width, this.height);
                }

		// outline
		if (this.contextStyle.outline){
			context.strokeStyle = this.contextStyle.getOutlineColor();
			context.lineWidth = this.contextStyle.outlineWidth;
			context.strokeRect(rectCorner.x, rectCorner.y, this.width, this.height);
		}

		// Reset context
                context.rotate(-(angle + this.offsetAngle) * Math.PI / 180);
		context.translate(-xTrns, -yTrns);
		context.globalAlpha = prevAlpha;
		context.lineWidth = prevLineWidth;
        }
	getCollisionPoints(rootPosition){
		var collisionPoints = [];
		// Top-Left Corner
		collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x - this.width/2, this.offsetPosition.y + rootPosition.y - this.height/2));
		// Bottom-Right Corner
                collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x + this.width/2, this.offsetPosition.y + rootPosition.y + this.height/2));
		
		return collisionPoints;
	}
	getWidth(){
                return this.width;
        }
        getHeight(){
                return this.height;
        }
}

class Square extends Rectangle {
	constructor(length, contextStyle){
		super(length, length, contextStyle);
        this.shapeType = "square";
	}
}

class Arc extends Shape{
	constructor(radius, sAngle, eAngle, contextStyle){
        super(contextStyle);
        this.shapeType = "arc";
        this.radius = radius;
		this.sAngle = sAngle;
		this.eAngle = eAngle;
    }
	getRectCorner(){
		return new Pair(this.offsetPosition.x - this.radius, this.offsetPosition.y - this.radius);
	}
	getGradient(context){
                var rectCorner = this.getRectCorner();
                var right = rectCorner.x + ((this.contextStyle.horizontalGrd)? 2 * this.radius : 0);
                var bottom = rectCorner.y + ((!this.contextStyle.horizontalGrd)? 2 * this.radius : 0);

                var x1 = (this.contextStyle.autoCalculateGrd)? rectCorner.x : this.contextStyle.x1;
                var y1 = (this.contextStyle.autoCalculateGrd)? rectCorner.y : this.contextStyle.y1;
                var x2 = (this.contextStyle.autoCalculateGrd)? right : this.contextStyle.x2;
                var y2 = (this.contextStyle.autoCalculateGrd)? bottom : this.contextStyle.y2;

		var r1 = (this.contextStyle.autoCalculateGrd)? 0 : this.contextStyle.r1;
		var r2 = (this.contextStyle.autoCalculateGrd)? this.radius : this.contextStyle.r2;

                var grd = (this.contextStyle.isGradientLinear)?
                        context.createLinearGradient(x1, y1, x2, y2) :
                        context.createRadialGradient(0, 0, r1, 0, 0, r2);
                for (var i = 0; i < this.contextStyle.gradientStops.length; i++){
                        var stop = this.contextStyle.gradientStops[i];
                        grd.addColorStop(stop.value, stop.getColor());
                }
                return grd;
        }
	draw(context, rootPosition, angle){
		var xTrns = rootPosition.x;
		var yTrns = rootPosition.y;

		var prevLineWidth = context.lineWidth;
		var prevAlpha = context.globalAlpha;
		context.translate(xTrns, yTrns);
		context.rotate((angle + this.offsetAngle) * Math.PI / 180);

		var style = this.getStyle(context);
                // main shape
                if (this.contextStyle.fill){
                        context.fillStyle = style;
			context.beginPath();
			context.arc(this.offsetPosition.x, this.offsetPosition.y, this.radius, this.sAngle, this.eAngle, this.contextStyle.cc);
			context.fill();
                }
                else{
                        context.strokeStyle = style;
			context.lineWidth = this.contextStyle.lineWidth;
			context.beginPath();
			context.arc(this.offsetPosition.x, this.offsetPosition.y, this.radius, this.sAngle, this.eAngle, this.contextStyle.cc);
			context.stroke();
                }

		// outline
                if (this.contextStyle.outline){
                        context.strokeStyle = this.contextStyle.getOutlineColor();
                        context.lineWidth = this.contextStyle.outlineWidth;
			context.beginPath();
                        context.arc(this.offsetPosition.x, this.offsetPosition.y, this.radius, this.sAngle, this.eAngle, this.contextStyle.cc);
                        context.stroke();
                }

		// Reset context
		context.rotate(-(angle + this.offsetAngle) * Math.PI / 180);
		context.translate(-xTrns, -yTrns);
		context.globalAlpha = prevAlpha;
		context.lineWidth = prevLineWidth;
        }
	getCollisionPoints(rootPosition){
		var collisionPoints = [];

                // Top-Left
                collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x - this.radius, this.offsetPosition.y + rootPosition.y - this.radius));
		// Bottom-Right
                collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x + this.radius, this.offsetPosition.y + rootPosition.y + this.radius));

                return collisionPoints;
        }
	getWidth(){
                return this.radius * 2;
        }
        getHeight(){
                return this.getWidth();
        }
}

class Circle extends Arc{
	constructor(radius, contextStyle){
        super(radius, 0, 2 * Math.PI, contextStyle);
        this.shapeType = "circle";
    }
}

class ImageShape extends Rectangle {
	constructor(width, height, contextStyle){
		super(width, height, contextStyle);
        this.shapeType = "image";
	}
	draw(context, rootPosition, angle){
		context.translate(rootPosition.x, rootPosition.y);
                context.rotate((angle + this.offsetAngle) * Math.PI / 180);

		var prevAlpha = context.globalAlpha;
		context.globalAlpha *= this.contextStyle.alpha;

		// draw image
		var image = new Image();
		image.src = this.contextStyle.imageSrc;
		context.drawImage(image, this.offsetPosition.x - this.width/2, this.offsetPosition.y - this.height/2);

		context.globalAlpha = prevAlpha;
		context.rotate(-(angle + this.offsetAngle) * Math.PI / 180);
		context.translate(-rootPosition.x, -rootPosition.y);
	}
}

class Polygon extends Shape {
	constructor(vertices, contextStyle){
		super(contextStyle);
        this.shapeType = "polygon";
		this.vertices = vertices;
	}
	getRectCorner(){
		return new Pair(this.offsetPosition.x - this.getWidth()/2, this.offsetPosition.y - this.getHeight()/2);
	}
	getGradient(context){
                var rectCorner = this.getRectCorner();
		var width = this.getWidth();
		var height = this.getHeight();
                var right = rectCorner.x + ((this.contextStyle.horizontalGrd)? width : 0);
                var bottom = rectCorner.y + ((!this.contextStyle.horizontalGrd)? height : 0);

                var x1 = (this.contextStyle.autoCalculateGrd)? rectCorner.x : this.contextStyle.x1;
                var y1 = (this.contextStyle.autoCalculateGrd)? rectCorner.y : this.contextStyle.y1;
                var x2 = (this.contextStyle.autoCalculateGrd)? right : this.contextStyle.x2;
                var y2 = (this.contextStyle.autoCalculateGrd)? bottom : this.contextStyle.y2;

                var grd = (this.contextStyle.isGradientLinear)?
                        context.createLinearGradient(x1, y1, x2, y2) :
                        context.createRadialGradient(0, 0, width * 0.1, 0, 0, width * 0.9);
                for (var i = 0; i < this.contextStyle.gradientStops.length; i++){
                        var stop = this.contextStyle.gradientStops[i];
                        grd.addColorStop(stop.value, stop.getColor());
                }
                return grd;
        }
        draw(context, rootPosition, angle){
		var xTrns = rootPosition.x;
        var yTrns = rootPosition.y;
        var rectCorner = this.getRectCorner();

        // transform context
        var prevLineWidth = context.lineWidth;
        var prevAlpha = context.globalAlpha;
        context.translate(xTrns, yTrns);
        context.rotate((angle + this.offsetAngle) * Math.PI / 180);

        var style = this.getStyle(context);
		// sketch polygon
		context.beginPath();
		context.moveTo(this.vertices[0].x + this.offsetPosition.x, this.vertices[0].y + this.offsetPosition.y);
		for (var i = 1; i < this.vertices.length; i++){
			context.lineTo(this.vertices[i].x + this.offsetPosition.x, this.vertices[i].y + this.offsetPosition.y);
		}
        context.lineTo(this.vertices[0].x + this.offsetPosition.x, this.vertices[0].y + this.offsetPosition.y);
		context.closePath();

		// main shape
                if (this.contextStyle.fill && this.vertices.length > 1){
                        context.fillStyle = style;
			context.fill();
                }
                else{
                        context.strokeStyle = style;
                        context.lineWidth = this.contextStyle.lineWidth;
                        context.stroke();
                }
                // outline
                if (this.contextStyle.outline){
                        context.strokeStyle = this.contextStyle.getOutlineColor();
                        context.lineWidth = this.contextStyle.outlineWidth;
                        context.stroke();
                }

                // Reset context
                context.rotate(-(angle + this.offsetAngle) * Math.PI / 180);
                context.translate(-xTrns, -yTrns);
                context.globalAlpha = prevAlpha;
                context.lineWidth = prevLineWidth;

	}
	getLeftMostVertex(){
		var vertex = this.vertices[0];
		for (var i = 0; i < this.vertices.length; i++){
			if (this.vertices[i].x < vertex.x){
				vertex = this.vertices[i];
			}
		}
		return vertex;
	}
	getRightMostVertex(){
        var vertex = this.vertices[0];
        for (var i = 0; i < this.vertices.length; i++){
            if (this.vertices[i].x > vertex.x){
                vertex = this.vertices[i];
            }
        }
        return vertex;
    }
	getHighestVertex(){
        var vertex = this.vertices[0];
        for (var i = 0; i < this.vertices.length; i++){
            if (this.vertices[i].y < vertex.y){
                vertex = this.vertices[i];
            }
        }
        return vertex;
    }
	getLowestVertex(){
		var vertex = this.vertices[0];
        for (var i = 0; i < this.vertices.length; i++){
            if (this.vertices[i].y > vertex.y){
                vertex = this.vertices[i];
            }
        }
        return vertex;
	}
	getCollisionPoints(rootPosition){
                var collisionPoints = [];
		var width = this.getWidth();
		var height = this.getHeight();

        // Top-Left
        collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x - width/2, this.offsetPosition.y + rootPosition.y - height/2));
        // Bottom-Right
        collisionPoints.push(new Pair(this.offsetPosition.x + rootPosition.x + width/2, this.offsetPosition.y + rootPosition.y + height/2));

        return collisionPoints;
        }
	getWidth(){
		return Math.abs(this.getRightMostVertex().x - this.getLeftMostVertex().x);
    }
    getHeight(){
		return Math.abs(this.getHighestVertex().y - this.getLowestVertex().y);
    }
}

class Triangle extends Polygon {
	constructor(width, height, contextStyle){
		super(
		[new Pair(0, -height/2), new Pair(-width/2, height/2), new Pair(width/2, height/2)],
		contextStyle);
        this.width = width;
        this.height = height;
        this.shapeType = "triangle";
	}
}

class BulletShape extends Polygon {
	constructor(width, height, contextStyle){
        super(
            [new Pair(width/2, -height/2), new Pair(width/2, height/2), new Pair(-width/2, height/2), new Pair(-width/2, -height/2)],
            contextStyle);
        this.width = width;
        this.height = height;
        this.shapeType = "bullet";
    }
	draw(context, rootPosition, angle){
		var xTrns = rootPosition.x;
        var yTrns = rootPosition.y;
        var rectCorner = this.getRectCorner();

        // transform context
        var prevLineWidth = context.lineWidth;
        var prevAlpha = context.globalAlpha;
        context.translate(xTrns, yTrns);
        context.rotate((angle + this.offsetAngle) * Math.PI / 180);

        var style = this.getStyle(context);
        // sketch bullet shell
        context.beginPath();
        context.moveTo(this.vertices[0].x + this.offsetPosition.x, this.vertices[0].y + this.offsetPosition.y);
        for (var i = 1; i < this.vertices.length; i++){
            context.lineTo(this.vertices[i].x + this.offsetPosition.x, this.vertices[i].y + this.offsetPosition.y);
        }
		// sketch bullethead
		context.arc(this.offsetPosition.x, this.offsetPosition.y - this.getHeight()/2, this.getWidth()/4, 5 * Math.PI / 4, 7 * Math.PI / 4, false);
		context.closePath();

        // main shape
        if (this.contextStyle.fill && this.vertices.length > 1){
            context.fillStyle = style;
            context.fill();
        }
        else{
            context.strokeStyle = style;
            context.lineWidth = this.contextStyle.lineWidth;
            context.stroke();
        }
        // outline
        if (this.contextStyle.outline){
            context.strokeStyle = this.contextStyle.getOutlineColor();
            context.lineWidth = this.contextStyle.outlineWidth;
            context.stroke();
        }

        // Reset context
        context.rotate(-(angle + this.offsetAngle) * Math.PI / 180);
        context.translate(-xTrns, -yTrns);
        context.globalAlpha = prevAlpha;
        context.lineWidth = prevLineWidth;
	}
}

class Actor {
        constructor(stage, position, name, shape){
        this.stage = null;
        this.stageID = stage.ID;
        this.actorType = "";
        this.actorID = _actorID; _actorID++;
		this.enabled = true; // if false, this actor is ignored from the game's calculations
		this.width = 0; // width can be specified
		this.height = 0; // height can be specified
        this.position=position;
		this.rotationAngle = 0;
        this.neverRotate = false;
		this.name = name;
        this.intPosition(); // this.x, this.y are int version of this.position
		this.passThrough = true; // if false, other actors may not be able to pass through
		this.acceleration = new Pair(0,0); // how fast this actor reach its max velocity
		this.deceleration = new Pair(0,0);
		this.maxVelocity = new Pair(0,0); // the maximum velocity this actor can move at
		this.velocity = new Pair(0,0);
		this.movementVector = null;
		this.collidedActors = []; // The actors that this actor is currently colliding with
    
        this.pointsGiven = 0;

		// actor tree
		this.parentActor = -1;
		this.shapes = [];
		this.subActors = [];

		if (shape instanceof Shape){
			this.addShape(shape);
		}
		else if (shape != null){
			this.shapes = shape;
		}
        
        this.width = this.getWidth();
        this.height = this.getHeight();
    }
	headTo(position){
                this.velocity.x=(position.x-this.position.x);
                this.velocity.y=(position.y-this.position.y);
                this.velocity.normalize();
        }
	fixVelocity(){
		var x = Math.abs(this.velocity.x);
		var y = Math.abs(this.velocity.y);
		if (x > this.maxVelocity.x){
			this.velocity.x = (this.velocity.x > 0)? this.maxVelocity.x : -this.maxVelocity.x;
		}
		if (y > this.maxVelocity.y){
			this.velocity.y = (this.velocity.y > 0)? this.maxVelocity.y : -this.maxVelocity.y;
		}
	}
	intPosition(){
                this.x = Math.round(this.position.x);
                this.y = Math.round(this.position.y);
        }
	step(){
		this.intPosition();
		// Step all sub-actors
		for(var i=0;i<this.subActors.length;i++){
            var actor = this.subActors[i];
            actor.step();
        }
    }
	draw(context){
		// Draw shapes
		for(var i=0;i<this.shapes.length;i++){
            this.shapes[i].draw(context, new Pair(this.x, this.y), this.rotationAngle);
        }

		// translate/rotate canvas before drawing other actors
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotationAngle * Math.PI / 180);
        
        var Ox = 0;
        var Oy = 0;
        var Tx = 0;
        var Ty = 0;

		// Draw subactors
		for(var i=0;i<this.subActors.length;i++){
			var actor = this.subActors[i];
            if (actor.neverRotate){
                context.rotate(-this.rotationAngle * Math.PI / 180);
                Ox = actor.x;
                Oy = actor.y;
                var newO = new Pair(Ox, Oy);
                var rotatedVector = newO.rotateOnAngle(this.rotationAngle);
                Tx = rotatedVector.x;
                Ty = rotatedVector.y;
                actor.setPosition(Tx, Ty);
            }
            actor.draw(context);
            if (actor.neverRotate){
                actor.setPosition(Ox, Oy);
                context.rotate(this.rotationAngle * Math.PI / 180);
            }
        }

		// re-set canvas values
        context.rotate(-this.rotationAngle * Math.PI / 180);
        context.translate(-this.position.x, -this.position.y);
        }
	toString(){
                return this.name + " : " + this.position.toString();
        }
	addShape(shape){
		this.shapes.push(shape);
	}
	setShape(shape){
		this.shapes = [];
		this.addShape(shape);
	}
	// returns the hitboxes for this actor if it was at the given position
	getCollisions(rootPosition){
		var collisions = [];
		for(var i=0;i<this.shapes.length;i++){
			if (!this.shapes[i].ignoreCollisions){
				var collision = this.shapes[i].getCollisionPoints(rootPosition);
				collisions.push(collision);
			}
                }
		return collisions;
	}
	// Returns the terrain that this actor is touching
	getCurrentTerrain(){
		var bestTerrain = null;
		for (var i = 0; i < this.collidedActors.length; i++){
			if (this.collidedActors[i] instanceof TerrainActor){
				if (bestTerrain == null){
					bestTerrain = this.collidedActors[i];
				}
				else if (bestTerrain.layer < this.collidedActors[i].layer){
					bestTerrain = this.collidedActors[i];
				}
			}
		}
		return bestTerrain;
	}
	// gets collisions by specifying the position as this actor's true position
	getRawCollisions(){
		return this.getCollisions(this.getTruePosition());
	}
	getWidth(){
		if (this.width > 0){
			return this.width;
		}
		if (this.shapes.length > 0){
			return this.shapes[0].getWidth();
		}
		return 0;
	}
	getHeight(){
		if (this.height > 0){
			return this.height;
		}
		if (this.shapes.length > 0){
            return this.shapes[0].getHeight();
        }
        return 0;
	}
	// Accumulates this actor's and ancestor(s)' positions, accounting for rotation around their root positions
	getTruePosition(){
        var parentActor = this.getParentActor();
		var rootPosition = (parentActor == null)? this.position : parentActor.getTruePosition();
		var rootAngle = (parentActor == null)? 0 : parentActor.getTrueRotation();
		var vector = (parentActor == null)? new Pair(0,0) : this.position;
		var rotatedVector = vector.rotateOnAngle(rootAngle + this.rotationAngle);
		return new Pair(rootPosition.x + rotatedVector.x, rootPosition.y + rotatedVector.y);
	}
	// Accumulates this actor's and ancestor(s)' rotation angles
	getTrueRotation(){
        var parentActor = this.getParentActor();
		return (parentActor == null)? this.rotationAngle : this.rotationAngle + parentActor.getTrueRotation();
	}
	setPosition(newX, newY){
		this.position.x = newX;
		this.position.y = newY;
        this.intPosition();
	}
	setRotation(angle){
		this.rotationAngle = angle;
	}
	addRotation(angle){
		this.rotationAngle += angle;
	}
	// Orients this actor to a position
	rotateTo(targetPosition){
		var normalVector = new Pair(0, -1);
		var targetVector = targetPosition.minus(this.getTruePosition());
		var dotProduct = normalVector.dot(targetVector);
		var aMag = normalVector.magnitude();
		var bMag = targetVector.magnitude();

		var radianAngle = Math.acos(dotProduct / (aMag * bMag));
		var rawAngle = radianAngle * 180 / Math.PI;
		if (targetVector.x < 0){
			rawAngle = -rawAngle;
		}
		this.setRotation(rawAngle);
	}
	// Orients this actor to another actor
	rotateToActor(targetActor){
		this.rotateTo(targetActor.getTruePosition());
	}
	// Return true if the other actor can pass through this actor
	canPassThrough(otherActor){
		return this.passThrough;
	}
	// Adds a sub actor to this actor
	addSubActor(actor){
		this.subActors.push(actor);
		actor.parentActor = this.actorID;
	}
	// Removes a sub actor from this actor
	removeSubActor(actor){
		var index=this.subActors.indexOf(actor);
		if (index != -1){
			this.subActors.splice(index, 1);
		}
	}
    getParentActor(){
        return _rooms[this.stageID].model.getActorByID(this.parentActor);
    }
	// Returns true if the given actor is a descendant of this actor
	isDescendant(actor){
		for (var i = 0; i < this.subActors.length; i++){
			if (actor == this.subActors[i]){
				return true;
			}
			else{
				if (this.subActors[i].isDescendant(actor)){
					return true;
				}
			}
		}
		return false;
	}
	// Returns true if the given actor is an ancestor of this actor
	isAncestor(actor){
        var parentActor = this.getParentActor();
		if (parentActor){
			if (parentActor == actor){
				return true;
			}
			return parentActor.isAncestor(actor);
		}
		return false;
    }
	// Returns true if the given actor is the same as this one, is a descendant, or is an ancestor
	isInFamilyTree(actor){
		return this == actor
		|| this.isDescendant(actor)
		|| this.isAncestor(actor);
	}
	
    getActorInTree(actorID){
        // Check self first
        if (this.actorID == actorID){
            return this;
        }
        // Check all descendants
        for (var i = 0; i < this.subActors.length; i++){
            var wantedActor = this.subActors[i].getActorInTree(actorID);
            if (wantedActor){
                return wantedActor;
            }
        }
        return null;
    }
    // destroy self from the game view
	destroySelf(){
		// Remove all sub-actors
		for(var i=0;i<this.subActors.length;i++){
			_rooms[this.stageID].model.removeActor(this.subActors[i]);
        }
		_rooms[this.stageID].model.removeActor(this);
	}
    setPointsGiven(points){
		this.pointsGiven = points;
	}
	getPointsGiven(){
		return this.pointsGiven;
	}
}

class ActorBlock extends Actor {
    constructor(stage, position, shape){
        super(stage, position, "Block", shape);
        this.passThrough = false;
    }
}

class MovingActor extends Actor {
	constructor(stage, position, name, shape, speed){
		super(stage, position, name, shape);
		this.isMoving = false;
		this.peakedVelocity = new Pair(0, 0);
		this.acceleration = new Pair(0.2, 0.2);
		this.deceleration = new Pair(0.2, 0.2);
		this.maxVelocity = new Pair(speed, speed);
        this.speed = speed;
		this.isMovingX = false;
        this.isMovingY = false;
    }
	setAcceleration(vector){
		this.acceleration.x = vector.x;
		this.acceleration.y = vector.y;
	}
	setDeceleration(vector){                
		this.deceleration.x = vector.x;
                this.deceleration.y = vector.y;
        }
	setMaxVelocity(vector){
                this.maxVelocity.x = vector.x;
                this.maxVelocity.y = vector.y;
        }
	move(dx, dy){
		this.isMovingX = (dx != 0);
		this.isMovingY = (dy != 0);
		this.velocity.x += dx * this.acceleration.x;
		this.velocity.y += dy * this.acceleration.y;
		this.fixVelocity();
	}
	stopMovingX(){
		this.isMovingX = false;
		this.peakedVelocity.x = this.velocity.x;
	}
	stopMovingY(){
		this.isMovingY = false;
		this.peakedVelocity.y = this.velocity.y;
	}
	stopMoving(){
		this.stopMovingX();
		this.stopMovingY();
	}
	stopImmediately(){
		this.stopMoving();
		this.velocity.x = 0;
		this.velocity.y = 0;
	}
	slowDown(slowX, slowY){
		if (this.velocity.x != 0 || this.velocity.y != 0){
			// Slow down X
			if (slowX){
				if (this.peakedVelocity.x > 0){
					this.velocity.x -= this.deceleration.x;
					this.velocity.x = (this.velocity.x < 0)? 0 : this.velocity.x;
				}
				else if (this.peakedVelocity.x < 0) {
					this.velocity.x += this.deceleration.x;
					this.velocity.x = (this.velocity.x > 0)? 0 : this.velocity.x;
				}
			}
			// Slow down Y
			if (slowY){
				if (this.peakedVelocity.y > 0){
					this.velocity.y -= this.deceleration.y;
					this.velocity.y = (this.velocity.y < 0)? 0 : this.velocity.y;
				}
				else if (this.peakedVelocity.y < 0) {
					this.velocity.y += this.deceleration.y;
					this.velocity.y = (this.velocity.y > 0)? 0 : this.velocity.y;
				}
			}
			this.fixVelocity();
		}
	}
	step(){
		// slow down if not currently moving
		this.slowDown(!this.isMovingX, !this.isMovingY);
		var x = this.velocity.x;
		var y = this.velocity.y;

		// account for terrain
		var terrain = this.getCurrentTerrain();
		var scaleFactor = (terrain != null && this.affectedByTerrain)? terrain.speedMod : 1;
        x *= scaleFactor;
        y *= scaleFactor;
        var canMove = true;
        
        var startingPosition = this.getTruePosition();
        var collidingActors = _rooms[this.stageID].model.getCollidingActors(startingPosition.plus(new Pair(x, y)),this);
        for (var j = 0; j < collidingActors.length; j++){
            if (!collidingActors[j].canPassThrough(this)){
                canMove = false;
            }
        }
        // move if possible
        if (canMove){
            this.position.x += x;
            this.position.y += y;
        }

		/*if (x != 0 || y != 0){
			var canMove = true;
			var totalCollidedActors = [];
			var highestMovement = Math.max(Math.abs(x), Math.abs(y));
			var nextX = x / highestMovement;
			var nextY = y / highestMovement;
			for (var i = 0; i < highestMovement; i++){
				var startingPosition = this.getTruePosition();
				var collidingActors = _gameState.getCollidingActors(startingPosition.plus(new Pair(nextX, nextY)), this);
				for (var j = 0; j < collidingActors.length; j++){
					if (!totalCollidedActors.includes(collidingActors[j])){
						totalCollidedActors.push(collidingActors[j]);
					}
					if (!collidingActors[j].canPassThrough(this)){
						canMove = false;
					}
				}
				// move if possible
				if (canMove){
					this.position.x += nextX;
					this.position.y += nextY;
				}
				else{
					break;
				}
			}
		}*/
		super.step();
        this.stopMoving();
	}
}

class ActorHP extends MovingActor {
    constructor(stage, position, name, shape, speed, HP){
        super(stage, position, name, shape, speed);
        this.currentHP = HP;
        this.maxHP = HP;
    }
	getCurrentHP(){
        return this.currentHP;
    }
    getMaxHP(){
        return this.maxHP;
    }
	setHP(HP){
		var HPDifference = this.currentHP - HP;
		if (HPDifference > 0){
			this.takeDamage(HPDifference);
		}
		else {
			this.addHP(-HPDifference);
		}
	}
    addHP(HP){
		if (this.currentHP > 0){
            this.currentHP += Math.ceil(HP);
            this.currentHP = Math.min(this.maxHP, this.currentHP);
		}
    }
	addAllHP(){
		this.currentHP = this.maxHP;
	}
	boostHP(amount){
		this.maxHP += amount;
	}
    takeDamage(damage){
		if (this.currentHP > 0){
            this.currentHP -= Math.ceil(damage);
            this.currentHP = Math.max(0, this.currentHP);
            if (this.currentHP == 0){
                this.destroySelf();
            }
		}
    }
    destroySelf(){
        super.destroySelf();
        // Animation here?
    }
}

class ActorHPBlock extends ActorHP {
    constructor(stage, position, shape, HP){
        super(stage, position, "HP Block", shape, 0, HP);
        this.actorType = "HPBlock";
        this.passThrough = false;
    }
}

class ActorCharacter extends ActorHP {
	constructor(stage, position, name, shape, speed, HP){
		super(stage, position, name, shape, speed, HP);
		this.weapon = null;
		this.isFiring = false;
		this.shotPosition = null;
		this.team = "";
	}
	setTeam(team){
		this.team = team;
	}
    isTeammate(otherActor){
        return this.team == otherActor.team;
    }
    isEnemy(otherActor){
        return this.team != otherActor.team;
    }
	getAllyActors(){
		var actors = _rooms[this.stageID].model.getAllCharacters();
		var allies = [];
		for(var i=0;i<actors.length;i++){
			if (actors[i].team == this.team){
				allies.push(actors[i]);
			}
                }
		return allies;
	}
	getEnemyActors(){
		var actors = _rooms[this.stageID].model.getAllCharacters();
                var enemies = [];
                for(var i=0;i<actors.length;i++){
                        if (actors[i].team != this.team){
                                enemies.push(actors[i]);
                        }
                }
                return enemies;
	}
	setWeapon(weapon){
        this.weapon = weapon;
		this.addSubActor(weapon);
		this.weapon.setOwner(this);
    }
	addAmmoMag(){
		this.weapon.addAmmoMag();
	}
        addAmmo(ammo){
                this.weapon.addAmmo(ammo);
        }
        getAmmo(){
                if (this.weapon){
                        return this.weapon.ammo;
                }
                return 0;
        }
	canShootWeapon(){
        if (this.weapon){
			return true;
        }
        return false;
    }
    shootWeapon(toPosition){
		this.isFiring = true;
		this.shotPosition = toPosition;
    }
	stopFiring(){
		this.isFiring = false;
		this.shotPosition = null;
	}
	step(){
		super.step();
		// fire weapon if holding fire
		if (this.canShootWeapon() && this.isFiring){
            this.weapon.shoot(this.shotPosition, this);
		}
	}
}

class Player extends ActorCharacter {
    constructor(stage, position, playerID, shape, speed){
        super(stage, position, "Player: " + playerID, shape, speed, 100);
		this.passThrough = false;
        this.playerID = playerID;
        this.actorType = "Player";
		this.team = "1";
        this.affectedByTerrain = true;

		// Special properties
		this.score = 100;
        this.pointsGiven = 500;
		this.healthPacks = 3;
		this.backpackLimit = 5;
        this.buildingLimit = 5;
		this.backpackWeapons = [];
        this.blocks = [];

		// controller stuff
		this.aimLocation = null;
		this.interactID = -1;
        
        this.isBuilding = false;
		this.willInteract = false;
        
        this.willSwapWeapon = false;
		this.weaponSwapID = 0;
        
        this.queueBuild = false;
        this.buildingBlock = null;
        this.willSwapBuild = false;
        this.buildingID = 0;
    }
	toString(){
                return "~" + this.name + "~ : " + this.position.toString();
        }
	step(){
		// swapping weapon / build
        if (this.willSwapWeapon){
            this.swapWeapon(this.weaponSwapID);
        }
        else if (this.willSwapBlock){
            this.swapBuild(this.buildingID);
        }
        this.willSwapWeapon = false;
        this.willSwapBlock = false;

		// interacting
		if (this.willInteract){
			
		}
		this.willInteract = false;
        
        // building
        if (this.isBuilding && this.queueBuild){
            // Check if we can build here
            var cost = this.buildingBlock.getCost();
            if (this.score >= cost){
                var buildLocation = this.buildingBlock.getBuildPos();
                var collidingActors = _rooms[this.stageID].model.getCollidingActors(buildLocation, this.buildingBlock);
                var canPlace = true;
                // Check if the block can be placed
                for (var i = 0; i < collidingActors.length; i++){
                    if (!collidingActors[i].canPassThrough(this.buildingBlock)){
                        canPlace = false;
                    }
                }
                // Place block and consume score
                if (canPlace){
                    this.decreaseScore(cost);
                    var block = this.buildingBlock.spawnBlock();
                    _rooms[this.stageID].model.addActor(block);
                }
            }
        }
        this.queueBuild = false;
        
        this.runCollisionCheck();
		super.step();
	}
	draw(context){
		super.draw(context);
		// draw crosshairs
		if (this.weapon){
			if (this.weapon.crosshairs && this.aimLocation){
				//this.weapon.crosshairs.draw(context);
			}
		}
	}
	aimAt(position){
		this.aimLocation = position;
		if (this.weapon){
			if (this.weapon.crosshairs){
				//this.weapon.crosshairs.setPosition(position.x, position.y);
			}
		}
		this.rotateTo(position);
	}
    releaseTrigger(){
        this.stopFiring();
    }
    startBuilding(){
        this.isBuilding = true;
        this.releaseTrigger();
        this.removeSubActor(this.weapon);
        this.setBuild(this.blocks[this.buildingID]);
    }
    stopBuilding(){
        this.isBuilding = false;
        this.removeSubActor(this.buildingBlock);
        this.setWeapon(this.backpackWeapons[this.weaponSwapID]);
    }
    setBuild(buildingBlock){
        this.buildingBlock = buildingBlock;
        this.addSubActor(buildingBlock);
        this.buildingBlock.owner = this.actorID;
    }
    swapBuild(buildingID){
        if (buildingID < this.blocks.length){
            this.buildingID = buildingID;
            this.removeSubActor(this.buildingBlock);
            this.setBuild(this.blocks[this.buildingID]);
        }
    }
    canBuild(){
        if (this.buildingBlock){
            if (this.score >= this.buildingBlock.getCost()){
                return true;
            }
        }
        return false;
    }
    buildBlock(){
        this.queueBuild = true;
    }
	canAddWeapon(weapon){
		return this.backpackWeapons.length < this.backpackLimit;
	}
	getBackpackWeapon(weapon){
		for (var i = 0; i < this.backpackWeapons.length; i++){
			if (weapon.weaponID == this.backpackWeapons[i].weaponID){
				return this.backpackWeapons[i];
			}
		}
		return null;
	}
	addWeapon(weapon){
		var backpackWeapon = this.getBackpackWeapon(weapon);
		if (!backpackWeapon){
			if (!this.weapon && !this.isBuilding){
				this.setWeapon(weapon);
                this.weaponSwapID = 0;
			}
			this.backpackWeapons.push(weapon);
		}
		else{
			backpackWeapon.addAmmoMag();
		}
	}
    canAddBlock(block){
        return this.blocks.length < this.buildingLimit;
    }
    getBackpackBlock(block){
        for (var i = 0; i < this.blocks.length; i++){
			if (block.blockID == this.blocks[i].blockID){
				return this.blocks[i];
			}
		}
		return null;
    }
    addBlock(block){
		var backpackBlock = this.getBackpackBlock(block);
		if (!backpackBlock){
			if (!this.buildingBlock && this.isBuilding){
				this.setBuild(block);
                this.buildingID = 0;
			}
			this.blocks.push(block);
		}
		else{
			backpackBlock.levelUp();
		}
	}
	queueInteract(){
		this.willInteract = true;
	}
	queueWeaponSwap(swapID){
        if (swapID < this.backpackWeapons.length){
            this.willSwapWeapon = true;
            this.weaponSwapID = swapID;
        }
	}
    queueBlockSwap(swapID){
        if (swapID < this.blocks.length){
            this.willSwapBlock = true;
            this.buildingID = swapID;
        }
	}
	swapWeapon(backpackID){
        if (backpackID < this.backpackWeapons.length){
            this.weaponSwapID = backpackID;
            this.removeSubActor(this.weapon);
            this.setWeapon(this.backpackWeapons[this.weaponSwapID]);
        }
	}
	swapGroundWeapon(weapon){
		
	}
	addScore(score){
		this.score += Math.ceil(score);
	}
    decreaseScore(score){
        this.score -= Math.ceil(score);
        this.score = Math.max(this.score, 0);
    }
	getScore(){
		return this.score;
	}
	runCollisionCheck(){
        var collidingActors = _rooms[this.stageID].model.getCollidingActors(this.getTruePosition(), this);
		var transporter = null;
		var savedCollidedActors = [];
        for(var i=0;i<collidingActors.length;i++){
			var actor = collidingActors[i];

			// Item Pickups
			if (actor instanceof ItemPickup){
				actor.useByActor(this);
			}

			// Terrains
			if (actor instanceof TerrainActor){
				savedCollidedActors.push(actor);
			}

			// Transporter pods, only teleport the first time
			if (actor instanceof TransporterActor){
				if (!this.collidedActors.includes(actor)){
					transporter = actor;
				}
				savedCollidedActors.push(actor);
				if (actor.toTransporter){
					savedCollidedActors.push(actor.getToTransporter());
				}
			}
        }
		this.collidedActors = savedCollidedActors;

		// Transport this actor if possible
		if (transporter){
			transporter.transport(this);
		}
	}
	destroySelf(){
		super.destroySelf();
		_rooms[this.stageID].model.removePlayer(this.playerID);
	}
}

class Bullet extends Actor{
	constructor(stage, position, speed, weapon, bulletSpawn, shooter){
		super(stage, position, "Bullet", bulletSpawn.bulletShapes);
        this.velocity= new Pair(10, 10);
		this.hits = 1;
		this.hitActors = [];
		this.speed = speed;
		this.weapon = weapon;
		this.shooter = shooter;
		this.affectedByTerrain = false;
		this.timeLeft = -1;
    }
	setTimeLeft(time){
		this.timeLeft = time;
	}
	step(){
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.intPosition();
		this.runCollisionCheck();
		if (this.timeLeft > 0){
			this.timeLeft--;
		}
		if (this.timeLeft == 0){
			this.destroySelf();
		}
	}
	runCollisionCheck(){
		var collidingActors = _rooms[this.stageID].model.getCollidingActors(this.position, this);
		var nonPassThroughActors = [];

		for(var i=0;i<collidingActors.length;i++){
            // Check if the actor can be passed through
			// Shooter cannot be hit by the bullet
			// Actor is not count as hit if we already hit them
            if (!collidingActors[i].canPassThrough(this)
			&& collidingActors[i] != this.shooter
			&& !this.hitActors.includes(collidingActors[i])){
                               nonPassThroughActors.push(collidingActors[i]);
                        }
                }
		
		// If we hit some actors we can't pass through, run collision events for each hit actor
		if (nonPassThroughActors.length > 0){
			for(var i=0;i<nonPassThroughActors.length;i++){
				var otherActor = nonPassThroughActors[i];
				if (this.canImpact(otherActor)){
					this.impact(otherActor);
					this.hitActors.push(otherActor);
					if (this.hits > 0){
						this.hits--;
					}
				}
                	}
			// remove the bullet if all hits have been exhausted
			if (this.hits == 0){
				_rooms[this.stageID].model.removeActor(this);
			}
		}
	}
	// Returns whether this bullet can impact the given actor
	canImpact(otherActor){
		// Cannot impact other bullets
		if (otherActor instanceof Bullet){
			return false;
		}

		if (this.shooter){
			// Cannot impact the shooter or any of their sub actors
			if (this.shooter.isInFamilyTree(otherActor)){
				return false;
			}

			// Cannot impact teammates of shooter
			var allies = this.shooter.getAllyActors();
			if (allies.includes(otherActor)){
				return false;
			}
		}
		return true;
	}
	// Executes when this bullet impacts another actor
	impact(otherActor){
		if (otherActor instanceof ActorHP){
			otherActor.takeDamage(this.weapon.damage);
		}
	}
	headTo(position){
                this.velocity.x=(position.x-this.position.x);
                this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
		this.velocity.x *= this.speed;
		this.velocity.y *= this.speed;
        }
	toString(){
                return this.position.toString() + " " + this.velocity.toString();
        }
}

class BulletSpawn extends Actor {
	constructor(stage, position, speedMod, bulletAmount, offsetAngle, shapes, bulletShapes){
		super(stage, position, "BulletSpawn", shapes);
		this.bulletShapes = bulletShapes;
		this.speedMod = speedMod;
		this.bulletAmount = bulletAmount;
		this.rotationAngle = offsetAngle;
	}
}

class Weapon extends Actor {
        constructor(weaponID, stage, position, name, shape){
        super(stage, position, name, shape);
		this.weaponID = weaponID;
        this.name = name;
        this.passThrough = true;
		this.owner = -1; // the owner of the weapon
		
		this.crosshairs = new CrosshairActor(stage);

		// Weapon stats
		this.damage = 10; // the base damage of this weapon
		this.bulletSpread = 5; // bulletSpread is how much the bullet trajectories vary in degrees from their original target

		this.ammo = 100;
		this.ammoMag = 30; // how much ammo is added when picking up an ammo pack
		this.ammoPerShot = 1; // how much ammo is consumed per shot
		this.cooldown = 0.25; // cooldown is how many seconds to wait after shooting before you can shoot again
		this.maxRange = 3; // Range is how many seconds until fired bullets disappear, if set to -1, unlimited range
		this.bulletSpeed = 4; // the base bullet speed for this weapon

		// Bullet aesthetics
		this.bulletImage = "../images/bullet.png";
		this.bulletDimensions = new Pair(16, 16);

		this.bulletSpawns = []; // bullets are launched from these positions relative to the weapon
		this.subWeapons = []; // weapons attached to this weapon that also fire if the main one is fired

		this.lastShotTime = _gameTime - convertSecondsToGameTime(this.cooldown); // this value is updated to the time we last shot the weapon
        }
	getDamage(){
		return this.damage;
	}
	getBulletSpread(){
		return this.bulletSpread;
	}
	setOwner(actor){
		this.owner = actor.actorID;
		for (var i = 0; i < this.subWeapons.length; i++){
			this.subWeapons[i].setOwner(actor);
		}
	}
	setAmmo(ammo){
		this.ammo = ammo;
	}
	addAmmo(ammo){
		if (this.ammo >= 0){
			this.ammo += ammo;
		}
	}
	addAmmoMag(){
		if (this.ammo >= 0){
			this.ammo += this.ammoMag;
		}
		// Add to sub-weapons
                for(var i=0;i<this.subWeapons.length;i++){
                        this.subWeapons[i].addAmmoMag();
                }
	}
	consumeAmmo(){
		if (this.ammo >= 0){
			this.ammo -= this.ammoPerShot;
                	this.ammo = Math.max(0, this.ammo);
		}
	}
	hasEnoughToFire(){
		if (this.ammo >= 0){
			return this.ammo >= this.ammoPerShot;
		}
		return true;
	}
	addBulletSpawn(spawn){
		this.bulletSpawns.push(spawn);
		this.addSubActor(spawn);
	}
	addSubWeapon(weapon){
		this.subWeapons.push(weapon);
		this.addSubActor(weapon);
	}
        move (dx, dy, type, playerPosition){
                if (type == "key"){
                        this.position.x += dx*2;
                        this.position.y += dy*2;
                } else{
			if (dx < playerPosition.x-25){
				this.position.x = playerPosition.x-25;
			} else if (dx >= playerPosition.x-25 && dx <= playerPosition.x+25){
				this.position.x = dx;
			} else{
				this.position.x = playerPosition.x+25;
			}

			if (dy < playerPosition.y-25){
                                this.position.y = playerPosition.y-25;
                        } else if (dy >= playerPosition.y-25 && dy <= playerPosition.y+25){
                                this.position.y = dy;
                        } else{
                                this.position.y = playerPosition.y+25;
                        }
                }
                this.intPosition();
        }
	shoot(toPosition, shooter){
		// fire this weapon if it has the requisite bullets
		if (this.hasEnoughToFire()){
			// compare time to last shot time
			// If the time difference is sufficient, shoot bullet
			var currentTime = _gameTime;
			if (convertGameTimeToSeconds(_gameTime - this.lastShotTime) >= this.cooldown){
				
				// Spawn bullets at all spawn points
				for(var i=0;i<this.bulletSpawns.length;i++){
					var spawn = this.bulletSpawns[i];
					var truePosition = spawn.getTruePosition();
					// create bullets
					for (var j = 0; j < spawn.bulletAmount; j++){
                        var position = new Pair(truePosition.x, truePosition.y);
						var randomAngle = randomRange(-this.bulletSpread, this.bulletSpread);
						var bullet = new Bullet(_rooms[this.stageID].model, position, this.bulletSpeed * spawn.speedMod, this, spawn, shooter);
						bullet.setRotation(spawn.getTrueRotation() + randomAngle);
						_rooms[this.stageID].model.addActor(bullet);

						var toVector = toPosition.minus(position).rotateOnAngle(randomAngle);
						var newToPosition = position.plus(toVector);
						bullet.headTo(newToPosition);

						// if there's a range, set when the bullet disappears
						if (this.maxRange > 0){
							bullet.setTimeLeft(convertSecondsToGameTime(this.maxRange));
						}
					}
                }
				// consume ammo
				this.consumeAmmo();
				// record last shot time
				this.lastShotTime = currentTime;
			}
			else{
				// don't shoot
			}
		}
		
		// Shoot sub-weapons
		for(var i=0;i<this.subWeapons.length;i++){
			this.subWeapons[i].shoot(toPosition, shooter);
		}
	}
	spawnDrop(){
        var owner = _rooms[this.stageID].model.getActorByID(this.owner);
		if (owner){
			var weaponDrop = new WeaponPickup(stage, owner.position, this);
			_rooms[this.stageID].model.addActor(weaponDrop);
		}
	}
        toString(){
                return "~" + this.name + "~ : " + this.position.toString();
        }
}

// AI just follows for now
class EnemyActor extends ActorCharacter {
	constructor(stage, position, shape, speed, HP){
                super(stage, position, "Enemy", shape, speed, HP);
		this.enemyID = 0;
		this.team = "enemy";

		this.AIType = "follow"; // follows the target
        this.passThrough = false;
		this.waitSteps = 0;
		this.maxWaitSteps = 5;
		this.target = null;
		this.targetMinDistance = 150; // The closest that this actor will go towards its target
		this.fireDistance = 400; // The distance from the target before firing starts

		this.healthDropRate = 0.25;
		this.ammoDropRate = 0.25;
        }
	setTarget(target){
		this.target = target;
	}
	autoSetTarget(){
		// WIP:
		if (_rooms[this.stageID].model.player){
			this.setTarget(_rooms[this.stageID].model.player);
		}
	}
	unsetTarget(){
		this.target = null;
	}
	getMovementVector(vector){
		var xMove = vector.x;
		var yMove = vector.y;

		// Fix X Movement
               	if (xMove <= -0.5){
                	xMove = -1;
             	}
                else if (xMove >= 0.5){
               		xMove = 1;
               	}
             	else{
                	xMove = 0;
             	}

          	// Fix Y Movement
            	if (yMove <= -0.5){
               		yMove = -1;
             	}
             	else if (yMove >= 0.5){
              		yMove = 1;
              	}
             	else{
                	yMove = 0;
             	}
		return new Pair(xMove, yMove);
	}
	step(){
		// Update target values
		if (this.target){
			var distance = _rooms[this.stageID].model.getDistance(this, this.target);
			// shoot if possible
			if (distance <= this.fireDistance){
				if (this.canShootWeapon()){
					this.shootWeapon(this.target.getTruePosition());
				}
			}
			else{
				this.stopFiring();
			}

			// Rotate to the target
			this.rotateToActor(this.target);
		}

		// Update movement
		// move closer to target if it exists
		if (this.target){
			this.isMoving = true;
			var vector = new Pair(this.target.x - this.x, this.target.y - this.y);
			var movement = this.getMovementVector(vector);
			if (distance > this.targetMinDistance){
				this.move(movement.x, movement.y);
				if (movement.x == 0){
					this.stopMovingX();
				}
				if (movement.y == 0){
					this.stopMovingY();
				}
			}
		}

		// WIP: Update if shooting or not
		super.step();
	}
	destroySelf(){
		super.destroySelf();
		_rooms[this.stageID].model.KOEnemy(this);
	}
}

// BUILDING BLOCKS
class BuildingBlock extends Actor {
    constructor(stage, position, cost){
        super(stage, position, "Default Block", []);
        this.blockID = 1;
        this.startingCost = cost;
        this.cost = cost;
        this.level = 1;
        this.owner = -1;
        this.neverRotate = true;
    }
    levelUp(){
        this.level += 1;
    }
    getCost(){
        return this.cost * this.level;
    }
    spawnBlock(){
        
    }
}

class BuildingBlock_HP extends BuildingBlock {
    constructor(stage, width, height, cost){
        super(stage, new Pair(0, -width - height), cost);
        this.blockID = 2;
        // Create block shape
        var gStops = [];
		for (var i = 0; i < 2; i++){
			var red=randint(255), green=randint(255), blue=randint(255);
			var stop = new GradientStop(i, red, green, blue, 0.5);
			gStops.push(stop);
		}
        var style = new GradientStyle(false, true, gStops);
		style.outline = true;
        style.setOutlineColorRGBA(255, 255, 255, 0.5);
        var shape = new Rectangle(width, height, style);
        
        this.name = "Block";
        this.blockShape = shape;
        this.addShape(shape);
    }
    getBuildPos(){
        var owner = _rooms[this.stageID].model.getActorByID(this.owner);
        var rotatedVector = this.position.rotateOnAngle(owner.rotationAngle);
        var realPos = owner.getTruePosition().plus(rotatedVector);
        return realPos;
    }
    spawnBlock(creator){
        var style = this.blockShape.contextStyle.clone();
        for (var i = 0; i < style.gradientStops.length; i++){
            style.gradientStops[i].alpha = 1;
        }
        var copyShape = new Rectangle(this.blockShape.width, this.blockShape.height, style);
        var block = new ActorHPBlock(_rooms[this.stageID].model, this.getBuildPos(), copyShape, 40 + this.level * 10);
        block.setPointsGiven(0);
        return block;
    }
}

// ITEMS
class ItemPickup extends Actor {
	constructor(stage, position, shape){
		super(stage, position, "Item", shape);
        this.actorType = "ItemPickup";
	}
	step(){
		super.step();
	}
	useByActor(actor){
		console.log(this.name + " was used by " + actor.name);
		this.destroySelf();
	}
}

class WeaponPickup extends ItemPickup {
	constructor(stage, position, weapon){
		super(stage, new Pair(position.x, position.y), weapon.shapes);
		this.weaponDrop = weapon;
		this.weaponPosition = weapon.position;
		this.weaponDrop.setPosition(0, 0);
	}
	draw(context){
		this.weaponDrop.draw(context);
		super.draw(context);
	}
	useByActor(actor){
		console.log(actor.name + " picked up a " + this.name);
		if (actor instanceof Player){
			this.weaponDrop.setPosition(this.weaponPosition.x, this.weaponPosition.y);
			actor.addWeapon(this.weaponDrop);
		}
		this.destroySelf();
	}
}

class MoneyPickup extends ItemPickup {
	constructor(stage, position, shape, amount){
		super(stage, position, shape);
		this.name = "Money";
        this.amount = amount;
	}
	useByActor(actor){
		if (actor instanceof Player){
			actor.addScore(this.amount);
		}
		super.useByActor(actor);
	}
}

class AmmoPickup extends ItemPickup {
	constructor(stage, position, shape){
		super(stage, position, shape);
		this.name = "Ammo";
	}
	useByActor(actor){
		if (actor instanceof Player){
			actor.addAmmoMag();
		}
		super.useByActor(actor);
	}
}

class HealthPickup extends ItemPickup {
    constructor(stage, position, shape, amount, max){
        super(stage, position, shape);
        this.name = "Health Pack";
        this.amount = amount;
        this.max = max;
    }
    useByActor(actor){
            if (actor instanceof Player){
        if (this.max){
            actor.addAllHP();
        }
        else{
            actor.addHP(this.amount)
        }
            }
            super.useByActor(actor);
    }
}

class HealthBoost extends HealthPickup {
	constructor(stage, position, shape, amount, max, boost){
		super(stage, position, shape, amount, max);
		this.boost = boost;
	}
	useByActor(actor){
                if (actor instanceof Player){
			actor.boostHP(this.boost);
                }
                super.useByActor(actor);
        }
}

// STAGE
class StageActor extends Actor {
	constructor(
		stage, 
		position, 
		name, 
		shapes){
		super(stage, position, name, shapes);
        this.actorType = "Stage";
		this.passThrough = false;
	}
}

class TerrainActor extends Actor {
	constructor(stage, position, shapes, layer, speedMod){
		super(stage, position, "Terrain", shapes);
        this.actorType = "Terrain";
		this.layer = layer;
		this.passThrough = true;
		this.speedMod = speedMod;
	}
}

class TransporterActor extends Actor {
	constructor(stage, position){
		var shape1 = new Circle(25, new ColourCStyle(96, 96, 255, 1));
		var shape2 = new Circle(35, new StrokeCStyle(164, 164, 255, 2));
		shape2.ignoreCollisions = true;
		super(stage, position, "Transporter", [shape1, shape2]);
        this.actorType = "Transporter";
		this.toLocation = null;		// If this is set, this is the position the actor will be sent to
		this.toTransporter = -1;	// If this is set, this is the transporter that the actor will be sent to
	}
	setToLocation(position){
		this.toLocation = position;
	}
    getToTransporter(){
        return _rooms[this.stageID].model.getActorByID(this.toTransporter);
    }
	setToTransporter(actor){
		this.toTransporter = actor.actorID;
	}
	transport(actor){
        var toTransporter = this.getToTransporter();
		if (toTransporter){
			var position = toTransporter.getTruePosition();
			actor.setPosition(position.x, position.y);
		}
		else if (this.toLocation) {
			actor.setPosition(this.toLocation.x, this.toLocation.y);
		}
	}
}

// Effects
class CrosshairActor extends Actor {
	constructor(stage){
		var style = new ColourCStyle(0,0,0,1);
		var c1 = new Rectangle(4, 16, style);
		c1.setOffsetPosition(new Pair(0,12));
		var c2 = new Rectangle(4, 16, style);
                c2.setOffsetPosition(new Pair(0,-12));
		var c3 = new Rectangle(16, 4, style);
                c3.setOffsetPosition(new Pair(12,0));
		var c4 = new Rectangle(16, 4, style);
                c4.setOffsetPosition(new Pair(-12,0));
		super(stage, new Pair(0,0), "Crosshairs", [c1, c2, c3, c4]);
		this.contextStyle = style;
		this.passThrough = true;
	}
}

///////////////////////////////////////////////////////////////////////////////
// ASSIGNMENT 2 CODE FINISHED
///////////////////////////////////////////////////////////////////////////////

// Game Models Simplified

// MODEL COPY

class GameModelSimple {
    constructor(model){
        this.width = model.width;
        this.height = model.height;
        
        this.actors = [];
        for (var i = 0; i < model.actors.length; i++){
            this.actors.push(new ActorSimple(model.actors[i]));
        }
        
        this.terrainActors = [];
        for (var i = 0; i < model.terrainActors.length; i++){
            this.terrainActors.push(new ActorSimple(model.terrainActors[i]));
        }
        
        this.players = [];
        for (var i = 0; i < model.players.length; i++){
            this.players.push(new ActorSimple(model.players[i]));
        }
        
        this.killedPlayers = model.killedPlayers;
    }
}

// MODEL COPY

class ActorSimple {
    constructor(actor){
        this.actorType = actor.actorType;
		this.enabled = actor.enabled;
		this.width = actor.getWidth();
		this.height = actor.getHeight();
        this.x = actor.x;
        this.y = actor.y;
        this.position= actor.position;
		this.rotationAngle = actor.rotationAngle;
        this.neverRotate = actor.neverRotate;
		this.name = actor.name;
        this.backpackWeapons = [];
        if (actor.backpackWeapons != null){
            for (var i = 0; i < actor.backpackWeapons.length; i++){
                this.backpackWeapons.push(new ActorSimple(actor.backpackWeapons[i]));
            } 
        }
        
        this.blocks = [];
        if (actor.blocks != null){
            for (var i = 0; i < actor.blocks.length; i++){
                this.blocks.push(new ActorSimple(actor.blocks[i]));
            } 
        }
        
        this.team = actor.team;
        this.pointsGiven = actor.pointsGiven;
        this.currentHP = actor.currentHP;
        this.maxHP = actor.maxHP;
        this.weapon = (actor.weapon == null)? null : new ActorSimple(actor.weapon);
        this.buildingBlock = (actor.buildingBlock == null)? null : new ActorSimple(actor.buildingBlock);
        this.playerID = actor.playerID;
        this.score = actor.score;
        this.isBuilding = actor.isBuilding;
        this.weaponSwapID = actor.weaponSwapID;
        this.buildingID = actor.buildingID;
        
        this.bulletShapes = actor.bulletShapes;
        
        this.owner = actor.owner;
        this.weaponID = actor.weaponID;
        this.crosshairs = (actor.crosshairs == null)? null : new ActorSimple(actor.crosshairs);
        this.ammo = actor.ammo;
        this.bulletSpawns = [];
        if (actor.bulletSpawns != null){
            for (var i = 0; i < actor.bulletSpawns.length; i++){
                this.bulletSpawns.push(new ActorSimple(actor.bulletSpawns[i]));
            } 
        }
        this.subWeapons = [];
        if (actor.subWeapons != null){
            for (var i = 0; i < actor.subWeapons.length; i++){
                this.subWeapons.push(new ActorSimple(actor.subWeapons[i]));
            } 
        }
        
        this.blockID = actor.blockID;
        this.cost = actor.cost;
        this.blockShape = actor.blockShape;
        
        this.layer = actor.layer;

		this.parentActor = actor.parentActor;
		this.shapes = actor.shapes;
		this.subActors = [];
        for (var i = 0; i < actor.subActors.length; i++){
            this.subActors.push(new ActorSimple(actor.subActors[i]));
        }
    }
}

// START GAME

// Setup the games here and start them
_rooms[0].model = new GameModel(0);
_rooms[1].model = new GameModel(1);
_rooms[2].model = new GameModel(2);
_interval = setInterval(
    function(){ 
        for (var i = 0; i < 3; i++){
            _rooms[i].model.step();
            wss.broadcastRoom(_rooms[i]);
        }
        _gameTime += 1;
    }, 
    _gameIntervalTime);
