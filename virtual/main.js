var VirtualSpheroController = (function() {
  var SpeedController = (function() {
    function SpeedController() {
      this._element = document.getElementById("speed");
      this.speed = 0.2;
      this._element.value = this.speed;
      this._element.addEventListener("change", () => {
        if (this._element.value !== "" && !isNaN(this._element.value)) {
          this.speed = parseFloat(this._element.value);
        }
      });
    };
    return SpeedController;
  })();
  function VirtualSpheroController() {
    this.ws = new WebSocket("ws://" + location.host);

    this.ws.onclose = function() {
        this.ws = null;
    }.bind(this);

    this.ws.onerror = function(e) {
        if (typeof errorCallback === "function")
            errorCallback(e);
    };

    this.ws.onmessage = function(message) {
      console.log(message.data);
      var data;
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        console.log(e);
        return;
      }
      if (data.command.substring(0, 1) === "_") {
        console.log(data.command);
        switch (data.command) {
          case "_addVirtualSphero":
            this.addVirtualSphero(data.arguments);
            break;
          case "_removeVirtualSphero":
            this.removeVirtualSphero(data.arguments);
            break;
          }
        } else if(commands.indexOf(data.command) !== -1) {
        Object.keys(this.virtualSpheros).forEach(virtualSpheroName => {
          var virtualSphero = this.virtualSpheros[virtualSpheroName];
          if (typeof virtualSphero[data.command] !== "undefined") {
            virtualSphero[data.command].apply(virtualSphero, data.arguments);
          }
        });
      }
    }.bind(this);

    this.speedController = new SpeedController();
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    var tick = () => {
      this.clearCanvas();
      var moveSphero = [];
      Object.keys(this.virtualSpheros).forEach((virtualSpheroName, index) => {
        var virtualSphero = this.virtualSpheros[virtualSpheroName];
        var collidedSpheroCount = Object.keys(this.virtualSpheros).filter((targetSpheroName, targetIndex) => {
          var targetSphero = this.virtualSpheros[targetSpheroName];
          if (targetIndex === index) {
            return false;
          }
          var movedVirtualSpheroX = virtualSphero.x + virtualSphero.ex;
          var movedVirtualSpheroY = virtualSphero.y + virtualSphero.ey;
          var movedTargetSpheroX = targetSphero.x + targetSphero.ex;
          var movedTargetSpheroY = targetSphero.y + targetSphero.ey;
          var dx = Math.abs(movedVirtualSpheroX - movedTargetSpheroX);
          var dy = Math.abs(movedVirtualSpheroY - movedTargetSpheroY);
          if (Math.sqrt(dx * dx + dy * dy) <= virtualSphero.radius * 2) {
            var collsionRadian =
              Math.atan2(movedTargetSpheroY - movedVirtualSpheroY, movedTargetSpheroX - movedVirtualSpheroX) * 180 / Math.PI;
            var moveRadian = Math.atan2(virtualSphero.ey, virtualSphero.ex) * 180 / Math.PI;
            return Math.abs(collsionRadian - moveRadian) <= 10;
          }
        }).length;
        if (collidedSpheroCount === 0) {
          moveSphero.push(index);
        }
      });
      Object.keys(this.virtualSpheros).forEach((virtualSpheroName, index) => {
        var virtualSphero = this.virtualSpheros[virtualSpheroName];
        if (moveSphero.indexOf(index) >= 0) {
          virtualSphero.move();
        }
        virtualSphero.draw();
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.virtualSpheros = {};
  }

  VirtualSpheroController.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  VirtualSpheroController.prototype.addVirtualSphero = function(spheroName) {
    this.virtualSpheros[spheroName] = new VirtualSphero(this.canvas, this.speedController, spheroName);
  };

  VirtualSpheroController.prototype.removeVirtualSphero = function(spheroName) {
    if (typeof this.virtualSpheros[spheroName] !== "undefined") {
      delete this.virtualSpheros[spheroName];
    }
  };

  var commands = [
    /* sphero.js */
    "setHeading",
    "setStabilization",
    "setRotationRate",
    "setCreationDate",
    "getBallRegWebsite",
    "reEnableDemo",
    "getChassisId",
    "setChassisId",
    "selfLevel",
    "setVdl",
    "setDataStreaming",
    "setCollisionDetection",
    "locator",
    "setAccelerometer",
    "readLocator",
    "setRgbLed",
    "setBackLed",
    "getRgbLed",
    "roll",
    "boost",
    "move",
    "setRawMotors",
    "setMotionTimeout",
    "setOptionsFlag",
    "getOptionsFlag",
    "setTempOptionFlags",
    "getTempOptionFlags",
    "getConfigBlock",
    "setSsbParams",
    "setDeviceMode",
    "setConfigBlock",
    "getDeviceMode",
    "getSsb",
    "setSsb",
    "ssbRefill",
    "ssbBuy",
    "ssbUseConsumeable",
    "ssbGrantCores",
    "ssbAddXp",
    "ssbLevelUpAttr",
    "getPwSeed",
    "ssbEnableAsync",
    "runMacro",
    "saveTempMacro",
    "saveMacro",
    "initMacroExecutive",
    "abortMacro",
    "macroStatus",
    "setMacroParam",
    "appendTempMacroChunk",
    "eraseOBStorage",
    "appendOBFragment",
    "execOBProgram",
    "abortOBProgram",
    "answerInput",
    "commitToFlash",
    "commitToFlashAlias",
    /* custom.js */
    "streamData",
    "color",
    "randomColor",
    "getColor",
    "detectCollisions",
    "startCalibration",
    "finishCalibration",
    "streamOdometer",
    "streamVelocity",
    "streamAccelOne",
    "streamImuAngles",
    "streamAccelerometer",
    "streamGyroscope",
    "streamMotorsBackEmf",
    "stopOnDisconnect",
    "stop"
  ];
  return VirtualSpheroController;
})();

document.addEventListener("DOMContentLoaded", function() {
  var sphero = new VirtualSpheroController();
  window.addEventListener("resize", function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.clearCanvas();
    virtualSphero.draw();
  });
});
