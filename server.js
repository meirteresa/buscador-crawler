const express = require('express');
const fs = require('fs');
const path = require('path');
const crawlPagina = require('./crawler');
const ranquearPaginas = require('./buscador');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let paginasArmazenadas = []; //guarda as páginas após o crawl

app.post('/carregar', async (req, res) => {
    const { url } = req.body;

    try {
        paginasArmazenadas = await crawlPagina(url);
        res.sendStatus(200);
    } catch (erro) {
        console.error('Erro ao carregar páginas:', erro);
        res.status(500).send('Erro ao carregar páginas');
    }
});

app.post('/buscar', async (req, res) => {
    const { termos } = req.body;

    try {
        const ranking = ranquearPaginas(paginasArmazenadas, termos);

        const resultadosOrdenados = Object.keys(ranking).map(url => ({
            url,
            ocorrencias: ranking[url].termosEncontrados,
            linksRecebidos: ranking[url].linksRecebidos,
            autoreferencia: ranking[url].autoreferencia,
            total: ranking[url].total
        }));

        resultadosOrdenados.sort((a, b) => b.total - a.total);

        if (resultadosOrdenados.length === 0) {
            return res.status(200).json({ mensagem: "Sua pesquisa não encontrou nenhum documento correspondente." });
        }

        res.json(resultadosOrdenados);
    } catch (erro) {
        console.error('Erro ao realizar busca:', erro);
        res.status(500).send('Erro interno do servidor');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
