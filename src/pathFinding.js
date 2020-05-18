class PathFinding {
    constructor () {        
        this.mtx = [];
        this.dimensao_mtx;        
        this.coord_ori;
        this.coord_dest;
        this.pos_ori;
        this.pos_dest;
        this.lista_vertices = [];
        this.achei_destino = false;
        this.fechei_todos_vertices = false;
    }

    retonaCaminho (mtx, origem, destino, dimensao_mtx) {
        this.mtx = mtx;
        this.dimensao_mtx = dimensao_mtx;
        this.coord_ori = origem;
        this.coord_dest = destino;
        this.pos_ori  = this.calcPosOnMtx(origem);
        this.pos_dest = this.calcPosOnMtx(destino);

        console.log(this.pos_ori, this.pos_dest);
        this.addVerticeNaLista(this.pos_ori, 0);

        let vertice;
        let vertices_conectados = [];
        do {
            this.fechei_todos_vertices = this.verificaSeHaVerticeAberto();
            if (!this.fechei_todos_vertices) {
                vertice = this.verticeComMenorEstimativaEFecha();
                if (vertice != null) {
                    vertices_conectados = this.buscaPosicaoDeVerticesConectados(vertice.pos);
                    console.log(vertices_conectados);
                }
            }

        } while (!this.achei_destino && !this.fechei_todos_vertices);
    }

    buscaPosicaoDeVerticesConectados(pos) {
        console.log("buscando conexoes  em ", pos);
        let conectado = [];
        for (let col = 0; col < pos; col++) {
            if (this.mtx[pos][col] < Infinity) {
                console.log(col, this.mtx[pos][col]);
            }
        }
        for (let lin = pos+1; lin < this.mtx.length; lin++) {
            if (this.mtx[lin][pos] < Infinity) {
                console.log(lin, this.mtx[lin][pos]);
            }
        }
        return conectado;
    }

    verticeComMenorEstimativaEFecha () {
        let idx = null;
        let vertice = null;
        let menor_valor = Infinity;

        for (let i = 0; i < this.lista_vertices.length; i++) {
            if (this.lista_vertices[i].fechado == false && this.lista_vertices[i].f < menor_valor) {
                idx = i;
                menor_valor = this.lista_vertices[i].f;
            }            
        }

        if (idx !=null) {                        
            vertice = this.lista_vertices[idx];           
            vertice.fechado = true;
        }
        
        return vertice;
    }

    verificaSeHaVerticeAberto() {
        let todos_fechados = true;

        for (let i = 0; i < this.lista_vertices.length && todos_fechados; i++) {
            todos_fechados = this.lista_vertices[i].fechado;
        }

        console.log("Todos fechado",todos_fechados);
        return todos_fechados;
    }

    addVerticeNaLista (pos, peso) {
        let coord = this.calcCoordOfPoint(pos);
        let vertice = new Vertice(pos, coord);        

        vertice.setH( this.distManhatann(coord, this.coord_dest) );
        vertice.setG(peso);
        vertice.updateEstimativa();
        this.lista_vertices.push(vertice);
    }

    calcPosOnMtx(coord) {
        return (this.dimensao_mtx.col * coord.lin + coord.col);
    }

    calcCoordOfPoint(pos) {
        return {
            lin: parseInt(pos / this.dimensao_mtx.col),
            col: (pos % this.dimensao_mtx.col)
        }
    }

    distManhatann(coordA, coordB) {
        return Math.abs(coordA.col-coordB.col) + Math.abs(coordA.lin-coordB.lin);
    }
}


class Vertice {
    constructor (posicao, coord) {
        this.pos = posicao;
        this.coord = coord;
        this.precedente = null; ////posicao do precedente
        this.fechado = false;
        this.f = Infinity; ////estimativa
        this.g = Infinity; ////distancia da origem
        this.h = Infinity; ////
    }

    setF(val) {
        this.f = val;
    }
    getF() {
        return this.f;
    }
    setG(val) {
        this.g = val;
    }
    getG () {
        return this.g;
    }
    setH (val) {
        this.h = val;
    }
    getH() {
        return this.h;
    }

    updateEstimativa () {
        this.f = this.g + this.h;
    }
}