stage = null;
_gameState = null;
_gameView = null;
_isDrawing = false;
_inAGame = false;
ui = null;
view = null;
interval = null;
controlInterval = null;
_playerID = "";
_gameTime = 0;
_gameIntervalTime = 40;
_gameScore = 1;
_serverHost = "localhost";

// Player controls
var controlLockMove = false;
var controlLockRotate = false;
var controlLockShoot = false;
var controlLockInterval = null;
// Keep track of the keyboard keys the player is pressing down
var keysPressed = {};
// This map is conversion from keys to input values
var controlInput = {};
var mouseEvent = null;
var touchEvent = null;

_touchSupport = false;
var analogOrigin = null;
var lastShootDirection = null;
var ongoingTouches = [];
var movementTouch = null;
var shootTouch = null;

// This value is for multiple projectiles
var mouseDown = false;
var touchDown = false;

// This value is for game pausing
var gamePaused = false;

//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

// Connect to the server
var _socket = null;
var _pingTimeout = null;

function sendToSocket(message) {
  if (_socket) {
    _socket.send(message);
  }
}

function heartbeat() {
  console.log("heartbeat");
  clearTimeout(_pingTimeout);
  _pingTimeout = setTimeout(function () {
    terminateConnection();
  }, 30000 + 3000);
}

function terminateConnection() {
  console.log("connection forcefully terminated");
  if (_socket) {
    _socket.terminate();
  }
}

function joinGame(app) {
  $(function () {
    _socket = new WebSocket("ws://" + _serverHost + ":10731");
    _socket.onopen = function (event) {
      console.log("connected");
      heartbeat();
      sendJoinRequest(app.state.username);
    };
    _socket.onclose = function (event) {
      console.log("disconnected");
      clearTimeout(_pingTimeout);
      // if it was clean, no error message
      if (event.wasClean) {
        console.log("Clean disconnection");
      } else {
        // error
        alert(
          "closed code:" +
            event.code +
            " reason:" +
            event.reason +
            " wasClean:" +
            event.wasClean
        );
      }
      // boot the player out of the game if they haven't been already
      _socket = null;
      if (event.code != "4000") {
        app.handleLeaveGameClick();
        //leaveGame(state);
      }
    };
    _socket.onmessage = function (event) {
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case "ping":
          heartbeat();
          break;

        // joining a game for the first time, start the game view
        case "join":
          _playerID = msg.playerID;
          setupGame();
          startGame();
          _inAGame = true;
          break;

        case "fail":
          alert(msg.message);
          app.handleLeaveGameClick();
          //leaveGame(state);
          break;

        // updating the game state
        case "state":
          if (_inAGame) {
            _gameState = msg.state;
            if (!_isDrawing) {
              _isDrawing = true;
              _gameView.drawGameState(_gameState, _playerID);

              // draw UI controls if touch-enabled
              if (_touchSupport) {
                var gameCanvas = document.getElementById("stage");
                var rect = gameCanvas.getBoundingClientRect();

                _gameView.drawTouchControls(movementTouch);
              }

              // update the player's score if possible
              var playerActor = _gameView.getPlayer(_playerID);
              if (playerActor) {
                _gameScore = _gameView.getActorScore(playerActor);
              }
              _isDrawing = false;
            }
          }
          break;
      }
    };
  });
}
function leaveGame() {
  if (_socket) {
    // send a message to the server to delete this user
    var msg = {
      type: "delete",
    };
    sendToSocket(JSON.stringify(msg));

    // close the connection
    _socket.close("4000", "Game exited successfully");
  }
  _inAGame = false;
  removeControllerListeners();
  clearInterval(interval);
  interval = null;
  clearInterval(controlLockInterval);
  controlLockInterval = null;
  clearTimeout(_pingTimeout);
  _pingTimeout = null;
  _gameState = null;
  _gameView = null;
}
function removeControllerListeners() {
  var gameCanvas = document.getElementById("stage");
  document.removeEventListener("keydown", getKeyDown);
  document.removeEventListener("keyup", getKeyUp);
  if (gameCanvas) {
    gameCanvas.removeEventListener("mousedown", getMouseDown);
    gameCanvas.removeEventListener("mouseup", getMouseUp);
    gameCanvas.removeEventListener("mousemove", getMouseMove);
    gameCanvas.removeEventListener("mousemove", getMouseMoveOnDown);

    gameCanvas.removeEventListener("touchend", getTouchEnd);
    gameCanvas.removeEventListener("touchmove", getTouchMove);
    gameCanvas.removeEventListener("touchstart", getTouchStart);
  }
}

