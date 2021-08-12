class GameView {
	constructor(canvas){
        // The gameState and player info that we are tracking
        this.gameState = null;
        this.playerID = "";
        
		// the dimensions of the canvas
        this.canvas = canvas;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        // the camera offset
		this.positionOffset = new Pair(0, 0);
        
        // ui values
		this.HUDPosition = new Pair(24, 24);
		this.minimapDimensions = new Pair(150, 150);
        this.inventoryPos = new Pair(24 + 80 + 16, this.canvasHeight - 24);
		this.defaultFontStyle = "16px sans-serif";
		this.bigFontStyle = "48px sans-serif";
        
        // player values
        this.playerActor = null;
        this.playerTeam = "";
		this.playerMaxHP = 1;
		this.playerHP = 0;
		this.playerAmmo = 0;
		this.playerScore = 0;
        
        // gamestate values
        this.actors = [];
	}
    
    // UPDATING GAME STATE
    updateToState(gameState){
        this.gameState = gameState;
		this.width = gameState.width;
		this.height = gameState.height;
	}
    
    // UPDATING PLAYER
    updatePlayer(playerID){
        this.playerID = playerID;
        
        this.playerActor = this.getPlayer(this.playerID);
        if (this.playerActor){
            this.playerTeam = this.playerActor.team;
            this.playerHP = this.getActorCurrentHP(this.playerActor);
			this.playerMaxHP = this.getActorMaxHP(this.playerActor);
            this.playerScore = this.getActorScore(this.playerActor);
            this.playerAmmo = this.getActorAmmo(this.playerActor);
        }
    }
    
    // GAME STATE FUNCTIONS
    // getPlayer
    getPlayer(playerID){
        for(var i=0;i<this.gameState.players.length;i++){
			if(this.gameState.players[i].playerID == playerID){
				return this.gameState.players[i];
			}
		}
        return null;
    }
    getActorCurrentHP(actor){
        return actor.currentHP;
    }
    getActorMaxHP(actor){
        return actor.maxHP;
    }
    getActorScore(actor){
        return actor.score;
    }
    getActorAmmo(actor){
        if (actor.weapon){
            return actor.weapon.ammo;
        }
        return 0;
    }

    getAllActors(){
		var actors = [];
		for(var i=0;i<this.gameState.actors.length;i++){
			actors.push(this.gameState.actors[i]);
        }
		for (var i=0;i<this.gameState.terrainActors.length;i++){
			actors.push(this.gameState.terrainActors[i]);
		}
		return actors;
	}
    getAllItems(){
		var items = [];
		for(var i=0;i<this.gameState.actors.length;i++){
            if (this.gameState.actors[i].actorType == "ItemPickup"){
                items.push(this.gameState.actors[i]);
			}
        }
		return items;
	}
	getAllBlocks(){
		var blocks = [];
		for(var i=0;i<this.gameState.actors.length;i++){
            if (this.gameState.actors[i].actorType == "HPBlock"){
                blocks.push(this.gameState.actors[i]);
            }
        }
        return blocks;
	}
    getAllTerrain(){
        return this.gameState.terrainActors;
    }
    getAllStageActors(){
        var stageActors = [];
        for(var i=0;i<this.gameState.actors.length;i++){
            if (this.gameState.actors[i].actorType == "Stage"){
                stageActors.push(this.gameState.actors[i]);
            }
        }
        return stageActors;
    }
    getAllTransporters(){
        var transporters = [];
		for(var i=0;i<this.gameState.actors.length;i++){
            if (this.gameState.actors[i].actorType == "Transporter"){
                transporters.push(this.gameState.actors[i]);
            }
        }
        return transporters;
    }

	// CAMERA CONTROL
	getFocusedCameraCoords(position){
		var x = -(position.x - this.canvasWidth/2);
		var y = -(position.y - this.canvasHeight/2);
		return new Pair(x, y);
	}
	centerCameraOnActor(actor){
		if (actor){
			var context = this.canvas.getContext('2d');
			context.restore();
			context.save();
			var newPosition = this.getFocusedCameraCoords(actor.position);
			this.positionOffset = newPosition;
			context.translate(newPosition.x, newPosition.y);
		}
	}
	centerCameraOnPlayer(){
		if (this.playerActor){
			this.centerCameraOnActor(this.playerActor);
		}
		else{
			var context = this.canvas.getContext('2d');
            context.restore();
            context.save();
			context.translate(this.positionOffset.x, this.positionOffset.y);
		}
	}
    
    // UI ELEMENTS
    
    // Draw HP for an actor
    drawHPBar(context, actor, colour){
		var currentHP = this.getActorCurrentHP(actor);
        var maxHP = this.getActorMaxHP(actor);
        var HPPercent = currentHP / maxHP;

		context.fillStyle = 'rgba(64,64,64,0.75)';
        context.fillRect(actor.x + this.positionOffset.x - 35, (actor.y + this.positionOffset.y + actor.height/2) + 8, 70, 6);
        context.fillStyle = colour;
        context.fillRect(actor.x + this.positionOffset.x - 35, (actor.y + this.positionOffset.y + actor.height/2) + 8, 70 * HPPercent, 6);
		context.strokeStyle = 'rgba(0,0,0,0.75)';
		context.lineWidth = 2;
		context.strokeRect(actor.x + this.positionOffset.x - 35, (actor.y + this.positionOffset.y + actor.height/2) + 8, 70, 6);
        
        // draw the player's name
        if (actor.actorType == "Player"){
            context.textAlign = "center";
            context.font = this.defaultFontStyle;
            
            context.fillStyle = 'rgba(255,255,255,0.75)';
            //context.strokeStyle = 'rgba(0,0,0,0.75)';
            context.fillText(actor.playerID, actor.x + this.positionOffset.x, (actor.y + this.positionOffset.y - actor.height/2) - 12);
        }
	}
    
    // Draw HP for all actors
    drawHPBarsAll(context){
        context.restore();
        context.save();
        
        var actors = this.getAllActors();
        for (var i = 0; i < actors.length; i++){
            var actor = actors[i];
            if (actor.enabled){
                // HP Block
                if (actor.actorType == "HPBlock"){
                    this.drawHPBar(context, actor, 'rgba(212,212,128,0.75)');
                }
                else if (actor.actorType == "Player"){
                    // ally
                    if (actor.team == this.playerTeam){
                        this.drawHPBar(context, actor, 'rgba(128,255,128,0.75)');
                    }
                    // enemy
                    else{
                        this.drawHPBar(context, actor, 'rgba(255,128,128,0.75)');
                    }
                }
            } 
        }
    }
    
    // Minimap position conversion
    convertToMinimapPos(position){
		return new Pair(
			this.minimapDimensions.x * (position.x / this.gameState.width),
			this.minimapDimensions.y * (position.y / this.gameState.height)
		)
	}
    
    // Draw minimap
    drawMinimap(context){
		context.restore();
        context.save();

		var HUDx = this.HUDPosition.x;
		var HUDy = this.HUDPosition.y;

		// map bg
		context.fillStyle = 'rgba(128,128,128,0.5)';
		context.fillRect(HUDx, HUDy, this.minimapDimensions.x, this.minimapDimensions.y);
		context.lineWidth = 4;
		context.strokeStyle = 'rgba(0,0,0,0.5)';
		context.strokeRect(HUDx, HUDy, this.minimapDimensions.x, this.minimapDimensions.y);

        // stage actors
        

        // transporters
        var transporters = this.getAllTransporters();
        var tStyle = new ColourCStyle(128,128,255,0.75);
        tStyle.outline = true;
        tStyle.outlineWidth = 2;
        tStyle.setOutlineColorRGBA(64,64,160,0.75);
        for (var i = 0; i < transporters.length; i++){
            if (transporters[i].enabled){
                var shape = new Circle(4, tStyle);
                var minimapPos = this.convertToMinimapPos(transporters[i].position);
                shape.draw(context, minimapPos.plus(this.HUDPosition), 0);
            }
        }

		// items
		var items = this.getAllItems();
        var itemStyle = new ColourCStyle(255,255,128,0.75);
        itemStyle.outline = true;
        itemStyle.outlineWidth = 2;
        itemStyle.setOutlineColorRGBA(160,160,64,0.75);
        for (var i = 0; i < items.length; i++){
            if (items[i].enabled){
                var shape = new Square(4, itemStyle);
                var minimapPos = this.convertToMinimapPos(items[i].position);
                shape.draw(context, minimapPos.plus(this.HUDPosition), 0);
            }
        }

		// player
		if (this.playerActor){
			var playerStyle = new ColourCStyle(255,255,255,0.75);
			playerStyle.outline = true;
			playerStyle.outlineWidth = 2;
			playerStyle.setOutlineColorRGBA(128,128,128,0.75);
			var shape = new Triangle(6,6, playerStyle);
			var minimapPos = this.convertToMinimapPos(this.playerActor.position);
			shape.draw(context, minimapPos.plus(this.HUDPosition), this.playerActor.rotationAngle);
		}
        
        // other players
        var allPlayers = this.gameState.players;
        var allyStyle = new ColourCStyle(96,96,255,0.75);
        allyStyle.outline = true;
		allyStyle.outlineWidth = 2;
		allyStyle.setOutlineColorRGBA(48,48,196,0.75);
        var enemyStyle = new ColourCStyle(255,96,96,0.75);
        enemyStyle.outline = true;
		enemyStyle.outlineWidth = 2;
		enemyStyle.setOutlineColorRGBA(196,48,48,0.75);
        for (var i = 0; i < allPlayers.length; i++){
			if (allPlayers[i].enabled && allPlayers[i].playerID != this.playerID){
				var shape = new Triangle(6,6, enemyStyle);
				var minimapPos = this.convertToMinimapPos(allPlayers[i].position);
				shape.draw(context, minimapPos.plus(this.HUDPosition), allPlayers[i].rotationAngle);
			}
		}
	}
    
    // draw the player's HUD
    drawHUD(context){
		context.restore();
		context.save();

		//var player = this.getPlayer(this.playerID);
        context.textAlign = "center";
        
		// draw HP
		if (this.playerActor){
            
		}
		else{
			this.playerHP = 0;
		}
		var HPPercent = this.playerHP / this.playerMaxHP;
		context.fillStyle = 'rgba(64,64,64,1)';
		context.fillRect(this.HUDPosition.x + this.minimapDimensions.x + 16, this.HUDPosition.y + 32, 200, 16);
		context.fillStyle = 'rgba(128,255,128,1)';
		context.fillRect(this.HUDPosition.x + this.minimapDimensions.x + 16, this.HUDPosition.y + 32, 200 * HPPercent, 16);
		context.lineWidth = 2;
		context.strokeStyle = 'rgba(0,0,0,1)';
        context.strokeRect(this.HUDPosition.x + this.minimapDimensions.x + 16, this.HUDPosition.y + 32, 200, 16);

		context.font = this.defaultFontStyle;
		context.fillStyle = 'rgba(0,0,0,1)';
		context.fillText("HP: " + this.playerHP + " / " + this.playerMaxHP, this.HUDPosition.x + 100 + this.minimapDimensions.x + 16, this.HUDPosition.y + 64);

		// draw player score
		if (this.playerActor){
            
		}
		context.fillStyle = 'rgba(0,0,0,1)';
		context.fillText("$" + this.playerScore, this.HUDPosition.x + 100 + this.minimapDimensions.x + 16, this.HUDPosition.y + 108);

		// draw Ammo
		if (this.playerActor){
		}
		var ammoText = (this.playerAmmo < 0)? "Unlimited" : this.playerAmmo;
		context.fillText("Ammo: " + ammoText, this.HUDPosition.x + 100 + this.minimapDimensions.x + 16, this.HUDPosition.y + 90);

		// draw crosshairs
		if (this.playerActor){
			if (this.playerActor.weapon){
				if (this.playerActor.weapon.crosshairs && this.playerActor.aimLocation){
					context.translate(this.positionOffset.x, this.positionOffset.y);
					//player.weapon.crosshairs.draw(context);
					context.translate(-this.positionOffset.x, -this.positionOffset.y);
				}
			}
		}
        
        // draw inventory
        if (this.playerActor){
            var iPos = this.inventoryPos;
            var currentObj = (this.playerActor.isBuilding)? this.playerActor.buildingID : this.playerActor.weaponSwapID;
            for (var i = 0; i < 5; i++){
                    context.fillStyle = (currentObj == i)? 'rgba(196,196,196,0.5)' : 'rgba(128,128,128,0.5)';
                    context.fillRect(iPos.x + i * 120, iPos.y - 100, 100, 100);
                    context.lineWidth = 4;
                    context.strokeStyle = 'rgba(0,0,0,0.5)';
                    context.strokeRect(iPos.x + i * 120, iPos.y - 100, 100, 100);
            }
            // Block
            if (this.playerActor.isBuilding){
                for (var i = 0; i < this.playerActor.blocks.length; i++){
                    var drawPos = this.playerActor.blocks[i].position;
                    context.translate(iPos.x + 50 + i * 120 - drawPos.x, iPos.y - 50 - drawPos.y);
                    var drawBlock = ConvertToDrawActor(this.playerActor.blocks[i]);
                    drawBlock.draw(context);
                    context.translate(-(iPos.x + 50 + i * 120 - drawPos.x), -(iPos.y - 50 - drawPos.y));
                    
                    context.translate(iPos.x + 50 + i * 120, iPos.y - 50);
                    context.fillStyle = 'rgba(255,255,255,0.75)';
                    context.textAlign = "center";
                    context.fillText(i, 40, -34);
                    
                    context.fillStyle = (this.playerActor.score >= this.playerActor.blocks[i].cost)?
                        'rgba(255,255,255,0.75)' : 'rgba(255,0,0,0.75)'
                    context.textAlign = "left";
                    context.fillText("$" + this.playerActor.blocks[i].cost, -40, 44);
                    context.translate(-(iPos.x + 50 + i * 120), -(iPos.y - 50));
                }
            }
            // Weapon
            else{
                for (var i = 0; i < this.playerActor.backpackWeapons.length; i++){
                    var drawPos = this.playerActor.backpackWeapons[i].position;
                    context.translate(iPos.x + 50 + i * 120 - drawPos.x, iPos.y - 50 - drawPos.y);
                    var drawWeapon = ConvertToDrawActor(this.playerActor.backpackWeapons[i]);
                    drawWeapon.draw(context);
                    context.translate(-(iPos.x + 50 + i * 120 - drawPos.x), -(iPos.y - 50 - drawPos.y));
                    
                    context.translate(iPos.x + 50 + i * 120, iPos.y - 50);
                    context.fillStyle = 'rgba(255,255,255,0.75)';
                    context.textAlign = "center";
                    context.fillText(i, 40, -34);
                    context.textAlign = "left";
                    context.fillText(this.playerActor.backpackWeapons[i].name, -40, 44);
                    context.translate(-(iPos.x + 50 + i * 120), -(iPos.y - 50));
                }
            }
        }
	}
    
    drawGameOver(ctx){
        if (this.playerID != ""){
            if (this.gameState.killedPlayers.includes(this.playerID)){
                ctx.restore();
                ctx.save();
                
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(2, 300, this.canvasWidth - 4, 200);
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.strokeRect(2, 300, this.canvasWidth - 4, 200);
                
                ctx.textAlign = "center";
                ctx.font = this.bigFontStyle;
                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                ctx.fillText("You Died!", this.canvasWidth/2, this.canvasHeight/2);
            }
        }
    }

    // DRAWING GAME STATE
	drawGameState(gameState, playerID){
        // update game info
        this.updateToState(gameState);
        this.updatePlayer(playerID);
        
        // center the camera on the player if possible
		this.centerCameraOnPlayer();
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		
        var terrainActors = this.getAllTerrain();
        var actors = this.gameState.actors;
		
		// draw terrain first
		for(var i=0;i<terrainActors.length;i++){
            if (terrainActors[i].enabled){
                var convertedActor = ConvertToDrawActor(terrainActors[i]);
                convertedActor.draw(context);
            }
        }	
	
		// draw actors	
		for(var i=0;i<actors.length;i++){
			if (actors[i].enabled){
                var convertedActor = ConvertToDrawActor(actors[i]);
                convertedActor.draw(context);
			}
		}
        
        // draw UI elements
        this.drawHPBarsAll(context);
        this.drawMinimap(context);
        this.drawHUD(context);
        
        this.drawGameOver(context);
	}
    
    drawTouchControls(touchPos){
        var ctx = this.canvas.getContext('2d');
        ctx.restore();
        ctx.save();
        
        // Bottom Left: MOVEMENT
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(100, 575, 75, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
        ctx.fill();
        ctx.closePath();

        // Outer Stroke
        ctx.beginPath();
        ctx.arc(100, 575, 75, 0, 2 * Math.PI);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.stroke();
        ctx.closePath();

        // Analog Pos
        var analogPos = new Pair(100, 575);
        if (touchPos != null){
            var rect = this.canvas.getBoundingClientRect();
            var convertedPos = new Pair(touchPos.clientX - rect.left,
                touchPos.clientY - rect.top);
            
            analogPos = convertedPos;
            
            if (analogPos.x < 25){
                analogPos.x = 25;
            }
            else if (analogPos.x > 175){
                analogPos.x = 175;
            }
            
            if (analogPos.y < 500){
                analogPos.y = 500;
            }
            else if (analogPos.y > 650){
                analogPos.y = 650;
            }
        }
        
        // Analog Outer
        ctx.beginPath();
        ctx.arc(analogPos.x, analogPos.y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(64,64,64,0.75)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Analog Inner
        ctx.beginPath();
        ctx.arc(analogPos.x, analogPos.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(32,32,32,0.75)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Bottom Right: SHOOT
        
        // Shoot Outer
        ctx.beginPath();
        ctx.arc(715, 575, 60, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Shoot Layer
        ctx.beginPath();
        ctx.arc(715, 575, 40, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,128,128,0.75)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Shoot Inner
        ctx.beginPath();
        ctx.arc(715, 575, 35, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,32,32,0.75)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        
        // Beside inventory: Swap To Build
        // Switch to build
        ctx.fillStyle = 'rgba(96,96,255,0.5)';
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(800 - 72, 800 - 72, 48, 48);
        ctx.strokeRect(800 - 72, 800 - 72, 48, 48);
        ctx.fillStyle = 'rgba(0,0,255,0.75)';
        ctx.fillRect(800 - 66, 800 - 66, 36, 36);
        ctx.strokeRect(800 - 66, 800 - 66, 36, 36);
    }
    
} // End GameView class

// DRAW CSTYLE
function GetCStyleColor(style){
    if (style.colorString){
        return getHexColor(style.colorString);
    }
    return 'rgba('+style.red+','+style.green+','+style.blue+','+style.alpha+')';
}
function GetCStyleOutlineColor(style){
    if (style.outlineColorString){
        return getHexColor(style.outlineColorString);
    }
    return 'rgba('+style.outlineRed+','+style.outlineGreen+','+style.outlineBlue+','+style.outlineAlpha+')';
}
function GetGStopColor(stop){
    return 'rgba('+stop.red+','+stop.green+','+stop.blue+','+stop.alpha+')';
}

// DRAW GAMEOBJECTS CODE

class DrawShape {
	constructor(originalShape){
        this.offsetPosition = originalShape.offsetPosition;
        this.offsetAngle = originalShape.offsetAngle;
        this.contextStyle = originalShape.contextStyle;
        this.ignoreCollisions = originalShape.ignoreCollisions;
        
		/*this.offsetPosition = new Pair(0, 0);
		this.offsetAngle = 0;
		this.contextStyle = contextStyle;
		this.ignoreCollisions = false;*/
	}
	getGradient(context){
		return (this.contextStyle.isGradientLinear)?
			context.createLinearGradient(0, 0, 0, 0) :
                        context.createRadialGradient(0, 0, 0, 0, 0, 0);
	}
	getStyle(context){
		var style = GetCStyleColor(this.contextStyle);
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

class DrawNullShape extends DrawShape {
	constructor(){
		super(new NullCStyle());
	}
}

class DrawRectangle extends DrawShape {
	constructor(originalShape){
        super(originalShape);
        this.width = originalShape.width;
        this.height = originalShape.height;
        
        //this.width = width;
		//this.height = height;
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
                    grd.addColorStop(stop.value, GetGStopColor(stop));
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
			context.strokeStyle = GetCStyleOutlineColor(this.contextStyle);
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

class DrawSquare extends DrawRectangle {
	constructor(originalShape){
		super(originalShape);
	}
}

class DrawArc extends DrawShape{
	constructor(originalShape){
        super(originalShape);
        this.radius = originalShape.radius;
		this.sAngle = originalShape.sAngle;
		this.eAngle = originalShape.eAngle;
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
                        grd.addColorStop(stop.value, GetGStopColor(stop));
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
            context.strokeStyle = GetCStyleOutlineColor(this.contextStyle);
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

class DrawCircle extends DrawArc{
	constructor(originalShape){
        super(originalShape);
    }
}

class DrawImageShape extends DrawRectangle {
	constructor(originalShape){
		super(originalShape);
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

class DrawPolygon extends DrawShape {
	constructor(originalShape){
		super(originalShape);
		this.vertices = originalShape.vertices;
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
                grd.addColorStop(stop.value, GetGStopColor(stop));
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
            context.strokeStyle = GetCStyleOutlineColor(this.contextStyle);
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

class DrawTriangle extends DrawPolygon {
	constructor(originalShape){
		super(originalShape);
	}
}

class DrawBulletShape extends DrawPolygon {
	constructor(originalShape){
        super(originalShape);
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
                context.strokeStyle = GetCStyleOutlineColor(this.contextStyle);
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

function ConvertToDrawShape(shape){
    if (shape.shapeType == "bullet"){
        return new DrawBulletShape(shape);
    }
    else if (shape.shapeType == "triangle"){
        return new DrawTriangle(shape);
    }
    else if (shape.shapeType == "polygon"){
        return new DrawPolygon(shape);
    }
    else if (shape.shapeType == "image"){
        return new DrawImageShape(shape);
    }
    else if (shape.shapeType == "circle"){
        return new DrawCircle(shape);
    }
    else if (shape.shapeType == "arc"){
        return new DrawArc(shape);
    }
    else if (shape.shapeType == "square"){
        return new DrawSquare(shape);
    }
    else if (shape.shapeType == "rectangle"){
        return new DrawRectangle(shape);
    }
    else if (shape.shapeType == "null"){
        return new DrawNullShape(shape);
    }
    else {
        return new DrawShape(shape);
    }
}

function ConvertToDrawActor(actor){
    if (actor.actorType == "WeaponPickup"){
        return new DrawWeaponPickup(shape);
    }
    else {
        return new DrawActor(actor);
    }
}

// DRAW ACTORS

class DrawActor {
    constructor(originalActor){
        this.position = originalActor.position;
        this.rotationAngle = originalActor.rotationAngle;
        this.neverRotate = originalActor.neverRotate;
        this.x = originalActor.x;
        this.y = originalActor.y;
        
        // convert shapes
        this.shapes = [];
        for (var i = 0; i < originalActor.shapes.length; i++){
            this.shapes.push(ConvertToDrawShape(originalActor.shapes[i]));
        }
        
        // convert subactors
        this.subActors = []; 
        for (var i = 0; i < originalActor.subActors.length; i++){
            this.subActors.push(ConvertToDrawActor(originalActor.subActors[i]));
        }
    }
    setPosition(newX, newY){
		this.position.x = newX;
		this.position.y = newY;
        this.intPosition();
	}
    intPosition(){
        this.x = Math.round(this.position.x);
        this.y = Math.round(this.position.y);
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
}

class DrawWeaponPickup extends DrawActor {
    constructor(originalActor){
        super(originalActor);
    }
}
