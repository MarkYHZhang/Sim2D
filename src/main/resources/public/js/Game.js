//map scaling to keep track of the view section aka camera
var viewport = {
    screen : [0,0], // dimension of the canvas element
    startTile : [0,0], // top left tile that is visible (index not pixel)
    endTile : [0,0], // bottom right tile that is visible (index not pixel)
    offset : [0,0], //the x and y pixel offset from the center of the screen in which objects will be drawn
    update : function(px, py){
        this.offset[0] = Math.floor((this.screen[0]/2)-px);
        this.offset[1] = Math.floor((this.screen[1]/2)-py);

        var tile = [Math.floor(px/tileWidth),Math.floor(py/tileHeight)];

        this.startTile[0] = tile[0] - 1 - Math.ceil((this.screen[0]/2)/tileWidth);
        this.startTile[1] = tile[1] - 1 - Math.ceil((this.screen[1]/2)/tileHeight);
        if(this.startTile[0] < 0){this.startTile[0]=0;}
        if(this.startTile[1] < 0){this.startTile[1]=0;}

        this.endTile[0] = tile[0] + 1 + Math.ceil((this.screen[0]/2)/tileWidth);
        this.endTile[1] = tile[1] + 1 + Math.ceil((this.screen[1]/2)/tileHeight);
        if(this.endTile[0] >= mapWidth){this.endTile[0] = mapWidth-1;}
        if(this.endTile[1] >= mapHeight){this.endTile[1] = mapHeight-1;}
    }
}

//converts pixel x and y to the pixel index
function toIndex(x,y){
    return ((y*mapWidth)+x);
}

function drawGame(){
    //if context still null, do nothing
    if(context==null) {return;}
    if(!tilesetLoaded) {requestAnimationFrame(drawGame);}

    var currentFrameTime = Date.now();
    var timeElapsed = currentFrameTime - lastFrameTime;

    //FPS handling
    var sec = Math.floor(Date.now()/1000);
    if(sec!=currentSecond){
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }else{
        frameCount++;
    }

    //movement processing with collision and bound check
    //upward, downward, left, and right movement checks respectively in order.
    if(!player.processMovement(currentFrameTime)) {
        if(keysDown[38] && player.canMoveUp())		{ player.moveUp(currentFrameTime); }
        else if(keysDown[40] && player.canMoveDown())	{ player.moveDown(currentFrameTime); }
        else if(keysDown[37] && player.canMoveLeft())	{ player.moveLeft(currentFrameTime); }
        else if(keysDown[39] && player.canMoveRight())	{ player.moveRight(currentFrameTime); }
    }

    //update viewport centre position
    viewport.update(player.position[0] + player.dimensions[0]/2, player.position[1] + player.dimensions[1]/2);

    var playerRoof1 = mapTileData.map[toIndex(
        player.tileFrom[0], player.tileFrom[1])].roof;
    var playerRoof2 = mapTileData.map[toIndex(
        player.tileTo[0], player.tileTo[1])].roof;

    context.fillStyle = "#000000";
    context.fillRect(0,0,viewport.screen[0],viewport.screen[1]);

    //object/layer drawing
    for(var z = 0; z < mapTileData.levels; z++){
        //tiles drawing for map
        for (var y = viewport.startTile[1]; y <= viewport.endTile[1]; y++) {
            for (var x = viewport.startTile[0]; x <= viewport.endTile[0]; x++) {
                //if the number of layers/objects is nothing, then just draw the floor
                if(z==0){
                    //texture handling with sprites
                    tileTypes[mapTileData.map[toIndex(x,y)].type].sprite.draw(
                        gameTime,
                        viewport.offset[0] + (x*tileWidth),
                        viewport.offset[1] + (y*tileHeight));
                }

                //if there is objects or layers, and that we are currently drawing the layer that contains the object.
                var o = mapTileData.map[toIndex(x,y)].object;
                if(o!=null && objectTypes[o.type].zIndex==z){
                    var ot = objectTypes[o.type];

                    ot.sprite.draw(gameTime,
                        viewport.offset[0] + (x*tileWidth) + ot.offset[0],
                        viewport.offset[1] + (y*tileHeight) + ot.offset[1]);
                }

                //only draw roof, if the layer is 2
                if(z==4 && mapTileData.map[toIndex(x,y)].roofType!=0 && mapTileData.map[toIndex(x,y)].roof!=playerRoof1 && mapTileData.map[toIndex(x,y)].roof!=playerRoof2){
                    tileTypes[mapTileData.map[toIndex(x,y)].roofType].sprite.draw(
                        gameTime,
                        viewport.offset[0] + (x*tileWidth),
                        viewport.offset[1] + (y*tileHeight));
                }
                // //texture handling of pure color rectangles
                // context.fillStyle = tileTypes[gameMap[toIndex(x,y)]].colour;

                // context.fillRect(viewport.offset[0]+x*tileWidth, viewport.offset[1]+y*tileHeight, tileWidth, tileHeight);
            }
        }
        //only draw character when we are draying layer 1
        if(z===1){
            //character sprite drawing
            player.sprites[player.direction].draw(
                gameTime,
                viewport.offset[0] + player.position[0],
                viewport.offset[1] + player.position[1]);

        }else if(z===3){
            player.speak(context, currentFrameTime);
        }


        if(players.length!==0) {
            for (var i = 0; i < players.length; i++) {
                var curPlayer = players[i];
                if(curPlayer.username===username)continue;
                if (z === 1) {
                    playerType[curPlayer.type][curPlayer.direction].draw(gameTime,
                        curPlayer.x, curPlayer.y);
                } else if (z === 3) {
                    displaySpeech(context, curPlayer.x, curPlayer.y, serverTime, curPlayer.message, curPlayer.messageExpireTime);
                }
            }
        }
    }
    // pure color block
    // context.fillStyle = "#0000ff";
    // context.fillRect(viewport.offset[0]+player.position[0], viewport.offset[1]+player.position[1], player.dimensions[0], player.dimensions[1]);

    context.fillStyle = "#ff0000";
    context.fillText("FPS: " + framesLastSecond, 10, 20);

    lastFrameTime = currentFrameTime;
    requestAnimationFrame(drawGame);
}