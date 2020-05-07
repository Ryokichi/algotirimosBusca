var canvas, context, scene, last_time = 0;
var img_list = [
    "num_0.png",
    "seta.png"
];


function gameInit () {
    canvas = document.getElementById("Canvas");
    context = canvas.getContext("2d");
    scene = new GameScene();

    var text =  new Text("", scene);
    
    var num_0 = new Sprite("num_0.png", scene);
    num_0.setPosition(30, 60);    

    
    requestAnimationFrame(scheduleUpdate);
}

function scheduleUpdate (timestamp) {    
    if (timestamp) {        
        dt = (timestamp - last_time) / 1000;
        last_time = timestamp;
        update(dt);
    }
    requestAnimationFrame(scheduleUpdate);
}

function update (dt) {
    scene.draw(context);
}

function mousePressed(e) {
    console.log(e);    
}

function mouseReleased (e) {
    console.log(e);    
} 

function mouseHover (e) {
    
}

function loadImagesBeforeInit() {
    var img = new Image();
    img.src = "res/images/" + img_list[0];
    img.spriteName = img_list[0];
    img.onload = function () {
        loadedImages.push(img);
        img_list.shift();
        if (img_list.length > 0) {
            loadImagesBeforeInit();
        }
        else {
            gameInit();
        }
    };
}