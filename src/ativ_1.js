let images_to_load = [
    "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png", "num_5.png", "num_6.png", "num_7.png", "num_8.png",
    "num_9.png", "seta.png", "x_sign.png", "circ.png", "origem.png", "destino.png", "btn_go.png", "selection.png"
];

let canvas, context, scene, last_time = 0;
let cursorPos = {x: 0, y: 0};
let input_travado = true;
let animando_caminho = false;
let vetor_caminho = null;

let mtx_qtd_lin = 6, mtx_qtd_col = 6;
let cell_matrix = [];
let path_matrix = [];
let adj_matrix = [];
let img_mtx_qtd_lin, img_mtx_qtd_col;
let drawing_line = false;
let drawing_line_pos = {x:0, y:0};
let cell_selected = {lin:null, col:null};
let ultima_coordena = null;

let txt_dist_manhatann =  null;
let txt_dist_efetiva   =  null;

let setas = {
    lin_up: null,
    lin_down: null,
    col_up: null,
    col_down: null,
};

// let algorithms = ["Djikstra", "Kruskal", "Prim"];  ///Deu errado essa ideia
let algorithms = ["PathFinding"];
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

    let text = new Text("1 - Informe as dimensões da Matriz clicando nas setas", 20, null, scene);
    text.setPosition(30,30);
    text = new Text("2 - Clique e arraste de um Nó para outro afim de traçar caminhos", 20, null, scene);
    text.setPosition(30,55);
    text = new Text("3 - Coloque o jovem mancebo para indicar a origem e a casa para indicar o destino", 20, null, scene);
    text.setPosition(30,80);
    text = new Text("4 - Clique sobre o botão \"GO\" para rodar o algoritmo de PathFinding onde F(n)=G(n)+H\'(n)", 20, null, scene);
    text.setPosition(30,105);
    text = new Text("5 - Não seguir essa ordem de ações pode trazer resultados inesperados", 20, null, scene);
    text.setPosition(30,130);

    txt_dist_manhatann = new Text("Dist. Manhatann: ", 20, null, scene);
    txt_dist_manhatann.setPosition(30, 240);
    txt_dist_efetiva = new Text("Dist. Efetiva  : ", 20, null, scene);
    txt_dist_efetiva.setPosition(30, 260);

    let frames = [
        "num_0.png", "num_1.png", "num_2.png", "num_3.png", "num_4.png",
        "num_5.png", "num_6.png", "num_7.png", "num_8.png", "num_9.png",
    ];


    let xi = 25, yi = 170;
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
    xi = 500; yi = 180;
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
    xi = 360; yi = 190;

    destino = new Sprite("destino.png", scene);
    destino.setPivotPoint(0.5, 1);
    destino.setPosition(xi + 60, yi);
    destino.ini_pos = {x:xi + 60, y:yi};
    destino.selecionado = false;
    destino.cel = {lin:0, col:0};
    destino.on_cell = false;

    origem = new Sprite("origem.png", scene);
    origem.setPivotPoint(0.5, 1);
    origem.setPosition(xi, yi);
    origem.ini_pos = {x:xi, y:yi};
    origem.selecionado = false;
    origem.cel = {lin:0, col:0};
    origem.on_cell = false;
    ////----- Objetos origem e Destino ----/////


    generateMatrix();
    requestAnimationFrame(scheduleUpdate);
    input_travado = false;
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

    if (vetor_caminho != null && vetor_caminho.length > 0) {
        let dist_percorrida = 0;
        let txt_coordenadas = "";
        
        txt_dist_efetiva.setString("Dist. Efetiva  : " + vetor_caminho[0].f.toFixed(4));

        for (let i = 0; i < vetor_caminho.length-1; i++) {
            let lin_i = vetor_caminho[i].coord.lin;
            let col_i = vetor_caminho[i].coord.col;
            let lin_d = vetor_caminho[i+1].coord.lin;
            let col_d = vetor_caminho[i+1].coord.col;

            pos_i = cell_matrix[lin_i][col_i].getPosition();
            pos_d = cell_matrix[lin_d][col_d].getPosition();

            context.beginPath();
            context.moveTo(pos_i.x, pos_i.y);
            context.lineTo(pos_d.x, pos_d.y);
            context.lineWidth = 5;
            context.strokeStyle = "#00FF00";
            context.stroke()
            
            txt_coordenadas = " | "+lin_i+"x"+col_i + txt_coordenadas;
        }
        let k = vetor_caminho.length-1;
        let lin_i = vetor_caminho[k].coord.lin;
        let col_i = vetor_caminho[k].coord.col;
        txt_coordenadas = lin_i+"x"+col_i + txt_coordenadas;

        context.font = "12px monospace";
        context.fillStyle = "#000000";
        context.fillText("Caminho:"+ txt_coordenadas, 30, 820);
    }

    scene.draw(context);
    printAdjMatrix();
}

