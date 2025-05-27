function ranquearPaginas(paginas, termosBuscados) {
    const resultado = {};

    paginas.forEach(pagina => {
        resultado[pagina.url] = {
            linksRecebidos: 0,
            termosEncontrados: 0,
            autoreferencia: false,
            total: 0
        };
    });

    // 1. Contar links recebidos e verificar autoreferência
    paginas.forEach(pagina => {
        pagina.links.forEach(link => {
            const destino = link.href;

            if (destino === pagina.url) {
                resultado[destino].autoreferencia = true;
            } else {
                resultado[destino].linksRecebidos += 1;
            }

            // if (resultado[destino] !== undefined) { 
            // }
        });

    });

    // 2. Contar ocorrências dos termos buscados
    function normalizar(str) {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, "c");
    }

    paginas.forEach(pagina => {
        const texto = normalizar(pagina.texto);
        let totalOcorrencias = 0;

        termosBuscados.forEach(termo => {
            const termoLower = normalizar(termo);
            let pos = 0;
            while ((pos = texto.indexOf(termoLower, pos)) !== -1) {
                totalOcorrencias++;
                pos += termoLower.length;
            }
        });

        resultado[pagina.url].termosEncontrados = totalOcorrencias;
    });

    // 3. Calcular total
    for (const url in resultado) {
        const dados = resultado[url];
        const pontosTermos = dados.termosEncontrados * 5;
        const pontosLinks = dados.linksRecebidos * 10;
        const penalidade = dados.autoreferencia ? -15 : 0;

        dados.total = pontosTermos + pontosLinks + penalidade;
    }
    // Remove páginas com 0 ocorrências
    for (const url in resultado) {
        if (resultado[url].termosEncontrados === 0) {
            delete resultado[url];
        }
    }

    return resultado;
}

module.exports = ranquearPaginas;
