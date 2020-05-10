var images_to_load = [
    "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png", "num_5.png", "num_6.png", "num_7.png", "num_8.png",
    "num_9.png", "seta.png", "x_sign.png", "circ.png", "origem.png", "destino.png", "btn_go.png", "selection.png"
];

var canvas, context, scene, last_time = 0;
var cursorPos = {x: 0, y: 0};

var cell_matrix = [];
var adj_matrix = [];
var path_matrix = [];
var mtx_lin = 2, mtx_col = 2;
var img_mtx_lin, img_mtx_col;
var drawing_line = false;
var drawing_line_pos = {x:0, y:0};
var cell_selected = {lin:null, col:null};

var setas = {
    lin_up: null,
    lin_down: null,
    col_up: null,
    col_down: null,
};

var algorithms =  ["Djikistra", "Kruskal", "Prim"];
var search_type = algorithms[0];
var search_btn = [];
var x_sign, origem, destino, btn_go, btn_seletion;

function gameInit () {
    canvas = document.getElementById("Canvas");
    context = canvas.getContext("2d");
    scene = new GameScene();

    var text = new Text("Informe as dimensões da Matriz", 25, null, scene);
    text.setPosition(30,30);

    var frames = [
        "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png",
        "num_5.png", "num_6.png", "num_7.png", "num_8.png", "num_9.png",
    ];


    var xi = 25, yi = 70;
    for (var i = 0;  i < algorithms.length; i++) {
        var btn = new Sprite("circ.png", scene);
        btn.setPosition(xi, yi+35*i);
        btn.algorithm = algorithms[i];
        search_btn.push(btn);

        var t = new Text(algorithms[i], 20, null, scene);
        t.setPosition(xi+15, yi+5+35*i);
    }

    btn_seletion = new Sprite("selection.png", scene);
    btn_seletion.setPosition(xi, yi);


    ////------ Itens da selecao tamanho da matriz -----////
    xi = 240; yi = 100;
    setas.lin_up = new Sprite("seta.png",  scene);
    setas.lin_up.setPosition(xi, yi-20);

    setas.lin_down = new Sprite("seta.png",  scene);
    setas.lin_down.setPosition(xi, yi+20);
    setas.lin_down.setRotation(180);

    img_mtx_lin = new AnimationM(frames, scene);
    img_mtx_lin.setFrame(mtx_lin);
    img_mtx_lin.setPosition(xi+40, yi);

    x_sign = new Sprite("x_sign.png", scene);
    x_sign.setPosition(xi+80, yi);

    img_mtx_col = new AnimationM(frames, scene);
    img_mtx_col.setFrame(mtx_lin);
    img_mtx_col.setPosition(xi+120, yi);

    setas.col_up = new Sprite("seta.png",  scene);
    setas.col_up.setPosition(xi+160, yi-20);

    setas.col_down = new Sprite("seta.png",  scene);
    setas.col_down.setPosition(xi+160, yi+20);
    setas.col_down.setRotation(180);

    btn_go = new Sprite("btn_go.png", scene);
    btn_go.setPosition(xi+240, yi);

    ////------ Itens da selecao tamanho da matriz -----////


    ////----- Objetos origem e Destino ----/////
    xi = 600; yi = 120;

    destino = new Sprite("destino.png", scene);
    destino.setPivotPoint(0.5, 1);
    destino.setPosition(xi, yi);
    destino.ini_pos = {x:xi, y:yi};
    destino.selecionado = false;
    destino.cel = {l:0, c:0};

    origem = new Sprite("origem.png", scene);
    origem.setPivotPoint(0.5, 1);
    origem.setPosition(xi+60, yi);
    origem.ini_pos = {x:xi+60, y:yi};
    origem.selecionado = false;
    origem.cel = {lin:0, col:0};
    ////----- Objetos origem e Destino ----/////


    generateMatrix();
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
    context.clearRect(0,0,canvas.width, canvas.height);

    if (mtx_lin > 0  &&  mtx_col > 0) {
        for (var i = 0; i  < mtx_lin; i++) {
            for (var j = 0; j  < mtx_col; j++) {
                cell_matrix[i][j].draw(context);
            }
        }
    }

    if (drawing_line) {
        context.beginPath();
        context.moveTo(drawing_line_pos.x, drawing_line_pos.y);
        context.lineTo(cursorPos.x, cursorPos.y);
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
        context.stroke();
    }

    for (var i = 0; i < path_matrix.length; i++) {
        var pos_i, pos_d;

        pos_i = cell_matrix[path_matrix[i].ini_lin][path_matrix[i].ini_col].getPosition();
        pos_d = cell_matrix[path_matrix[i].dest_lin][path_matrix[i].dest_col].getPosition();

        context.beginPath();
        context.moveTo(pos_i.x, pos_i.y);
        context.lineTo(pos_d.x, pos_d.y);
        context.lineWidth = 5;
        context.strokeStyle = "#FF0000";
        context.stroke();
    }

    scene.draw(context);
}