function printAdjMatrix() {
    context.font = "10px monospace";
    let x = 700, y = 270;
    let txt;

    for (let i = 0; i < adj_matrix.length; i++) {
        context.fillStyle = "black";
        context.fillText(parseInt(i/mtx_qtd_col)+"x"+(i%mtx_qtd_col), x-21, y+15*i);

        for (let j = 0; j < adj_matrix[i].length; j++) {
            context.fillStyle = "black";
            if (i == j) {
                txt = "|"+Math.floor(i/mtx_qtd_col)+"x"+(j%mtx_qtd_col);
                context.fillText(txt, x+21*j, y-15);
            }

            txt = adj_matrix[i][j];                        
            if (typeof txt == "number") {
                if (txt != Infinity) {
                    context.fillStyle = (txt==0)? "blue":"red";
                    txt = txt.toFixed(1);
                }
                else {
                    txt = "Inf";
                }
            }

            context.fillText("|"+txt, x+21*j, y+15*i);
        }        
    }
}

function mousePressed(e) {
    if (input_travado)
        return;

    // console.log(cursorPos);
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
    
    if (rectContainsPoint(btn_go.getBoundingBox(),  cursorPos)) {
        // switch (search_type) {
        //     case "Djikstra":
        //         vetor_camanho = Djikstra(adj_matrix);
        //         break;

        //     case "Kruskal":
        //         vetor_camanho = Kruskal(adj_matrix);
        //         break;

        //     case "Prim":
        //         vetor_camanho = Prim(adj_matrix);
        // }

        input_travado = true;
        alg_busca     = new PathFinding();
        retorno = alg_busca.retornaCaminho(adj_matrix, origem.cel, destino.cel, {lin: mtx_qtd_lin, col: mtx_qtd_col});
        vetor_caminho = retorno.caminho;
        input_travado = false;
    }
}

