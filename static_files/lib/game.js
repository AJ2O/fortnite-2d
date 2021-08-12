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
	constructor(){
		//this.canvas = canvas;

		// Game logic
		//this.wave = 1;
		//this.waveTimer = 15; // Seconds to wait between each wave
        this.gameScore = 0;

		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.terrainActors = []; // all terrain actors
		this.player=null; // a special actor, the player
        this.players = []; // all player actors on the stage
		//this.enemies=[]; // all enemy actors on the stage

		/*this.enemySpawnQueue = [];
		this.enemyBatches = [];
		this.currentEnemyBatch = null;*/

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
		//this.enemySpawnLocations = [];

		// set stage / wave specifics based on stage name
		this.setStage("Basic");
		//this.waveCountdownEnd = 0;
		//this.batchCountdownEnd = 0;
		//this.batchStarted = false;
		//this.waveStarted = false;
		//this.startWave();

		//var startingPos = this.playerSpawnLocation;
		//var playerActor = this.createPlayer();
		//this.spawnPlayer(playerActor);

		// Add the players default weapon
		//var weaponStyle = new ColourCStyle(0,0,0,1);
        
		//this.player.addWeapon(this.createWeapon_Rifle(this.player.shapes[0].contextStyle.clone()));
        //this.player.addWeapon(this.createWeapon_SMG(this.player.shapes[0].contextStyle.clone()));
        //this.player.addWeapon(this.createWeapon_Sniper(this.player.shapes[0].contextStyle.clone()));
        //this.player.addWeapon(this.createWeapon_Shotgun(this.player.shapes[0].contextStyle.clone()));
        
        
        /*var bb2 = new BuildingBlock_HP(this, 64, 16, 150);
        bb2.blockID = 3;
        this.player.addBlock(bb2);
        var bb3 = new BuildingBlock_HP(this, 16, 64, 150);
        bb3.blockID = 4;
		this.player.addBlock(bb3);
        var bb4 = new BuildingBlock_HP(this, 64, 64, 300);
        bb4.blockID = 5;
		this.player.addBlock(bb4);
        var bb5 = new BuildingBlock_HP(this, 80, 32, 500);
        bb5.blockID = 6;
		this.player.addBlock(bb5);
        
		// add some test pickups
		this.addAmmoPickup(new Pair(startingPos.x, startingPos.y + 300));
		this.addAmmoPickup(new Pair(startingPos.x, startingPos.y - 300));
		this.addHealthPickup(new Pair(startingPos.x + 300, startingPos.y), 50, false);
		this.addHealthPickup(new Pair(startingPos.x + 300, startingPos.y + 300), 50, true);

		// add some test breakable blocks
		this.addHPBlock(new Pair(startingPos.x - 200, startingPos.y), 16, 64, 124);
		this.addHPBlock(new Pair(startingPos.x, startingPos.y - 500), 128, 16, 124);*/

	}

	// Player
	createPlayer(playerID){
		var style = new ColourCStyle(255,255,255,1);
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
	addPlayer(player, playerID){
		this.addActor(player);
        this.players.push(player);
		//this.player=player;
	}
	removePlayer(playerID){
        //this.gameScore = this.player.score;
        var playerActor = this.getPlayerActor(playerID);
        if (playerActor != null){
            this.removeActor(playerActor);
        }
		//this.removeActor(this.getPlayer);
		//this.player=null;
        //endGame();
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
                        stage.player.buildBlock();
                    }
                    //playerBuild(mouseEvent);
                    controlInput["shoot"] = false;
                }
                else{
                    // firing player weapon
                    if (controlInput["shoot"]){
                        if (aimLocation && player.canShootWeapon()){
                            player.shootWeapon(new Pair(aimLocation.x, aimLocation.y));
                        }
                    }
                }
            }

            // release fire
            if (controlInput["release"]){
                player.releaseTrigger();
                controlInput["release"] = false;
            }

            // interact
            if (controlInput["interact"]){
                player.queueInteract();
            }
            controlInput["interact"] = false;

            if (controlInput["building"]){
                if (player.isBuilding){
                    player.stopBuilding();
                }
                else {
                    player.startBuilding();
                }
            }
            controlInput["building"] = false;

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
            controlInput["swapID"] = 0;
            controlInput["willSwap"] = false;
        }
        return controlInput;
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

		// Check if actor was targeted, and unset target
		/*for(var i=0;i<this.actors.length;i++){
			var currentActor = this.actors[i];
			if (currentActor instanceof EnemyActor){
				if (currentActor.target == actor){
					currentActor.unsetTarget();

					// Auto-set the target to potentially get a new target
					currentActor.autoSetTarget();
				}
			}
		}
        */
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
		weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
			new Pair(6, -3), 1, 1, -ang, new NullShape(), [bulletShape]
		));
        weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
			new Pair(2, -4), 1, 1, -ang, new NullShape(), [bulletShape]
		));
        weapon.addBulletSpawn(new BulletSpawn(
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
		weapon.addBulletSpawn(new BulletSpawn(
			new Pair(0, -36), 1, 1, 0, new NullShape(), [bulletShape]
		));
		return weapon;
	}

	/*createWeapon_EnemyBasic(actor, style){
		var handleStyle = new StrokeCStyle(0,0,0,1,4);
                var arc = new Arc(_baseHArcR, 5 * Math.PI / 4, 7 * Math.PI / 4, handleStyle);
                arc.setOffsetPosition(new Pair(0, -_baseGunY + _baseHArcY));
                var gun = new Rectangle(8, 16, new ColourCStyle(0,0,0,1));

                var weapon = this.createWeapon(
			"gun",
                        [gun, arc],
                        new Pair(0, -actor.getHeight()),
                        "Enemy Gun Basic",
                        10, 8, -1, 30, 1, 4, 3, 2
                );
		var bulletShape = this.createBulletShape(6, 9, new ColourCStyle(0,0,0,1));
		weapon.addBulletSpawn(new BulletSpawn(
                        new Pair(0, 0), 1, 1, 0, new NullShape(), [bulletShape]
                ));
                return weapon;
        }
    */
	// ITEMS
	createItemRing(){
		var shape = new Circle(24, new StrokeCStyle(255,255,255,1,4));
		return shape;
	}

	createAmmoPack(){
		var stop1 = new GradientStop(0, 255, 255, 255, 1);
		var stop2 = new GradientStop(1, 232, 196, 0, 1);
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
		//s1 = new Rectangle(8,20,style);
		//s2 = new Rectangle(8,20,style);
		//s2.setOffsetPosition(new Pair(-12, 0));
		//s3 = new Rectangle(8,20,style);
		//s3.setOffsetPosition(new Pair(12, 0));

		var actor = new AmmoPickup(this, new Pair(0,0), [s1, s2, s3, ring]);
		return actor;		
	}
	
	createHealthPack(amount, max){
        var stop1 = new GradientStop(0, 255, 255, 255, 1);
        var stop2 = new GradientStop(1, 128, 252, 128, 1);
        var style = new GradientStyle(true, true, [stop1, stop2]);
        style.horizontalGrd = false;
        style.setOutline("black");
        style.outlineWidth = 1;
        var s1 = new Circle(8, style);
		s1.setOffsetPosition(new Pair(0, -8));
        var s2 = new Circle(8, style);
        s2.setOffsetPosition(new Pair(8, 8));
        var s3 = new Circle(8, style);
        s3.setOffsetPosition(new Pair(-8, 8));
		var ring = this.createItemRing();
        var actor = new HealthPickup(this, new Pair(0,0), [s1, s2, s3, ring], amount, max);
        return actor;
        }
    
    createRandomWeapon(style){
        var rand = Math.random();
        if (rand < 0.05){
            return this.createWeapon_Sniper(style);
        }
        else if (rand < 0.12){
            return this.createWeapon_DualSMG(style);
        }
        else if (rand < 0.19){
            return this.createWeapon_DualPistol(style);
        }
        else if (rand < 0.30){
            return this.createWeapon_SMG(style);
        }
        else if (rand < 0.50){
            return this.createWeapon_Rifle(style);
        }
        else if (rand < 0.65){
            return this.createWeapon_Shotgun(style);
        }
        return this.createWeapon_Gun(style);
    }
    
    createWeaponDrop(style){
        return this.createRandomWeapon(style);
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
		/*var enemies = [];
		if (this.currentEnemyBatch){
			return this.currentEnemyBatch.enemies;
		}
                return enemies;*/
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
		/*/ Check if the wave is complete
		if (this.isWaveComplete()){
			this.wave++;
			this.startWave();
		}
		else if (!this.waveStarted && this.getWaveTimer() < 0){
			if (this.currentEnemyBatch != null){
				this.waveStarted = true;
			}
		}

		// Check if the batch is complete
		if (this.waveStarted && !this.batchStarted && this.getBatchTimer() < 0){
			if (this.currentEnemyBatch != null){
                                this.spawnEnemyBatch(this.currentEnemyBatch);
                                this.batchStarted = true;
                        }
		}

		// Attempt to spawn enemies in the queue if possible
		var enemyQueue = this.enemySpawnQueue.slice();
		if (enemyQueue.length > 0){
			if (this.currentEnemyBatch.spawnTime <= 0)
			{
				var j = 0;
				for (var i = 0; i < enemyQueue.length; i++){
					var enemy = enemyQueue[i];
					var spawnSuccess = this.spawnEnemyAtRandom(enemy);
					// if spawn is successful, set its target and remove it from the queue
					if (spawnSuccess){
						enemy.autoSetTarget();
						this.enemySpawnQueue.splice(i, 1);
						this.currentEnemyBatch.resetSpawnTime();
						break;
					}
					j++;
				}
			}
			else{
				this.currentEnemyBatch.spawnTime--;
			}
		}
        */
		// Run actor steps only if enabled
		for(var i=0;i<this.actors.length;i++){
			if (this.actors[i].enabled){
				this.actors[i].step();
			}
		}
	}

	/*draw(){
		this.centerCameraOnPlayer();
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		//this.centerCameraOnPlayer();
		
		// draw terrain first
		for(var i=0;i<this.terrainActors.length;i++){
                        if (this.terrainActors[i].enabled){
                                this.terrainActors[i].draw(context);
            }
        }	
	
		// draw actors	
		for(var i=0;i<this.actors.length;i++){
			if (this.actors[i].enabled){
				this.actors[i].draw(context);
			}
		}
	}*/

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
        for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].actorID == actorID){
				return this.actors[i];
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

	/*/ WAVES
	getWaveTimer(){
		var time = this.waveCountdownEnd - _gameTime;
		return convertGameTimeToSeconds(time);
	}
	getBatchTimer(){
		var time = this.batchCountdownEnd - _gameTime;
                return convertGameTimeToSeconds(time);
	}
	KOEnemy(enemyActor){
		// add score to the player
		if (this.player){
			this.player.addScore(enemyActor.getPointsGiven());
		}

		// Remove enemy actor from the batch
		if (this.currentEnemyBatch){
			this.currentEnemyBatch.removeEnemy(enemyActor);
		}

		// Drop items upon KO
		if (Math.random() < enemyActor.healthDropRate){
			var maxHP = (Math.random() < 0.1);
			this.addHealthPickup(
				new Pair(enemyActor.position.x + randint(25), enemyActor.position.y + randint(25)),
				20 + this.wave * 5, maxHP
			);
		}
                if (Math.random() < enemyActor.ammoDropRate){
                        this.addAmmoPickup(
                                new Pair(enemyActor.position.x + randint(25), enemyActor.position.y + randint(25)));
                }

		// Advance batches if all enemies are defeated
		if (this.currentEnemyBatch.isDefeated()){
			// Move on to the next batch if there is one
			if (this.enemyBatches.length > 0){
				var batch = this.enemyBatches[0];
				this.currentEnemyBatch = batch;
				this.enemyBatches = this.enemyBatches.slice(1);
				this.batchCountdownEnd = _gameTime + convertSecondsToGameTime(2);
			}
			// No more batches
			else{
				this.currentEnemyBatch = null;
			}
			this.batchStarted = false;
		}
	}
	spawnEnemyBatch(batch){
		for (var i = 0; i < batch.enemies.length; i++){
			var enemy = batch.enemies[i];
			this.enemySpawnQueue.push(enemy);
		}
	}
	// Spawns the given enemy at a given position
	spawnEnemy(enemy, position){
		enemy.setPosition(position.x, position.y);
		enemy.enabled = true;
		this.addActor(enemy);
	}
	// Tries to spawn the given enemy at a random spawn point, and returns true if it was possible
	spawnEnemyAtRandom(enemy){
		var spawn = null;
		// Shuffle the spawn points
		var shuffledSpawns = shuffle(this.enemySpawnLocations.slice());
		for (var i = 0; i < shuffledSpawns.length; i++){
			var canUseSpawn = true;
			spawn = shuffledSpawns[i];
			var collidingActors = this.getCollidingActors(spawn, enemy);
			for(var j=0;j<collidingActors.length;j++){
				if (!collidingActors[j].canPassThrough(enemy)){
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

		// Spawn enemy
		if (spawn){
			console.log("Enemy spawned at " + spawn);
			this.spawnEnemy(enemy, spawn);
			return true;
		}
		return false;
	}
	createEnemyBatch(enemyCount){
		var enemyBatch = new EnemyBatch();
        var style = this.getBasicEnemyStyle();
		for (var i = 0; i < enemyCount; i++){
            var enemy = this.createBasicEnemy();
            var weapon = this.createWeapon_Gun(style)
            var rand = Math.random();
            
            if (this.wave > 3){
                if (rand < 0.1){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            if (this.wave > 5){
                if (rand < 0.1){
                    weapon = this.createWeapon_SMG(style);
                }
                else if (rand < 0.2){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            if (this.wave > 7){
                if (rand < 0.1){
                    weapon = this.createWeapon_Rifle(style);
                }
                else if (rand < 0.2){
                    weapon = this.createWeapon_SMG(style);
                }
                else if (rand < 0.3){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            if (this.wave > 10){
                if (rand < 0.05){
                    weapon = this.createWeapon_DualSMG(style);
                }
                else if (rand < 0.15){
                    weapon = this.createWeapon_SMG(style);
                }
                else if (rand < 0.35){
                    weapon = this.createWeapon_Rifle(style);
                }
                else if (rand < 0.5){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            if (this.wave > 15){
                if (rand < 0.05){
                    weapon = this.createWeapon_Sniper(style);
                }
                else if (rand < 0.1){
                    weapon = this.createWeapon_DualSMG(style);
                }
                else if (rand < 0.2){
                    weapon = this.createWeapon_SMG(style);
                }
                else if (rand < 0.4){
                    weapon = this.createWeapon_Rifle(style);
                }
                else if (rand < 0.6){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            if (this.wave > 20){
                if (rand < 0.08){
                    weapon = this.createWeapon_Sniper(style);
                }
                else if (rand < 0.18){
                    weapon = this.createWeapon_DualSMG(style);
                }
                else if (rand < 0.33){
                    weapon = this.createWeapon_SMG(style);
                }
                else if (rand < 0.6){
                    weapon = this.createWeapon_Rifle(style);
                }
                else if (rand < 0.8){
                    weapon = this.createWeapon_Shotgun(style);
                }
            }
            
            // infinite ammo for enemies
            weapon.ammo = -1;
            
            enemy.setWeapon(weapon);
			enemy.enabled = false;
			enemyBatch.addEnemy(enemy);
		}
		return enemyBatch;
	}
	startWave(){
		// As waves go up, enemies become tougher and smarter, but rewards increase
		// Minibosses every other 5th round
		// Bosses every 10th round
		var enemyBatches = [];
		var waveTimer = this.waveTimer;
        var maxEnemies = 15;
        
		// Create enemy wave
        var enemyCount = 3;
        enemyCount += Math.round(this.wave / 3);
        enemyCount = Math.min(enemyCount, maxEnemies);
        
        var batchCount = 2;
        batchCount += this.wave % 2;
		for (var i = 0; i < batchCount; i++){
			var newBatch = this.createEnemyBatch(enemyCount);
			enemyBatches.push(newBatch);
		}
		
		// Spawn Batches
		if (enemyBatches.length > 0){
			var batch = enemyBatches[0];
			this.currentEnemyBatch = batch;
			this.enemyBatches = enemyBatches.slice(1);
            this.waveCountdownEnd = _gameTime + convertSecondsToGameTime(waveTimer);
			this.waveStarted = false;
		}
		// If no more batches, no more waves => game over
		else{
		
		}
		
	}
	isWaveComplete(){
		return this.enemyBatches.length == 0
			&& this.currentEnemyBatch == null
			&& this.waveStarted;
	}

	// ENEMIES
	createEnemy(
		enemyID,
		AIType,
		HP,
		speed,
		maxWaitSteps,
		minDistance,
		fireDistance,
		shapes
	){
		var enemy = new EnemyActor(this, new Pair(0, 0), shapes, speed, HP);
		enemy.maxWaitSteps = maxWaitSteps;
		enemy.minDistance = minDistance;
		enemy.fireDistance = fireDistance;
		return enemy;
	}
	getBasicEnemyStyle(){
		var style = new ColourCStyle(255, 96, 96, 1);
		style.setOutline("black");
		return style;
	}

	createBasicContactEnemy(){
		var maxWaitSteps = Math.max(0, Math.floor(5 - this.wave / 2));
		var style = this.getBasicEnemyStyle();
		var shape = new Circle(12, style);
		var enemy = this.createEnemy("contact1", "follow", 20 + 10 * this.wave / 3, (_baseSpeed * 0.35) + (this.wave / 12), maxWaitSteps, 0, 0, [shape]);
		enemy.setPointsGiven(20 + this.wave * 10);
		enemy.autoSetTarget();
		return enemy;
	}
	createBasicEnemy(){
		var maxWaitSteps = Math.max(0, Math.floor(5 - this.wave / 2));
		var style = this.getBasicEnemyStyle();
        var shape = new Circle(12, style);
        var enemy = this.createEnemy("gun1", "follow", 20 + 10 * this.wave / 3, (_baseSpeed * 0.2) + (this.wave / 12), maxWaitSteps, 100, 400 + this.wave * 20, [shape]);
        enemy.setPointsGiven(40 + this.wave * 10);
		enemy.autoSetTarget();
		return enemy;
    }
    */
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

			var l = this.width - 800;
			var h = this.height - 800;
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

			this.playerSpawnLocation = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
                	/*this.enemySpawnLocations = [
				new Pair(this.playerSpawnLocation.x + 600, this.playerSpawnLocation.y + 600),
				new Pair(this.playerSpawnLocation.x + 600, this.playerSpawnLocation.y - 600),
				new Pair(this.playerSpawnLocation.x - 600, this.playerSpawnLocation.y + 600),
				new Pair(this.playerSpawnLocation.x - 600, this.playerSpawnLocation.y - 600),
			];*/

			// Terrain
			var baseTerrain = this.createTerrain(
				new Pair(this.width/2, this.height/2),
                                this.width,
                                this.height,
                                1,
                                1,
                                new ColourCStyle(64,128,64,1));
			this.addTerrainActor(baseTerrain);
			var fastTerrain = this.createTerrain(
				new Pair(this.playerSpawnLocation.x + 400, this.playerSpawnLocation.y + 400), 
				200, 
				100,
				2,
				2, 
				new ColourCStyle(96, 164, 96, 1));
			this.addTerrainActor(fastTerrain);
			var slowTerrain = this.createTerrain(
                                new Pair(this.playerSpawnLocation.x - 400, this.playerSpawnLocation.y - 400),
                                200,
                                100,
                                2,
                                2,
                                new ColourCStyle(48, 96, 48, 1));
            this.addTerrainActor(slowTerrain);

			// Transporters
			var t1 = this.createTeleporter(new Pair(this.playerSpawnLocation.x + 600, this.playerSpawnLocation.y), null);
			var t2 = this.createTeleporter(new Pair(this.playerSpawnLocation.x - 600, this.playerSpawnLocation.y), null);
			var t3 = this.createTeleporter(new Pair(this.playerSpawnLocation.x, this.playerSpawnLocation.y - 600), new Pair(this.playerSpawnLocation.x, this.playerSpawnLocation.y + 600));
			t1.setToTransporter(t2);
			t2.setToTransporter(t1);

			this.addActor(t1);
			this.addActor(t2);
			this.addActor(t3);

			//this.bossSpawnLocations = [];
		}
	}


} // End Class GameModel

/*class EnemyBatch {
	constructor(){
		this.enemies = [];
		this.spawnTime = 0;
		this.spawnInterval = 3; // seconds b/t each enemy spawns
	}
	addEnemy(actor){
		this.enemies.push(actor);
	}
	removeEnemy(actor){
		var index=this.enemies.indexOf(actor);
                if(index!=-1){
                        this.enemies.splice(index,1);
                }
	}
	isDefeated(){
		return this.enemies.length == 0;
	}
	resetSpawnTime(){
		this.spawnTime = convertSecondsToGameTime(this.spawnInterval);
	}
}
*/
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
	getColorFromString(){
		return "";
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