// send a request to the server to join the match
function sendJoinRequest(val) {
  // set the player's username
  var playerID = val; //sessionStorage.getItem("globalUsername");

  // set the player's color
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  var color = "#" + randomColor;

  // join a random room every time
  var randomRoom = randint(2);
  // request to join on connection
  var msg = {
    type: "join",
    joinID: randomRoom,
    playerID: playerID,
    color: color,
  };
  sendToSocket(JSON.stringify(msg));
}

function setupGame() {
  var gameCanvas = document.getElementById("stage");
  _touchSupport = checkTouchSupport();
  analogOrigin = new Pair(100, 575);
  lastShootDirection = new Pair(0, -1);

  // _playerID = sessionStorage.getItem("globalUsername");

  // save default context
  var context = gameCanvas.getContext("2d");
  context.save();

  _gameView = new GameView(gameCanvas);

  // Key events happen when the document is open
  document.addEventListener("keydown", getKeyDown);
  document.addEventListener("keyup", getKeyUp);

  // Mouse events should only happen in the game area
  gameCanvas.addEventListener("mousedown", getMouseDown);
  gameCanvas.addEventListener("mouseup", getMouseUp);
  gameCanvas.addEventListener("mousemove", getMouseMove);

  // Add touch controls if supported
  addTouchControls();

  window.addEventListener("beforeunload", function (e) {
    sessionStorage.removeItem("currentScreen");
    e.preventDefault();
    e.returnValue = "";
  });
}
function startGame() {
  _gameScore = 0;

  // set the default control values
  controlInput = {
    horizontal: 0,
    vertical: 0,
    shoot: false,
    release: false,
    swapID: 0,
    willSwap: false,
    interact: false,
    building: false,
    aimLocation: null,
  };

  // Send controls every set interval
  controlLockInterval = setInterval(function () {
    runControlCycle();
  }, _gameIntervalTime);
}

function restartGame() {
  stage = null;
  ui = null;
  view = null;
  clearInterval(interval);
  interval = null;
  clearInterval(controlInterval);
  controlInterval = null;
  _gameTime = 0;
  _gameIntervalTime = 20;
  var gameCanvas = document.getElementById("stage");
  document.removeEventListener("keydown", getKeyDown);
  document.removeEventListener("keyup", getKeyUp);
  gameCanvas.removeEventListener("mousedown", getMouseDown);
  gameCanvas.removeEventListener("mouseup", getMouseUp);
  gameCanvas.removeEventListener("mousemove", getMouseMove);
}

