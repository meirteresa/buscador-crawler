const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

async function crawlPagina(url, visitados = new Set(), paginas = []) {
    if (visitados.has(url)) return paginas;
    visitados.add(url);

    console.log(`>>> Visitando: ${url}`);

    try {
        const resposta = await axios.get(url);
        const $ = cheerio.load(resposta.data);

        const texto = $('html').html().trim();

        const links = [];
        $('a').each((i, el) => {
            const texto = $(el).text().trim();
            let href = $(el).attr('href');
            if (href) {
                try {
                    const normalizado = new URL(href, url);
                    normalizado.hash = '';    // remove fragmentos #...
                    normalizado.search = '';  // remove parâmetros ?...
                    links.push({ texto, href: normalizado.href });
                } catch { /* ignora hrefs inválidos */ }
            }
        });

        // Salva a página no índice
        paginas.push({
            url,
            texto,
            links
        });

        // Recursão para os próximos links
        for (const link of links) {
            await crawlPagina(link.href, visitados, paginas);
        }

    } catch (erro) {
        console.error("Erro ao acessar a página:", erro.message);
    }

    //console.log(paginas);
    return paginas;
}

module.exports = crawlPagina;