function mouseReleased (e) {
    checkIfDroppedOnCell(origem);
    checkIfDroppedOnCell(destino);
    calculaManhatann();

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
        ja_existe = ((
            path_matrix[i].ini_lin  === ini_lin &&
            path_matrix[i].ini_col  === ini_col &&
            path_matrix[i].dest_lin === dest_lin &&
            path_matrix[i].dest_col === dest_col
        ) || 
        (
            path_matrix[i].ini_lin  === dest_lin &&
            path_matrix[i].ini_col  === dest_col &&
            path_matrix[i].dest_lin === ini_lin &&
            path_matrix[i].dest_col === ini_col
        ));
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
                    objeto.on_cell = true;
                    on_cell = true;
                }
            }
        }
    }

    if (!on_cell) {
        objeto.cel.lin = 0;
        objeto.cel.col = 0;
        objeto.on_cell = false;
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
            if (mtx_qtd_lin < 6) {
                mtx_qtd_lin ++;
            }
            break;
        case "lin_down":
            if (mtx_qtd_lin > 2) {
                mtx_qtd_lin --;
            }
            break;
        case "col_up":
            if (mtx_qtd_col < 6) {
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

    for (let i = 0; i < mtx_qtd_lin; i++) {
        cell_matrix[i] = [];
        for (let j = 0; j  < mtx_qtd_col; j++) {
            cell_matrix[i][j] = new Sprite("circ.png");
            cell_matrix[i][j].setPosition(30+64*j, 300+64*i);
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
    adj_matrix = [];
    vetor_caminho = null;
    ultima_coordena = null;

    txt_dist_efetiva.setString("Dist. Efetiva  : ----");
}

function remontaMatrizAdjacencia ()  {
    let size = mtx_qtd_lin * mtx_qtd_col;

    adj_matrix = [];

    for (var lin = 0; lin < size; lin++) {
        adj_matrix[lin] = [];
        for (var col = 0; col <= lin; col++) {
            adj_matrix[lin][col] = (lin == col) ? 0 : Infinity
        }
    }

    // //// Analiza as ligações, calcula seu peso e se um vertice estiver "acima" na matriz triangular é feita a troca
    // //// de coordenadas e enviado para a parte de cima
    let ini_lin, ini_col, dest_lin, dest_col, val;
    let coord_l = 0, coord_c = 0;

    for (let i = 0; i < path_matrix.length; i++) {
        ini_lin  = path_matrix[i].ini_lin;
        ini_col  = path_matrix[i].ini_col;
        dest_lin = path_matrix[i].dest_lin;
        dest_col = path_matrix[i].dest_col;
        val = teoremaPitagoras({x:ini_lin, y:ini_col}, {x:dest_lin, y:dest_col});

        // console.log(ini_lin+":"+ini_col+" | "+dest_lin+":"+dest_col);

        let vemPrimeiro = nodeIncialVemPrimeiro({x:ini_col, y:ini_lin}, {x:dest_col, y:dest_lin});
        let coord_ori = {x: ini_col, y: ini_lin}, coord_dest = {x: dest_col, y: dest_lin};

        if (vemPrimeiro) {
            coord_l = mtx_qtd_col * dest_lin + dest_col;
            coord_c = mtx_qtd_col * ini_lin + ini_col;
            coord_dest = {x: ini_col, y: ini_lin}, coord_ori  = {x: dest_col, y: dest_lin};            
        }
        else {
            coord_l = mtx_qtd_col * ini_lin + ini_col;
            coord_c = mtx_qtd_col * dest_lin + dest_col;
        }

        // console.log(coord_l, coord_c);
        adj_matrix[coord_l][coord_c] = val;
    }
    // console.log(adj_matrix);
}

function whichNodeComesFirst (nodeA, nodeB) {
    if (nodeB.lin < nodeA.lin) {
        return nodeB;
    }
    else if (nodeB.lin == nodeA.lin && nodeB.col < nodeA.col) {
        return nodeB;
    }
    return nodeA;
}

function nodeIncialVemPrimeiro (coordA, coordB) {
    if (coordB.y < coordA.y) {
        return false;
    }
    else if (coordB.y == coordA.y && coordB.x < coordA.x) {
        return false;
    }
    return true;
}

function calculaManhatann () {
    if (origem.on_cell && destino.on_cell) {
        txt_dist_manhatann.setString("Dist. Manhatann: "+ distManhatann(origem.cel, destino.cel));

    }
    else {
        txt_dist_manhatann.setString("Dist. Manhatann: ----");
    }
}

function teoremaPitagoras(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x-pointB.x, 2) + Math.pow(pointA.y-pointB.y, 2));
}

function distManhatann(coordA, coordB) {
    return Math.abs(coordA.col-coordB.col) + Math.abs(coordA.lin-coordB.lin);
}


class Node {
    constructor (lin, col) {
        this.lin = lin;
        this.col = col;
        this.parent = null;
        this.weight = Infinity;
        this.closed = false;        
    }
}

class Vertex  {
    constructor (fromNode, toNode, weight) {
        this.fromNode = fromNode;
        this.toNode   = toNode,
        this.weight   = weight;
    }
}