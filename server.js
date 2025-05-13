const express = require('express');
const fs = require('fs');
const path = require('path');
const crawlPagina = require('./crawler');
const ranquearPaginas = require('./buscador');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de busca
app.post('/buscar', async (req, res) => {
    const { url, termos } = req.body;

    try {
        // Roda o crawler para coletar as páginas a partir da URL fornecida
        const paginas = await crawlPagina(url);

        // Roda o ranqueamento das páginas
        const ranking = ranquearPaginas(paginas, termos);

        // Ordena os resultados
        const resultadosOrdenados = Object.keys(ranking).map(url => ({
            url,
            ocorrencias: ranking[url].termosEncontrados,
            linksRecebidos: ranking[url].linksRecebidos,
            autoreferencia: ranking[url].autoreferencia,
            total: ranking[url].total
        }));


        resultadosOrdenados.sort((a, b) => {
            const pa = a;
            const pb = b;

            if (pb.total !== pa.total) return pb.total - pa.total;
            if (pb.termosEncontrados !== pa.termosEncontrados) return pb.termosEncontrados - pa.termosEncontrados;
            if (pb.linksRecebidos !== pa.linksRecebidos) return pb.linksRecebidos - pa.linksRecebidos;
            if (pa.autoreferencia !== pb.autoreferencia) return pa.autoreferencia ? 1 : -1;

            return 0;
        });

        // ✅ Verifica se encontrou algum resultado
        if (resultadosOrdenados.length === 0) {
            return res.status(200).json({ mensagem: "Sua pesquisa não encontrou nenhum documento correspondente." });
        }
        
        // Retorna os resultados ordenados para o front-end
        res.json(resultadosOrdenados);
    } catch (erro) {
        console.error('Erro ao realizar busca:', erro);
        res.status(500).send('Erro interno do servidor');
    }
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
