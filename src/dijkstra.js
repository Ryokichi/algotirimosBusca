let origin = null;
let destination = null;

let qtd_lin  = 0;
let qtd_col  = 0;
let mtx_size = 0;
let curr_pos = 0;
let vertices_list = [];
let destino_encontrado = false;
let todas_conexoes_fechadas = false;

function Djikstra (matrix, orig, dest, dimension_mtx) {
    origin = orig;
    destination = dest;
    qtd_lin  = dimension_mtx.lin;
    qtd_col  = dimension_mtx.col;
    mtx_size = qtd_lin * qtd_col;
    curr_pos = qtd_col * origin.lin + origin.col    

    vertices_list.push(new Vertice (curr_pos) );
    vertices_list[0].coord = calcCoordOfPoint(curr_pos);
    vertices_list[0].h = distManhatann(vertices_list[0].coord, destination)
    vertices_list[0].g = 0;
    vertices_list[0].updateEstimativa();

    let vertice;
    do {
        if (!todas_conexoes_fechadas) {
            vertice = procuraMenorEstimativa();
            if (vertice != null) {
                encontraConexoesDoNode(vertice);
                
            }
        }

        todas_conexoes_fechadas = verificaSeTodasFechadas();
        console.log("encontrei", destino_encontrado, " tudo fechado", todas_conexoes_fechadas);
    } while (!destino_encontrado && !todas_conexoes_fechadas);

    return (true);
}

function encontraConexoesDoNode(vertice) {
    let pos = vertice.position;
    let val = 0;
    let vertex_on_list = false;

    for (var lin = pos+1; lin < mtx_size; lin++) {
        val = adj_matrix[lin][pos];

        if (val < Infinity && val > 0) {
            vertex_on_list = false;
            for (let i = 0; vertices_list.length && !vertex_on_list; i++) {
                vertex_on_list = (vertices_list[i].position == pos+lin)
            }

            if (vertices_list) {

            }
            else {
                addNewVertexToList(pos+lin, val)
            }            
        }
    }
}

function addNewVertexToList (pos, val) {


}

function procuraMenorEstimativa (params) {
    let idx = null
    let menor_f = Infinity;
    let vertex = null;

    console.log("procurando o menor");
    for (let i = 0; i < vertices_list.length; i++) {
        if (!vertices_list[i].fechado) {
            if (vertices_list[i].f < menor_f) {
                menor_f = vertices_list[i].f;
                idx = i;
            }
        }
    }

    if (idx != null)  {        
        vertices_list[idx].fechado = true;
        vertex = vertices_list[idx];
    }
    
    return vertex;    
}

function verificaSeTodasFechadas () {
    var tudo_fechado = true;

    for (let i = 0; i < vertices_list.length && tudo_fechado; i++) {        
        tudo_fechado = vertices_list[i].fechado;        
    }

    return tudo_fechado;
}





function addVertice (lin, col) {
    var found = false;
    for (var i  = 0; i < vertices_list.lenght; i++)  {

    }

    if (!found) {
        vertices_list.push(new Vertice(lin, col));
    }
}



function distManhatann(pointA, pointB) {
    return Math.abs(pointA.col-pointB.col) + Math.abs(pointA.lin-pointB.lin);
}