function mousePressed(e) {
    console.log(cursorPos);
    for (var seta in setas) {
        if (rectContainsPoint(setas[seta].getBoundingBox(), cursorPos)) {
            setaClicada(seta);
            resetAllData();
        }
    }

    origem.selecionado = (rectContainsPoint(origem.getBoundingBox(), cursorPos));
    destino.selecionado = (rectContainsPoint(destino.getBoundingBox(), cursorPos));

    if (!origem.selecionado  && !destino.selecionado) {
        for (var i = 0; i < cell_matrix.length; i++) {
            for (var j = 0; j < cell_matrix[i].length; j++) {
                if (rectContainsPoint(cell_matrix[i][j].getBoundingBox(), getCursorPos())) {
                    drawing_line = true;
                    drawing_line_pos.x = cell_matrix[i][j].x;
                    drawing_line_pos.y = cell_matrix[i][j].y;
                    cell_selected.lin = i;
                    cell_selected.col = j;
                }
            }
        }
    }

    for (var i = 0; i < search_btn.length; i++) {
        if (rectContainsPoint(search_btn[i].getBoundingBox(), cursorPos)) {
            search_type = search_btn[i].algorithm;
            btn_seletion.setPosition(search_btn[i].x, search_btn[i].y);
        }
    }
}

function mouseReleased (e) {
    checkIfDroppedOnCell(origem);
    checkIfDroppedOnCell(destino);

    if (drawing_line) {
        for (var i = 0; i < cell_matrix.length; i++) {
            for (var j = 0; j < cell_matrix[i].length; j++) {
                if (rectContainsPoint(cell_matrix[i][j].getBoundingBox(), getCursorPos())) {
                    var adicionado = addPointsToPath(cell_selected.lin, cell_selected.col, i, j);
                    if (adicionado)
                        remontaMatrizAdjacencia();
                }
            }
        }

        drawing_line = false;
        drawing_line_pos.x = 0;
        drawing_line_pos.y = 0;
    }

    cell_selected.lin = null;
    cell_selected.col = null;
}

function addPointsToPath(ini_lin, ini_col, dest_lin, dest_col) {
    if (typeof (ini_lin) !== "number" || typeof (ini_col) !== "number"
        || typeof (dest_lin) !== "number"  || typeof (dest_col) !== "number")
    {
        console.log("Os dados enviados nem são pontos");
        return false;
    }

    if (Math.abs(ini_lin - dest_lin) >  1 || Math.abs(ini_col - dest_col) >  1) {
        console.log("Os pontos estão muito distantes");
        return false;
    }

    var ja_existe = false;
    for (var i = 0; i < path_matrix.length && !ja_existe; i++)  {
        ja_existe = (
            path_matrix[i].ini_lin  === ini_lin &&
            path_matrix[i].ini_col  === ini_col &&
            path_matrix[i].dest_lin === dest_lin &&
            path_matrix[i].dest_col === dest_col
        )
    }

    if (!ja_existe) {
        path_matrix.push({
                "ini_lin": ini_lin,
                "ini_col": ini_col,
                "dest_lin": dest_lin,
                "dest_col": dest_col,
            });
    }

    return (!ja_existe);
}

