var context = null; //context element
var tileWidth = 40, tileHeight = 40;
var mapWidth = 20, mapHeight=20;

var currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;
var gameTime = 0;

var mapTileData = new TileMap();
var roofList, gameMap;
var tileset = null, tilesetURL = "http://technologies4.me/examples/gamedev/12-map-objects/tileset.png", tilesetLoaded = false;

var player = new Character(1,1);

var keysDown = {
	37 : false,
	38 : false,
	39 : false,
	40 : false
};

window.onload = function(){
    $.ajax({
        type: 'GET',
        url: '/rawMap',
        data: "",
        async: true,
        beforeSend: function (xhr) {
            if (xhr && xhr.overrideMimeType) {
                xhr.overrideMimeType('application/json;charset=utf-8');
            }
        },
        dataType: 'json',
        success: function (data) {
            roofList = data.roofList;
            gameMap = data.gameMap;

            context = document.getElementById('game').getContext('2d');
            requestAnimationFrame(drawGame);
            context.font = "bold 10pt sans-serif";

            window.addEventListener("keydown", function(e){
                //arrow keys
                if(loggedIn && e.keyCode>=37 && e.keyCode<=40){
                    keysDown[e.keyCode]=true;
                    // webSocket.send()
                }
            });
            window.addEventListener("keyup", function(e){
                //arrow keys
                if(loggedIn && e.keyCode>=37 && e.keyCode<=40){
                    keysDown[e.keyCode]=false;
                }
            });

            viewport.screen = [
                document.getElementById('game').width,
                document.getElementById('game').height
            ];

            tileset = new Image();
            tileset.onerror = function(){
                context = null;
                alert("Failed to load texture pack.");
            };

            tileset.onload = function(){
                tilesetLoaded=true;
            };

            tileset.src = tilesetURL;

            mapTileData.buildMapFromData(gameMap, mapWidth, mapHeight);
            mapTileData.addRoofs(roofList);
            mapTileData.map[((2*mapWidth)+2)].eventEnter = function()
            { console.log("Entered tile 2,2"); };


            //object loading and reading from rawMapData
            objectsList = data.objects;
            for (var i = 0; i < objectsList.length; i++){
                var obj = objectsList[i];
                new MapObject(obj.type).placeAt(obj.x,obj.y);
            }
        }
    });
}

//websocket
var webSocket = new WebSocket("ws://localhost/socket");
var loggedIn = false;
var username;
var players = [];
var message, messageExpireTime;
var serverTime;

webSocket.onmessage = function (data) {
    var rawData = data.data;
    var msg = rawData.split(" ");
    // console.log(jsonData);
    if (msg[0]==="ConnectionSuccess"){
        username = msg[1];
        player.teleport(parseInt(msg[2]),parseInt(msg[3]));
        loggedIn=true;
    }else if(msg[0]==="ConnectionFailure"){
        alert("Login Failure!");
    }else{
        var jsonData = JSON.parse(rawData);
        serverTime = jsonData["serverTime"];
        players=jsonData.players;
        var packet = username+" "+player.position[0]+" "+player.position[1]+" "+player.direction+" "+message+" "+player.getMessageExpireTime();
        webSocket.send(packet);
    }

};
webSocket.onclose = function () { alert("WebSocket connection closed") };

$('form').submit(function () {
    var formdata = decodeURIComponent($('form').serialize().substring(6));
    //command processing
    if(formdata.charAt(0)==='/') {
        webSocket.send(formdata);
    } else { //text message
        if (formdata==="")formdata="!null!";
        player.addSpeech(formdata, serverTime);
        console.log(serverTime);
        message = formdata;
    }
    $('form')[0].reset();
    return false;
});


var playerType = [
    [new Sprite([{x:0,y:120,w:30,h:30}]), new Sprite([{x:0,y:150,w:30,h:30}]), new Sprite([{x:0,y:180,w:30,h:30}]), new Sprite([{x:0,y:210,w:30,h:30}])],
    [new Sprite([{x:0,y:120,w:30,h:30}]), new Sprite([{x:0,y:150,w:30,h:30}]), new Sprite([{x:0,y:180,w:30,h:30}]), new Sprite([{x:0,y:210,w:30,h:30}])]
];