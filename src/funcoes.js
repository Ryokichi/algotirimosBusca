var loadedImages = [];

function getLoadedImage(src) {
    for (var i = 0; i < loadedImages.length; i++){
        if (loadedImages[i].spriteName == src)
            return loadedImages[i];
    }
}



////Logica disso está ruim, funcao só vê se o rectB está dentro do rectA
function rectIntersectRect (rectA, rectB) {
    var collided = false;
    var vA = [];
    var vB = [];

    ////Saber os pontos extremos do retangulo é o suficiente para determinar se um contem o outro
    vA[0] = {x:rectA.x,         y:rectA.y};
    vA[1] = {x:rectA.x+rectA.w, y:rectA.y+rectA.h};

    vB[0] = {x:rectB.x,         y:rectB.y};
    vB[1] = {x:rectB.x+rectB.w, y:rectB.y+rectB.h};

    ////LD - Lateral Direita
    ////LE - Lateral Esquerda
    ////LS - Lateral Superior
    ////LI - Lateral Inferior
    ////Verifica se os retangulos estão fora dos limites
    ////Se qualquer das situações for verdadeira significa que o retangulo está fora do outro
    collided = !(
           vA[1].x < vB[0].x  ///significa LD de R1 está antes LE de R2
        || vA[0].x > vB[1].x  ///significa LE de R1 está após LD de R2
        || vA[0].y > vB[1].y  ///significa LS de R1 está acima de LI de R2
        || vA[1].y < vB[0].y  ///significa LS de R1 está abaixo de LI de R2
    );

    return collided;
}

function rectContainsPoint (rect, point) {
    var is_inside = false;
    is_inside = (point.x >= rect.x && point.x <= (rect.x+rect.w) && point.y >= rect.y && point.y <= (rect.y+rect.h));

    return is_inside;
}

function pointDist(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x-pointB.x, 2) + Math.pow(pointA.y-pointB.y, 2));
}

////Esse não está funcionado ainda, falta terminar implementá-lo
function circleCollideToRect(circle, rect) {
    var collided = false;
    var vertices = [];

    vertices[0] = {x:rect.x,        y:rect.y};
    vertices[1] = {x:rect.x+rect.w, y:rect.y};
    vertices[2] = {x:rect.x,        y:rect.y+rect.h};
    vertices[3] = {x:rect.x+rect.w, y:rect.y+rect.h};

    ////primeiro verificar se o circulo está dentro do retangulo
    collided = rectContainsPoint(rect, {x:circle.x, y:circle.y});
    if (collided) return collided;

    ////equacao geral da reta ax + by + c = 0;
    ////equacao reduzida da circunferencia deltaX²+deltaY² = R²
    ////coeficiente angular da reta m = (y2 – y1) / (x2 – x1)

    ////distancia do ponto a reta  |Ax + by + c| / sqr(A² + B²)

    var m, idx2;
    for (var i = 0; i < vertices.length; i++) {
        idx2 = (i < (vertices.length-1)) ? i+1 : 0;
        m = (vertices[idx2].y - vertices[i].y) / (vertices[idx2].x - vertices[i].x);
    }

    return collided;
}