function checkIfDroppedOnCell (objeto) {
    if (!objeto.selecionado) return;

    var on_cell = false;
    for (var i = 0; i < cell_matrix.length && !on_cell; i++) {
        for (var j = 0; j < cell_matrix[i].length && !on_cell; j++) {
            if (objeto.selecionado) {
                if (rectContainsPoint(cell_matrix[i][j].getBoundingBox(), objeto.getPosition())) {
                    objeto.setPosition(cell_matrix[i][j].x, cell_matrix[i][j].y);
                    objeto.cel.lin = i;
                    objeto.cel.col = j;
                    on_cell = true;
                }
            }
        }
    }

    if (!on_cell) {
        objeto.cel.lin = 0;
        objeto.cel.col = 0;
        objeto.setPosition(objeto.ini_pos.x, objeto.ini_pos.y);
    }

    objeto.selecionado = false;
}

function mouseHover (e) {
    setCursorPos(e);

    if (origem.selecionado) {
        origem.setPosition(cursorPos.x, cursorPos.y);
    }

    if (destino.selecionado) {
        destino.setPosition(cursorPos.x, cursorPos.y);
    }
}

function setCursorPos (e) {
    cursorPos.x = e.offsetX;
    cursorPos.y = e.offsetY;
}

function getCursorPos () {
    return  cursorPos;
}

function setaClicada (seta) {
    switch (seta) {
        case "lin_up":
            if (mtx_lin < 9) {
                mtx_lin ++;
            }
            break;
        case "lin_down":
            if (mtx_lin > 2) {
                mtx_lin --;
            }
            break;
        case "col_up":
            if (mtx_col < 9) {
                mtx_col ++;
            }
            break;
        case "col_down":
            if (mtx_col > 2) {
                mtx_col --;
            }
            break;
    }

    img_mtx_lin.setFrame(mtx_lin);
    img_mtx_col.setFrame(mtx_col);

    generateMatrix();
}

function generateMatrix () {
    cell_matrix = [];

    for (var i = 0; i  < mtx_lin; i++) {
        cell_matrix[i] = [];
        for (var j = 0; j  < mtx_col; j++) {
            cell_matrix[i][j] = new Sprite("circ.png");
            cell_matrix[i][j].setPosition(448+64*j, 200+64*i);
        }
    }
}

function resetAllData () {
    origem.selecionado = false;
    origem.cel.lin = 0;
    origem.cel.col = 0;
    origem.setPosition(origem.ini_pos.x, origem.ini_pos.y);

    destino.selecionado = false;
    destino.cel.lin = 0;
    destino.cel.col = 0;
    destino.setPosition(destino.ini_pos.x, destino.ini_pos.y);

    path_matrix = [];
    adj_matrix  = [];
}

function remontaMatrizAdjacencia(){
    for (var i = 0; i < cell_matrix.length; i++) {
        adj_matrix[i] = [];
        for (var j = i; j < cell_matrix[i].length; j++) {

            var val = null;
            for (var k = 0; k < path_matrix.length && val==null; k++) {

                console.log(path_matrix[k]);
                if (path_matrix[k].dest_lin == i && path_matrix[k].dest_col == j) {
                    val = "-"
                }
            }
            adj_matrix[i][j] = val
        }
    }
    console.log(adj_matrix);
}

function loadImagesBeforeInit() {
    var img = new Image();
    img.src = "res/images/" + images_to_load[0];
    img.spriteName = images_to_load[0];
    img.onload = function () {
        loadedImages.push(img);
        images_to_load.shift();
        if (images_to_load.length > 0) {
            loadImagesBeforeInit();
        }
        else {
            gameInit();
        }
    };
}