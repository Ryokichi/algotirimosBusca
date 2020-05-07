class GameScene {
    constructor  () {
        this.children = [];
    }

    addChild (obj)  {
        this.children.push(obj);
    }
    
    draw (context) {
        for (var i = 0; i < this.children.length; i++)  {
            this.children[i].draw(context);
        }
    }
}

class Text {
    constructor(text, size, font) {
        this.text = text || " ";
        this.size = size || 20;
        this.font = font || "monospace";
        this.color = "black";
        this.x = 0;
        this.y = 0;
    }

    setString (text) {
        this.text = text;
    }

    setColor (color) {
        this.color = color;
    }

    setPosition (x, y) {
        this.x = x;
        this.y = y;
    }

    draw (context){
        context.font = this.size + "px " + this.font;
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }
}

class Rect {
    constructor(x,y,largura,altura) {
        this.x = x;
        this.y = y;
        this.w = largura;
        this.h = altura;
    }
}

class Sprite {
    constructor(src, parent) {
        if (parent)
            parent.addChild(this);

        this.image = getLoadedImage(src);

        this.x = 0;
        this.y = 0;
        this.w = this.image.width;
        this.h = this.image.height;
        this.sx = 0;
        this.sy = 0;
        this.sw = this.image.width;
        this.sh = this.image.height;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
        this.is_visible = true;
        this.angle = 0;
        this.scale = 1;
    }

    clippImage(rect) {
        if (rect) {
            this.sx = rect.x;
            this.sy = rect.y;
            this.sw = rect.w;
            this.sh = rect.h;
            this.w = this.sw;
            this.h = this.sh;
        }
    }

    render(context) {
        context.drawImage(
            this.image,
            this.sx, this.sy, this.sw, this.sh, ////retangulo da imagem
            this.x-(this.scale*this.w*this.pivotX),
            this.y-(this.scale*this.h*this.pivotY),
            this.w*this.scale,
            this.h*this.scale
        );
    }

    draw (context) {
        if (!this.is_visible) return;

        if (this.angle != 0) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.translate(-this.x, -this.y);
            this.render(context);
            context.restore();
        } else {
            this.render(context);
        }
    }

    setScale (scale) {
        this.scale = scale;
    }

    getScale () {
        return this.scale;
    }

    setPivotPoint(x, y) {
        this.pivotX = x;
        this.pivotY = y;
    }

    getPivotPoint(x, y) {
       return {x: this.pivotX, y:this.pivotY};
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return {x: this.x, y: this.y}
    }

    setVisible(true_or_false) {
        this.is_visible = true_or_false;
    }

    getVisible() {
        return this.is_visible;
    }

    setRotation(angle) {
        this.angle = angle * Math.PI / 180;
    }

    getRotation() {
        return this.angle * 180 / Math.PI;
    }

    getBoundingBox() {
        var boundingBox = {
            x:this.x-(this.scale*this.w*this.pivotX),
            y:this.y-(this.scale*this.h*this.pivotY),
            w:this.w*this.scale,
            h:this.h*this.scale
        };
        return boundingBox;
    }
}


/////-----------------------------------------/////
class Animation extends Sprite {
    constructor (src, cols, lines, parent) {
        super(src, parent);
        this.name = 'Animation';

        this.fps = 24;
        this.rect = [];
        this.curr_sprite = 0;
        this.range = {ini: 0, end: 0};
        this.cols  = cols  || 1;
        this.lines = lines || 1;

        this.animation_id = 0;
        this.last_time_stamp = 0;
        this.time_playing = 0;


        var w = Math.ceil(this.image.width / this.cols);
        var h = Math.ceil(this.image.height / this.lines);
        for (var i = 0; i < this.lines; i++) {
            for (var j = 0; j < this.cols; j++) {
                this.rect.push({x: w * j, y: h * i, w: w, h: h});
            }
        }
        this.range.end = this.rect.length - 1;
        this.clippImage(this.rect[this.curr_sprite]);
    }

    setFrame (num) {
        this.curr_sprite = num;
        this.clippImage(this.rect[this.curr_sprite]);
    }

    setNewRect(rect){
        this.rect = rect;
        this.range.end = this.rect.length - 1;
    }

    setFps (fps){
        this.fps = fps;
    }

    playAnimation (timeStamp) {
        if (!timeStamp || this.last_time_stamp == 0) {
            this.last_time_stamp = timeStamp || 0;
        }
        else {
            var dt = timeStamp - this.last_time_stamp;
            this.time_playing += dt;



            if (this.time_playing >= (1000/this.fps)) {
                this.time_playing = (this.time_playing > 2*(1000/this.fps)) ? 0 : this.time_playing -= (1000/this.fps);


                console.log(this.curr_sprite, this.range.end);
                if ((this.curr_sprite >= this.range.end)) {
                    this.curr_sprite = this.range.ini;
                }
            }
            this.last_time_stamp = timeStamp;
        }
        this.clippImage(this.rect[this.curr_sprite]);
        this.curr_sprite++;
        this.animation_id = requestAnimationFrame(this.playAnimation.bind(this));
    }

    stopAnimation() {
        this.last_time_stamp = 0;
        this.time_playing    = 0;
        cancelAnimationFrame(this.animation_id);
    }
}

////Animacao de multiplos sprites
class AnimationM extends Animation {
    constructor(srcs,  parent) {
        super(srcs[0], parent);
        this.imgs = srcs;
        this.range.end = this.imgs.length - 1;
    }

    playAnimation(timeStamp) {
        if (!timeStamp || this.last_time_stamp == 0) {
            this.last_time_stamp = timeStamp || 0;
        } else {
            var dt = timeStamp - this.last_time_stamp;
            this.time_playing += dt;

            if (this.time_playing >= (1000 / this.fps)) {
                this.time_playing = (this.time_playing > 2 * (1000 / this.fps)) ? 0 : this.time_playing -= (1000 / this.fps);


                this.curr_sprite++;
                if ((this.curr_sprite >= this.range.end)) {
                    this.curr_sprite = this.range.ini;
                }
            }
            this.last_time_stamp = timeStamp;
        }
        this.changeFrame(this.imgs[this.curr_sprite]);
        this.animation_id = requestAnimationFrame(this.playAnimation.bind(this));
    }

    changeFrame (img){
        this.image = getLoadedImage(img);
    }
}