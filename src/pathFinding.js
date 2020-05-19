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
        this.array_caminho = [];
    }

    retornaCaminho (mtx, origem, destino, dimensao_mtx) {
        this.mtx = mtx;
        this.dimensao_mtx = dimensao_mtx;
        this.coord_ori = origem;
        this.coord_dest = destino;
        this.pos_ori  = this.calcPosOnMtx(origem);
        this.pos_dest = this.calcPosOnMtx(destino);
        
        this.addVerticeNaLista(this.pos_ori, 0, null);

        let vertice;
        let vertices_conectados = [];
        do {
            this.fechei_todos_vertices = this.verificaSeHaVerticeAberto();
            if (!this.fechei_todos_vertices) {
                vertice = this.verticeComMenorEstimativaEFecha();
                if (vertice != null) {
                    vertices_conectados = this.buscaPosicaoDeVerticesConectados(vertice.pos);                    
                    for (var i = 0; i < vertices_conectados.length; i++) {
                        this.verificaSeVertceEstaNaListaEAdiciona(vertices_conectados[i], vertice.pos);
                    }
                }
            }

        } while (!this.achei_destino && !this.fechei_todos_vertices);


        this.array_caminho = [];

        if (this.achei_destino) {
            console.log("cheguei no destino");
            this.array_caminho = this.tracaCaminhoDestinoAteOrigem();

        }
        else {
            console.log("destino fora de alcance");
        }

        return {encontrado:this.achei_destino, caminho: this.array_caminho}
    }

    tracaCaminhoDestinoAteOrigem() {        
        let curr_pos = this.pos_dest;
        let found_next = false;
        let array_caminho = [];

        while (curr_pos != null) {
            found_next = false;
            for (var i =  0;  i < this.lista_vertices.length && !found_next;  i++) {
                if (this.lista_vertices[i].pos == curr_pos) {
                    array_caminho.push(this.lista_vertices[i]);
                    curr_pos = this.lista_vertices[i].precedente;
                    found_next = true;
                }
            }
        }
        console.log("terminei de traçar o caminho");
        return array_caminho;
    }

    verificaSeVertceEstaNaListaEAdiciona (pos_e_peso, precedente) {        
        let pos = pos_e_peso.pos;
        let peso = pos_e_peso.peso;
        let peso_precedente = null;
        let dados_alvo = null;

        for (let i = 0; i < this.lista_vertices.length && !peso_precedente; i++) {            
            if (precedente == this.lista_vertices[i].pos) {                
                peso_precedente = this.lista_vertices[i].g;
            }            
        }
        
        for (let i = 0; i < this.lista_vertices.length && !dados_alvo; i++) {
            if (pos_e_peso.pos == this.lista_vertices[i].pos) {
                dados_alvo = this.lista_vertices[i];
            }            
        }

        if (dados_alvo != null){
            if (!dados_alvo.fechado) {
                if (dados_alvo.g < (peso+peso_precedente)) {
                    dados_alvo.setPrecedente(precedente);
                    dados_alvo.setG(peso+peso_precedente);
                    dados_alvo.updateEstimativa();
                }
            }
        }
        else {
            this.addVerticeNaLista(pos, peso+peso_precedente, precedente)
            if (pos == this.pos_dest) {
                this.achei_destino = true;
            }
        }
    }

    buscaPosicaoDeVerticesConectados(pos) {        
        let conectados = [];
        for (let col = 0; col < pos; col++) {
            if (this.mtx[pos][col] < Infinity) {                
                conectados.push({pos:col, peso: this.mtx[pos][col]});
            }
        }
        for (let lin = pos+1; lin < this.mtx.length; lin++) {
            if (this.mtx[lin][pos] < Infinity) {
                conectados.push({pos:lin, peso: this.mtx[lin][pos]});
            }
        }
        return conectados;
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

    addVerticeNaLista (pos, peso, precedente) {
        let coord = this.calcCoordOfPoint(pos);
        let vertice = new Vertice(pos, coord);

        vertice.setPrecedente(precedente);
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

    setPrecedente(p) {
        this.precedente = p;
    }
    getPrecedente() {
        return this.precedente;
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