function sendPlayerMove() {
  var dx = controlInput["horizontal"];
  var dy = controlInput["vertical"];

  // Horizontal Movement
  if (keysPressed["d"]) {
    controlInput["horizontal"] = 1;
  } else if (keysPressed["a"]) {
    controlInput["horizontal"] = -1;
  }

  // Vertical Movement
  if (keysPressed["s"]) {
    controlInput["vertical"] = 1;
  } else if (keysPressed["w"]) {
    controlInput["vertical"] = -1;
  }

  // Horizontal Gravity (Return to neutral if not pressed)
  if (dx > 0 && !keysPressed["d"]) {
    controlInput["horizontal"] = 0;
  } else if (dx < 0 && !keysPressed["a"]) {
    controlInput["horizontal"] = 0;
  }

  // Vertical Gravity (Return to neutral if not pressed)
  if (dy > 0 && !keysPressed["s"]) {
    controlInput["vertical"] = 0;
  } else if (dy < 0 && !keysPressed["w"]) {
    controlInput["vertical"] = 0;
  }

  // send controls if we are actually moving
  if (controlInput["horizontal"] != 0 || controlInput["vertical"] != 0) {
    var msg = {
      type: "control-move",
      x: controlInput["horizontal"],
      y: controlInput["vertical"],
    };
    sendToSocket(JSON.stringify(msg));
  }
}
function sendPlayerRotate() {
  if (controlInput["aimLocation"] != null && !controlLockRotate) {
    controlLockRotate = true;
    var msg = {
      type: "control-rotate",
      x: controlInput["aimLocation"].x,
      y: controlInput["aimLocation"].y,
    };
    sendToSocket(JSON.stringify(msg));
    setTimeout(function () {
      controlLockRotate = false;
    }, _gameIntervalTime);
  }
}
function runControlCycle() {
  // movement controls
  sendPlayerMove();

  // touch controls
  if (_touchSupport) {
    // rotate
    setAimLocation();
    sendPlayerRotate();
  }

  // shooting controls
  if (controlInput["shoot"]) {
    var shootLocation = null;
    if (_touchSupport && shootTouch != null) {
      shootLocation = getAimLocation();
    } else {
      shootLocation = getMouseLocation(mouseEvent);
    }

    var msgShoot = {
      type: "control-shoot",
      x: shootLocation.x,
      y: shootLocation.y,
    };
    if (controlInput["building"]) {
      controlInput["shoot"] = false;
    }
    // send shooting controls
    sendToSocket(JSON.stringify(msgShoot));
  }

  // release shot
  if (controlInput["release"]) {
    var msgRelease = {
      type: "control-release",
    };
    sendToSocket(JSON.stringify(msgRelease));
    controlInput["release"] = false;
  }

  // interacting
  if (controlInput["interact"]) {
    controlInput["interact"] = false;
  }

  // building
  if (controlInput["building"]) {
    var msgBuild = {
      type: "control-swapToBuild",
    };
    sendToSocket(JSON.stringify(msgBuild));
    controlInput["building"] = false;
  }

  // swap weapon / build
  var swapID = controlInput["swapID"];
  var willSwap = controlInput["willSwap"];
  if (willSwap) {
    var msgSwap = {
      type: "control-swapWeapon",
      weaponID: swapID,
    };
    sendToSocket(JSON.stringify(msgSwap));
  }
  controlInput["swapID"] = 0;
  controlInput["willSwap"] = false;
}
function addTouchControls() {
  // touch
  var gameCanvas = document.getElementById("stage");
  gameCanvas.addEventListener("touchend", getTouchEnd);
  gameCanvas.addEventListener("touchmove", getTouchMove);
  gameCanvas.addEventListener("touchstart", getTouchStart);
}

function getKeyDown(event) {
  var key = event.key;
  if (!keysPressed[key]) {
    keysPressed[key] = true;

    // One-click events
    // interaction
    if (key == " ") {
      controlInput["interact"] = true;
    }
    // building
    else if (key == "b") {
      controlInput["building"] = true;
    }
    // swap weapons
    else if (key == "1") {
      controlInput["swapID"] = 0;
      controlInput["willSwap"] = true;
    } else if (key == "2") {
      controlInput["swapID"] = 1;
      controlInput["willSwap"] = true;
    } else if (key == "3") {
      controlInput["swapID"] = 2;
      controlInput["willSwap"] = true;
    } else if (key == "4") {
      controlInput["swapID"] = 3;
      controlInput["willSwap"] = true;
    } else if (key == "5") {
      controlInput["swapID"] = 4;
      controlInput["willSwap"] = true;
    }
  }
}
function getKeyUp(event) {
  var key = event.key;
  keysPressed[key] = null;
}

