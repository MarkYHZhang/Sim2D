var objectCollision = {
	none : 0,
	solid : 1
}
var objectTypes = {
	1 : {
		name : "Box",
		sprite : new Sprite([{x:40,y:160,w:40,h:40}]),
		offset : [0,0],
		collision : objectCollision.solid,
		zIndex : 1
	},
	2 : {
		name : "Broken Box",
		sprite : new Sprite([{x:40,y:200,w:40,h:40}]),
		offset : [0,0],
		collision : objectCollision.none,
		zIndex : 1
	},
	3 : {
		name : "Tree top",
		sprite : new Sprite([{x:80,y:160,w:80,h:80}]),
		offset : [-20,-20],
		collision : objectCollision.solid,
		zIndex : 3
	}
};
function MapObject(nt){
	this.x		= 0;
	this.y		= 0;
	this.type	= nt;
}
MapObject.prototype.placeAt = function(nx, ny){
	if(mapTileData.map[toIndex(this.x, this.y)].object==this){
		mapTileData.map[toIndex(this.x, this.y)].object = null;
	}
	this.x = nx;
	this.y = ny;	
	mapTileData.map[toIndex(nx, ny)].object = this;
}



var floorTypes = {
	solid	: 0,
	path	: 1,
	water	: 2,
	grass : 3
};
var tileTypes = {
	0 : { colour:"#685b48", floor:floorTypes.solid, sprite:new Sprite([{x:0,y:0,w:40,h:40}])	},
	1 : { colour:"#5aa457", floor:floorTypes.grass,	sprite:new Sprite([{x:40,y:0,w:40,h:40}])	},
	2 : { colour:"#e8bd7a", floor:floorTypes.path,	sprite:new Sprite([{x:80,y:0,w:40,h:40}])	},
	3 : { colour:"#286625", floor:floorTypes.solid,	sprite:new Sprite([{x:120,y:0,w:40,h:40}])	},
	4 : { colour:"#678fd9", floor:floorTypes.water,	sprite:new Sprite([{x:160,y:0,w:40,h:40}])	},
	10 : { colour:"#ccaa00", floor:floorTypes.solid, sprite:new Sprite([{x:40,y:120,w:40,h:40}])},
	11 : { colour:"#ccaa00", floor:floorTypes.solid, sprite:new Sprite([{x:80,y:120,w:40,h:40}])}
};

//tile: x, y, and type
function Tile(tx, ty, tt){
	this.x			= tx;
	this.y			= ty;
	this.type		= tt;
	this.roof		= null;
	this.roofType	= 0;
	this.eventEnter	= null;
	this.object = null;
}
function TileMap(){
	this.map = [];
	this.w = 0;
	this.h = 0;
	this.levels = 5;
}
TileMap.prototype.buildMapFromData = function(d, w, h){
	this.w		= w;
	this.h		= h;
	
	if(d.length!=(w*h)) { return false; }
	
	this.map.length	= 0;
	
	for(var y = 0; y < h; y++)
	{
		for(var x = 0; x < w; x++)
		{
			this.map.push( new Tile(x, y, d[((y*w)+x)]) );
		}
	}
	
	return true;
};
TileMap.prototype.addRoofs = function(roofs){
	for(var i in roofs) {
		var r = roofs[i];
		
		if(r.x < 0 || r.y < 0 || r.x >= this.w || r.y >= this.h ||
			(r.x+r.w)>this.w || (r.y+r.h)>this.h ||
			r.data.length!=(r.w*r.h)) {
			continue;
		}
		
		for(var y = 0; y < r.h; y++) {
			for(var x = 0; x < r.w; x++) {
				var tileIdx = (((r.y+y)*this.w)+r.x+x);
				
				this.map[tileIdx].roof = r;
				this.map[tileIdx].roofType = r.data[((y*r.w)+x)];
			}
		}
	}
};