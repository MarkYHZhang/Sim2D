function Sprite(data){
	this.animated	= data.length > 1;
	this.frameCount	= data.length;
	this.duration	= 0;
	this.loop		= true;

	//if there are more than one frame for the sprite
	if(data.length > 1){
		//loop through them
		for(var i in data){
			//check for duration, if not set 100ms
			if(typeof data[i].d=='undefined'){
				data[i].d = 100;
			}
			this.duration+= data[i].d;

			//check if it has loop property
			if(typeof data[i].loop!='undefined'){
				this.loop = data[i].loop ? true : false;
			}
		}
	}
	this.frames	= data;
}
//calculate for which frame to draw at where based on: time, x, and y
Sprite.prototype.draw = function(t, x, y){
	var frameIdx = 0;
	//If the sprite is animated but does not loop, and the t value is greater than or equal to the duration of the sprite, we'll simply select the last frame
	if(!this.loop && this.animated && t>=this.duration){
		frameIdx = (this.frames.length - 1);
	}else if(this.animated){
		t = t % this.duration;
		var totalD = 0; //temp variable that stores the time at which each frame ends
		//looping through the frames for the sprite and find out which frame to draw
		for(var i in this.frames){
			totalD += this.frames[i].d;
			frameIdx = i;
			if(t<=totalD){
				break;
			}
		}
	}

	//gets offset if it exist, other wise just use [0,0]
	var offset = (typeof this.frames[frameIdx].offset=='undefined' ?
		[0,0] : this.frames[frameIdx].offset);

	//draws the sprite
	context.drawImage(tileset,
		this.frames[frameIdx].x, this.frames[frameIdx].y,
		this.frames[frameIdx].w, this.frames[frameIdx].h,
		x + offset[0], y + offset[1],
		this.frames[frameIdx].w, this.frames[frameIdx].h);
}