function getMouseDown(event) {
  var click = event.button;

  if (click == "0") {
    controlInput["shoot"] = true;
    mouseEvent = event;
    mouseDown = true;
    /*fire(event); //ensures at minimum 1 bullet fires*/
    var gameCanvas = document.getElementById("stage");
    gameCanvas.addEventListener("mousemove", getMouseMoveOnDown);
  }
}
function getMouseUp(event) {
  clearInterval(mouseDown);
  mouseDown = false;
  controlInput["shoot"] = false;
  controlInput["release"] = true;
  mouseEvent = null;
}

// Touch / Mobile Code
function checkTouchSupport() {
  return !!("ontouchstart" in window || navigator.maxTouchPoints);
}

function controllerCopyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}
function getOngoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1; // not found
}

function getTouchStart(event) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  event.preventDefault();
  var touches = event.changedTouches;

  // Handle new touches
  for (var i = 0; i < touches.length; i++) {
    // add changed touches to ongoing list
    ongoingTouches.push(controllerCopyTouch(touches[i]));

    var x = touches[i].clientX - rect.left;
    var y = touches[i].clientY - rect.top;
    console.log("x: " + x + ", y: " + y);

    // Handle movement
    if (movementTouch == null) {
      // add touch if it's within the movement graphic
      if (x >= 25 && x <= 175 && y >= 500 && y <= 650) {
        console.log("movement touch registered");
        movementTouch = controllerCopyTouch(touches[i]);
        setTouchMovement(movementTouch);
        lastShootDirection = getTouchDirection(movementTouch, analogOrigin);
        //setAimLocation();
      }
    }

    // Handle shooting
    if (shootTouch == null) {
      // add touch if it's within the movement graphic
      if (x >= 655 && x <= 775 && y >= 515 && y <= 635) {
        console.log("shoot touch registered");
        shootTouch = controllerCopyTouch(touches[i]);
        controlInput["shoot"] = true;
        //setAimLocation();
      }
    }

    // Handle swapping to building / weapon
    if (x >= 728 && x <= 776 && y >= 728 && y <= 776) {
      controlInput["building"] = true;
    }

    // Handle swapping weapon / build block
    var boxWidth = 100;
    for (var j = 0; j < 5; j++) {
      var boxX = 120 + j * 120;
      var boxY = 676;

      if (
        x >= boxX &&
        x <= boxX + boxWidth &&
        y >= boxY &&
        y <= boxY + boxWidth
      ) {
        controlInput["swapID"] = j;
        controlInput["willSwap"] = true;
      }
    }
  }
}
function getTouchEnd(event) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  event.preventDefault();
  var touches = event.changedTouches;

  // remove changed touches from ongoing list
  for (var i = 0; i < touches.length; i++) {
    var idx = getOngoingTouchIndexById(touches[i].identifier);

    // Check if movement touch was removed
    if (movementTouch != null) {
      if (movementTouch.identifier == touches[i].identifier) {
        unsetTouchMovement();
      }
    }

    // Check if shoot touch was removed
    if (shootTouch != null) {
      if (shootTouch.identifier == touches[i].identifier) {
        controlInput["shoot"] = false;
        controlInput["release"] = true;
        shootTouch = null;
      }
    }

    if (idx >= 0) {
      ongoingTouches.splice(idx, 1);
    }
  }

  /*controlInput["shoot"] = false;
	controlInput["release"] = true;
    touchEvent = null;
    touchDown = false;
    var gameCanvas = document.getElementById('stage');
    gameCanvas.removeEventListener('touchmove', getTouchMoveOnDown);*/
}
function getTouchMove(event) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  event.preventDefault();
  var touches = event.changedTouches;

  // handle changed touches from ongoing list
  for (var i = 0; i < touches.length; i++) {
    var idx = getOngoingTouchIndexById(touches[i].identifier);

    // Check if movement touch was changed
    if (movementTouch != null) {
      if (movementTouch.identifier == touches[i].identifier) {
        movementTouch = controllerCopyTouch(touches[i]);
        setTouchMovement(movementTouch);
        lastShootDirection = getTouchDirection(movementTouch, analogOrigin);
        setAimLocation();
      }
    }
  }
}
function getTouchMoveOnDown(event) {
  if (touchDown) {
    touchEvent = event;
  }
}
function getTouchLocation(event) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  event.preventDefault();
  var x = Math.round(
    event.touches[0].clientX - rect.left - _gameView.positionOffset.x
  );
  var y = Math.round(
    event.touches[0].clientY - rect.top - _gameView.positionOffset.y
  );
  return new Pair(x, y);
}

