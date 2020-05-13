let images_to_load = [
    "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png", "num_5.png", "num_6.png", "num_7.png", "num_8.png",
    "num_9.png", "seta.png", "x_sign.png", "circ.png", "origem.png", "destino.png", "btn_go.png", "selection.png"
];

let canvas, context, scene, last_time = 0;
let cursorPos = {x: 0, y: 0};

let mtx_qtd_lin = 2, mtx_qtd_col = 2;
let cell_matrix = [];
let path_matrix = [];
let adj_matrix = {qtd_lin: mtx_qtd_lin, qtd_col: mtx_qtd_col, mtx: []};
let img_mtx_qtd_lin, img_mtx_qtd_col;
let drawing_line = false;
let drawing_line_pos = {x:0, y:0};
let cell_selected = {lin:null, col:null};

let txt_dist_manhatann =  null;

let setas = {
    lin_up: null,
    lin_down: null,
    col_up: null,
    col_down: null,
};

let algorithms =  ["Djikistra", "Kruskal", "Prim"];
let search_type = algorithms[0];
let search_btn = [];
let x_sign, origem, destino, btn_go, btn_seletion;

function loadImagesBeforeInit() {
    let img = new Image();
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


function setNewCanvasSize() {
    let w = window.innerWidth * 0.95;
    let h = window.innerHeight * 0.95;
    let txt = "Window size: width=" + w + ", height=" + h;
    console.log(txt);

    context.setTransform(1, 0, 0, 1, 0, 0);

    let new_w = 1, new_h = 1;
    let is_smaller = ((w/1920) < (h/1080)) ? "w" : "h";
    switch (is_smaller) {
        case "w":
            new_w = w;
            new_h = w/1.7778;
            break;
        default:
            new_w = h*1.778;
            new_h = h;
    }

    context.canvas.width = new_w;
    context.canvas.height = new_h;

    context.scale(new_w/1920, new_h/1080);

    console.log(context.canvas.width, context.canvas.height);
}


function gameInit () {
    canvas = document.getElementById("Canvas");
    context = canvas.getContext("2d");

    scene = new GameScene();

    let text = new Text("Informe as dimensões da Matriz", 25, null, scene);
    text.setPosition(30,30);

    txt_dist_manhatann = new Text("Dist. Manhatann: ", 20, null, scene);
    txt_dist_manhatann.setPosition(30, 200);

    let frames = [
        "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png",
        "num_5.png", "num_6.png", "num_7.png", "num_8.png", "num_9.png",
    ];


    let xi = 25, yi = 70;
    for (let i = 0;  i < algorithms.length; i++) {
        let btn = new Sprite("circ.png", scene);
        btn.setPosition(xi, yi+35*i);
        btn.algorithm = algorithms[i];
        search_btn.push(btn);

        let t = new Text(algorithms[i], 20, null, scene);
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

    img_mtx_qtd_lin = new AnimationM(frames, scene);
    img_mtx_qtd_lin.setFrame(mtx_qtd_lin);
    img_mtx_qtd_lin.setPosition(xi+40, yi);

    x_sign = new Sprite("x_sign.png", scene);
    x_sign.setPosition(xi+80, yi);

    img_mtx_qtd_col = new AnimationM(frames, scene);
    img_mtx_qtd_col.setFrame(mtx_qtd_lin);
    img_mtx_qtd_col.setPosition(xi+120, yi);

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
        draw(dt);
    }
    requestAnimationFrame(scheduleUpdate);
}

function draw (dt) {
    context.clearRect(0,0,canvas.width, canvas.height);

    if (mtx_qtd_lin > 0  &&  mtx_qtd_col > 0) {
        for (let i = 0; i  < mtx_qtd_lin; i++) {
            for (let j = 0; j  < mtx_qtd_col; j++) {
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

    for (let i = 0; i < path_matrix.length; i++) {
        let pos_i, pos_d;

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
    printAdjMatrix();
}

function printAdjMatrix() {
    context.font = "8px monospace";

    let txt;
    for (let i = 0; i < adj_matrix.mtx.length; i++) {
        context.fillStyle = "black";
        context.fillText(parseInt(i/adj_matrix.qtd_lin)+"x"+(i%adj_matrix.qtd_lin), 700-21, 230+15*i);
        for (let j = 0; j < adj_matrix.mtx[i].length; j++) {
            context.fillStyle = "black";
            if (i == j) {
                context.fillText(
                    "|"+Math.floor(i/adj_matrix.qtd_lin)+"x"+(j%adj_matrix.qtd_lin),
                    700+21*j,
                    230-15);
            }

            txt = adj_matrix.mtx[i][j];
            if (typeof txt == "number") {
                if (txt != Infinity) {
                    context.fillStyle = (txt==0)? "blue":"red";
                    txt = txt.toFixed(2);
                }
                else {
                    txt = "Inf";
                }
            }
            else {
                txt = " "
            }

            context.fillText("|"+txt, 700+21*j, 230+15*i);
        }
    }
}

function mousePressed(e) {
    console.log(cursorPos);
    for (let seta in setas) {
        if (rectContainsPoint(setas[seta].getBoundingBox(), cursorPos)) {
            setaClicada(seta);
            resetAllData();
        }
    }

    origem.selecionado = (rectContainsPoint(origem.getBoundingBox(), cursorPos));
    destino.selecionado = (rectContainsPoint(destino.getBoundingBox(), cursorPos));

    if (!origem.selecionado  && !destino.selecionado) {
        for (let i = 0; i < cell_matrix.length; i++) {
            for (let j = 0; j < cell_matrix[i].length; j++) {
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

    for (let i = 0; i < search_btn.length; i++) {
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
        for (let i = 0; i < cell_matrix.length; i++) {
            for (let j = 0; j < cell_matrix[i].length; j++) {
                if (rectContainsPoint(cell_matrix[i][j].getBoundingBox(), getCursorPos())) {
                    let adicionado = addPointsToPath(cell_selected.lin, cell_selected.col, i, j);
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

    let ja_existe = false;
    for (let i = 0; i < path_matrix.length && !ja_existe; i++)  {
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

    let on_cell = false;
    for (let i = 0; i < cell_matrix.length && !on_cell; i++) {
        for (let j = 0; j < cell_matrix[i].length && !on_cell; j++) {
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
            if (mtx_qtd_lin < 9) {
                mtx_qtd_lin ++;
            }
            break;
        case "lin_down":
            if (mtx_qtd_lin > 2) {
                mtx_qtd_lin --;
            }
            break;
        case "col_up":
            if (mtx_qtd_col < 9) {
                mtx_qtd_col ++;
            }
            break;
        case "col_down":
            if (mtx_qtd_col > 2) {
                mtx_qtd_col --;
            }
            break;
    }

    img_mtx_qtd_lin.setFrame(mtx_qtd_lin);
    img_mtx_qtd_col.setFrame(mtx_qtd_col);

    generateMatrix();
}

function generateMatrix () {
    cell_matrix = [];

    for (let i = 0; i  < mtx_qtd_lin; i++) {
        cell_matrix[i] = [];
        for (let j = 0; j  < mtx_qtd_col; j++) {
            cell_matrix[i][j] = new Sprite("circ.png");
            cell_matrix[i][j].setPosition(30+64*j, 240+64*i);
        }
    }
}

function resetAllData () {
    console.log("Limpando todos dados");

    origem.selecionado = false;
    origem.cel.lin = 0;
    origem.cel.col = 0;
    origem.setPosition(origem.ini_pos.x, origem.ini_pos.y);

    destino.selecionado = false;
    destino.cel.lin = 0;
    destino.cel.col = 0;
    destino.setPosition(destino.ini_pos.x, destino.ini_pos.y);

    path_matrix = [];
    adj_matrix = {
        qtd_lin: 0,
        qtd_col: 0,
        mtx: []
    };
}

function remontaMatrizAdjacencia(){
    console.log("--");
    let size = mtx_qtd_lin * mtx_qtd_col;
    adj_matrix = {
        qtd_lin: mtx_qtd_lin,
        qtd_col: mtx_qtd_col,
        mtx: []
    };

    ////Monta matriz triangular superior
    for (let lin = 0; lin < size; lin++) {
        adj_matrix.mtx[lin] = [];
        for (let col = lin; col < size; col++) {
            adj_matrix.mtx[lin][col] = (lin == col) ? 0 : Infinity;
        }
    }


    //// Analiza as ligações, calcula seu peso e se um vertice estiver "abaixo" na matriz triangular é feita a troca
    //// de coordenadas e enviado para a parte de cima
    let ini_lin, ini_col, dest_lin, dest_col, val;
    let coord_l = 0, coord_c = 0;
    for (let i = 0; i < path_matrix.length; i++) {
        ini_lin  = path_matrix[i].ini_lin;
        ini_col  = path_matrix[i].ini_col;
        dest_lin = path_matrix[i].dest_lin;
        dest_col = path_matrix[i].dest_col;
        val = distManhattan({x:ini_lin, y:ini_col}, {x:dest_lin, y:dest_col});

        console.log(ini_lin+":"+ini_col+" | "+dest_lin+":"+dest_col);
        console.log((ini_lin*mtx_qtd_lin + ini_col),(dest_lin*mtx_qtd_lin + dest_col));

        let greater = ((ini_lin*mtx_qtd_lin + ini_col) > (dest_lin*mtx_qtd_lin + dest_col));
        if (greater) {
            coord_l = mtx_qtd_lin * dest_lin + dest_col;
            coord_c = mtx_qtd_lin * ini_lin + ini_col;
        }
        else {
            coord_l = mtx_qtd_lin * ini_lin + ini_col;
            coord_c = mtx_qtd_lin * dest_lin + dest_col;
        }

        adj_matrix.mtx[coord_l][coord_c] = val;
    }
    console.log(adj_matrix);
}

function distManhattan(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x-pointB.x, 2) + Math.pow(pointA.y-pointB.y, 2));
}

