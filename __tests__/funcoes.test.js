const funcoes  = require("./../src/funcoes");

describe("busca", ()=>{

    it("deve retornar um numero maior ou igual a 0", ()=> {
        let ptA = {x:0, y:0};
        let ptB = {x:3, y:4};
        let resposta = funcoes.pointDist(ptA, ptB);

        expect(resposta).toBe(5);
    });
});