//direction of the character
var directions = {
	up		: 0,
	right	: 1,
	down	: 2,
	left	: 3
};

function Character(){
	this.tileFrom = [1,1];
	this.tileTo = [1,1];
	this.timeMoved = 0; // time when the object starts moving
	this.dimensions = [30,30];
	this.position = [45,45]; // position relative to the top left in pixel unit
	// this.delayMove = 200; // time takes for a character exactly 1 tile, in ms

	this.delayMove = {};
	this.delayMove[floorTypes.path] = 300;
	this.delayMove[floorTypes.grass] = 400;

	this.direction	= directions.up;
	this.sprites = {};
	this.sprites[directions.up]	= new Sprite([{x:0,y:120,w:30,h:30}]);
	this.sprites[directions.right] = new Sprite([{x:0,y:150,w:30,h:30}]);
	this.sprites[directions.down] = new Sprite([{x:0,y:180,w:30,h:30}]);
	this.sprites[directions.left] = new Sprite([{x:0,y:210,w:30,h:30}]);
}

Character.prototype.teleport = function(x, y){
	this.tileFrom = [x,y];
	this.tileTo = [x,y];
	this.position = [((tileWidth*x) + ((tileWidth-this.dimensions[0])/2)),
					 ((tileHeight*y) + ((tileHeight-this.dimensions[1])/2))];	
}

/*
	Takes in the time and returns true if the character 
	is movine, return false if the character is stationary
*/
Character.prototype.processMovement = function(t){
	if(this.tileFrom[0]==this.tileTo[0] && this.tileFrom[1]==this.tileTo[1]){
		return false;
	}

	//make moveSpeed based on the tileType
	var moveSpeed = this.delayMove[tileTypes[mapTileData.map[toIndex(this.tileFrom[0],this.tileFrom[1])].type].floor];

	//check if time taken to move is greater than the time will take to move one block
	if((t-this.timeMoved)>=moveSpeed){
		this.teleport(this.tileTo[0], this.tileTo[1]);

		if(mapTileData.map[toIndex(this.tileTo[0], this.tileTo[1])].eventEnter!=null){
			mapTileData.map[toIndex(this.tileTo[0], this.tileTo[1])].eventEnter(this);
		}

		var tileFloor = tileTypes[mapTileData.map[toIndex(this.tileFrom[0], this.tileFrom[1])].type].floor;

	}else{
		this.position[0] = (this.tileFrom[0]*tileWidth) + ((tileWidth - this.dimensions[0])/2);
		this.position[1] = (this.tileFrom[1]*tileHeight) + ((tileHeight - this.dimensions[1])/2);
	
		//check dimenion that the character is moving in. eg. vertically or horizontally
		//TODO this is limited to moving strictly horzontal or vertical, possibly make it to move in any directions.
		if(this.tileTo[0] != this.tileFrom[0]){
			var diff = (tileWidth / moveSpeed) * (t - this.timeMoved);
			this.position[0]+=(this.tileTo[0]<this.tileFrom[0] ? 0 - diff : diff);
		}
		if(this.tileTo[1] != this.tileFrom[1]){
			var diff = (tileHeight / moveSpeed) * (t - this.timeMoved);
			this.position[1]+=(this.tileTo[1]<this.tileFrom[1] ? 0 - diff : diff);
		}

		this.position[0] = Math.round(this.position[0]);
		this.position[1] = Math.round(this.position[1]);
	}

	return true;
}

Character.prototype.canMoveTo = function(x,y){
	if(x<0||x>=mapWidth||y<0||y>=mapHeight){return false}
	if(typeof this.delayMove[tileTypes[mapTileData.map[toIndex(x,y)].type].floor]==='undefined') { return false; }
	//collision checking for objects
	if(mapTileData.map[toIndex(x,y)].object!=null){
		var o = mapTileData.map[toIndex(x,y)].object;
		if(objectTypes[o.type].collision==objectCollision.solid){
			return false;
		}
	}
	return true;
}
Character.prototype.canMoveUp = function() { return this.canMoveTo(this.tileFrom[0], this.tileFrom[1]-1); };
Character.prototype.canMoveDown = function() { return this.canMoveTo(this.tileFrom[0], this.tileFrom[1]+1); };
Character.prototype.canMoveLeft = function() { return this.canMoveTo(this.tileFrom[0]-1, this.tileFrom[1]); };
Character.prototype.canMoveRight = function() { return this.canMoveTo(this.tileFrom[0]+1, this.tileFrom[1]); };

Character.prototype.moveLeft = function(t) { this.tileTo[0]-=1; this.timeMoved = t; this.direction = directions.left; };
Character.prototype.moveRight = function(t) { this.tileTo[0]+=1; this.timeMoved = t; this.direction = directions.right; };
Character.prototype.moveUp = function(t) { this.tileTo[1]-=1; this.timeMoved = t; this.direction = directions.up; };
Character.prototype.moveDown = function(t) { this.tileTo[1]+=1; this.timeMoved = t; this.direction = directions.down; };


var curMessage = "null", msgTimeTo = 0;

function displaySpeech(context, cx, cy, curTime, msg, msgExpireTime) {
    if(msg==="") return false;
    if(curTime>msgExpireTime) return false;
    var x = cx+this.dimensions[0]+3;//TODO add dynamic dimensions for each player instead of sharing the smae one
    var y = cy-20;
    var maxWidth = 150, lineHeight = 10;

    var words = msg.split(' ');
    var line = '';
    var lineCount = 0;
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lineCount++;
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    lineCount++;

    var y = y-20;
    var rectHeight = lineCount*lineHeight;
    context.fillStyle = 'rgba(30,31,122,0.5)';
    var rectWidth = lineCount!=1 ? maxWidth : context.measureText(msg).width;
    context.fillRect(x,y-lineHeight,rectWidth,rectHeight);

    context.font = '10pt Calibri';
    context.fillStyle = '#FFFFFF';
    var words = msg.split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

Character.prototype.getMessageExpireTime = function () {
    return msgTimeTo;
}

Character.prototype.speak = function(context, curTime){
	if(curTime>msgTimeTo) return false;
	var x = viewport.offset[0]+player.position[0]+this.dimensions[0]+3;
	var y = viewport.offset[1]+player.position[1]-20;
	var maxWidth = 150, lineHeight = 10;

	var words = curMessage.split(' ');
	var line = '';
	var lineCount = 0;
	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
	    lineCount++;
	    line = words[n] + ' ';
	    y += lineHeight;
	  }
	  else {
	    line = testLine;
	  }
	}
	lineCount++;

	var y = viewport.offset[1]+player.position[1]-20;
	var rectHeight = lineCount*lineHeight;
	context.fillStyle = 'rgba(30,31,122,0.5)';
	var rectWidth = lineCount!=1 ? maxWidth : context.measureText(curMessage).width;
	context.fillRect(x,y-lineHeight,rectWidth,rectHeight);

	context.font = '10pt Calibri';
    context.fillStyle = '#FFFFFF';
	var words = curMessage.split(' ');
	var line = '';
	var lineCount = 0;
	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
	    context.fillText(line, x, y);
	    line = words[n] + ' ';
	    y += lineHeight;
	  }
	  else {
	    line = testLine;
	  }
	}
	context.fillText(line, x, y);
}

Character.prototype.addSpeech = function(message, timeReceived){
	curMessage = message;
	msgTimeTo = timeReceived+3800+message.split(' ').length*200;
}

