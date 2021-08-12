class Shape {
	constructor(contextStyle){
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
	}
}

class Rectangle extends Shape {
	constructor(width, height, contextStyle){
                super(contextStyle);
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
	}
}

class Arc extends Shape{
	constructor(radius, sAngle, eAngle, contextStyle){
                super(contextStyle);
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
        }
}

class ImageShape extends Rectangle {
	constructor(width, height, contextStyle){
		super(width, height, contextStyle);
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
	}
}

class BulletShape extends Polygon {
	constructor(width, height, contextStyle){
                super(
                [new Pair(width/2, -height/2), new Pair(width/2, height/2), new Pair(-width/2, height/2), new Pair(-width/2, -height/2)],
                contextStyle);
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
				if (!bestTerrain){
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
        return _gameState.getActorByID(this.parentActor);
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
	// destroy self from the game view
	destroySelf(){
		// Remove all sub-actors
		for(var i=0;i<this.subActors.length;i++){
			_gameState.removeActor(this.subActors[i]);
        }
		_gameState.removeActor(this);
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
		var scaleFactor = (terrain)? terrain.speedMod : 1;

		if (x != 0 || y != 0){
			var canMove = true;
			var totalCollidedActors = [];
			var highestMovement = Math.max(Math.abs(x), Math.abs(y));
			var currentScale = highestMovement * scaleFactor;
			var nextX = x / currentScale;
			var nextY = y / currentScale;
			for (var i = 0; i < highestMovement * scaleFactor; i++){
				// Account for the current scale
				currentScale = highestMovement * scaleFactor;
				nextX = x / currentScale;
				nextY = y / currentScale;
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
			if (x != 0 || y != 0){
				// run against other
			}
		}
		super.step();
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
		var actors = _gameState.getAllCharacters();
		var allies = [];
		for(var i=0;i<actors.length;i++){
			if (actors[i].team == this.team){
				allies.push(actors[i]);
			}
                }
		return allies;
	}
	getEnemyActors(){
		var actors = _gameState.getAllCharacters();
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
		this.team = "1";

		// Special properties
		this.score = 0;
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
                var collidingActors = _gameState.getCollidingActors(buildLocation, this.buildingBlock);
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
                    _gameState.addActor(block);
                }
            }
        }
        this.queueBuild = false;
		
		super.step();
		this.runCollisionCheck();
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
        this.willSwapWeapon = true;
		this.weaponSwapID = swapID;
	}
    queueBlockSwap(swapID){
        this.willSwapBlock = true;
		this.buildingID = swapID;
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
        var collidingActors = _gameState.getCollidingActors(this.getTruePosition(), this);
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
					savedCollidedActors.push(actor.toTransporter);
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
		_gameState.removePlayer(this.playerID);
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
		var collidingActors = _gameState.getCollidingActors(this.getTruePosition(), this);
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
				_gameState.removeActor(this);
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
	constructor(position, speedMod, bulletAmount, offsetAngle, shapes, bulletShapes){
		super(_gameState, position, "BulletSpawn", shapes);
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
						var bullet = new Bullet(_gameState, position, this.bulletSpeed * spawn.speedMod, this, spawn, shooter);
						bullet.setRotation(spawn.getTrueRotation() + randomAngle);
						_gameState.addActor(bullet);

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
        var owner = _gameState.getActorByID(this.owner);
		if (owner){
			var weaponDrop = new WeaponPickup(stage, owner.position, this);
			_gameState.addActor(weaponDrop);
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
		if (_gameState.player){
			this.setTarget(_gameState.player);
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
			var distance = _gameState.getDistance(this, this.target);
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
		_gameState.KOEnemy(this);
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
        var owner = _gameState.getActorByID(this.owner);
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
        var block = new ActorHPBlock(_gameState, this.getBuildPos(), copyShape, 40 + this.level * 10);
        block.setPointsGiven(0);
        return block;
    }
}



// ITEMS
class ItemPickup extends Actor {
	constructor(stage, position, shape){
		super(stage, position, "Item", shape);
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
		this.passThrough = false;
	}
}

class TerrainActor extends Actor {
	constructor(stage, position, shapes, layer, speedMod){
		super(stage, position, "Terrain", shapes);
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
		this.toLocation = null;		// If this is set, this is the position the actor will be sent to
		this.toTransporter = -1;	// If this is set, this is the transporter that the actor will be sent to
	}
	setToLocation(position){
		this.toLocation = position;
	}
    getToTransporter(){
        return _gameState.getActorByID(this.toTransporter);
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