function getTouchDirection(touch, originPoint) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  var touchDir = new Pair(
    touch.clientX - rect.left - originPoint.x,
    touch.clientY - rect.top - originPoint.y
  );
  touchDir.normalize();
  return touchDir;
}
function setTouchMovement(touch) {
  var touchDirection = getTouchDirection(touch, analogOrigin);

  // simulate horizontal movement
  if (touchDirection.x > 0.2) {
    keysPressed["d"] = true;
    keysPressed["a"] = null;
  } else if (touchDirection.x < -0.2) {
    keysPressed["a"] = true;
    keysPressed["d"] = null;
  } else {
    keysPressed["a"] = null;
    keysPressed["d"] = null;
  }

  // simulate vertical movement
  if (touchDirection.y > 0.2) {
    keysPressed["s"] = true;
    keysPressed["w"] = null;
  } else if (touchDirection.y < -0.2) {
    keysPressed["w"] = true;
    keysPressed["s"] = null;
  } else {
    keysPressed["w"] = null;
    keysPressed["s"] = null;
  }
}
function unsetTouchMovement() {
  movementTouch = null;
  keysPressed["w"] = null;
  keysPressed["a"] = null;
  keysPressed["s"] = null;
  keysPressed["d"] = null;
}
function getAimLocation() {
  var aimX =
    lastShootDirection.x * 100 -
    _gameView.positionOffset.x +
    _gameView.canvasWidth / 2;
  var aimY =
    lastShootDirection.y * 100 -
    _gameView.positionOffset.y +
    _gameView.canvasHeight / 2;
  var aimLoc = new Pair(aimX, aimY);
  return aimLoc;
}
function setAimLocation() {
  controlInput["aimLocation"] = getAimLocation();
}

function getMouseLocation(event) {
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  var clickPosx = Math.round(
    event.clientX - rect.left - _gameView.positionOffset.x
  );
  var clickPosy = Math.round(
    event.clientY - rect.top - _gameView.positionOffset.y
  );
  return new Pair(clickPosx, clickPosy);
}

function fire(event) {
  // Only fire if the player is able to
  if (stage.player.canShootWeapon()) {
    // Shoot at the location the player clicked
    var gameCanvas = document.getElementById("stage");
    var rect = gameCanvas.getBoundingClientRect();
    var clickPosx = Math.round(
      event.clientX - rect.left - _gameView.positionOffset.x
    );
    var clickPosy = Math.round(
      event.clientY - rect.top - _gameView.positionOffset.y
    );
    stage.player.shootWeapon(new Pair(clickPosx, clickPosy));
  }
}

function playerBuild(event) {
  // Only build if the player is able to
  if (stage.player.canBuild()) {
    // Shoot at the location the player clicked
    var gameCanvas = document.getElementById("stage");
    var rect = gameCanvas.getBoundingClientRect();
    var clickPosx = Math.round(
      event.clientX - rect.left - _gameView.positionOffset.x
    );
    var clickPosy = Math.round(
      event.clientY - rect.top - _gameView.positionOffset.y
    );
    stage.player.buildBlock();
  }
}

function getMouseMoveOnDown(event) {
  if (mouseDown) {
    mouseEvent = event;
  }
}

function getMouseMove(event) {
  //if (!mouseDown){
  var gameCanvas = document.getElementById("stage");
  var rect = gameCanvas.getBoundingClientRect();
  var x = Math.round(event.clientX - rect.left - _gameView.positionOffset.x);
  var y = Math.round(event.clientY - rect.top - _gameView.positionOffset.y);
  controlInput["aimLocation"] = new Pair(x, y);
  sendPlayerRotate();
  controlInput["aimLocation"] = null;
  //}
}
