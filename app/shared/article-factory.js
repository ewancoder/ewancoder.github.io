function articleFactory(prefix, articles) {
    const contentPrefix = `content/${prefix}`;
    let highlighting = [];

    return ({
        refreshPageAsync
    });

    async function refreshPageAsync(element, path) {
        if (path == `/${prefix}`) {
            await loadMainPageAsync(element);
            hljs.highlightAll();
            hljs.initLineNumbersOnLoad();
            hljs.highlightLinesAll(highlighting);
            return;
        }

        const articleName = path.split(`/${prefix}/`)[1];
        await loadArticleAsync(element, articleName);
        hljs.highlightAll();
        hljs.initLineNumbersOnLoad();
        hljs.highlightLinesAll(highlighting);
    }

    async function loadArticleAsync(element, articleName) {
        const content = await loadMarkdownArticleAsync(articleName);

        loadFullArticle(element, content, articleName);
    }

    async function loadMainPageAsync(element) {
        for (const articleName of articles) {
            let content = await loadMarkdownArticleAsync(articleName);

            loadArticlePreview(element, content, articleName);

            // Artificial delay for beautiful article preview loading effect.
            await new Promise(x => setTimeout(x, 100));
        }
    }

    async function loadMarkdownArticleAsync(articleName) {
        const response = await fetch(`/${contentPrefix}/${articleName}.md`);
        return await response.text();
    }

    function loadArticlePreview(element, content, articleName) {
        const lines = content.split('\n');

        const tocLineIndex = lines.findIndex(line => line.startsWith('[TOC]'));
        if (tocLineIndex > -1) {
            content = lines.slice(0, tocLineIndex)
                .concat(['', '...'])
                .join('\n');
        } else if (lines.length > 5) {
            content = lines
                .slice(0, 5)
                .concat(['', '...'])
                .join('\n');
        }

        content = content.replace('[TOC]', '');

        const articleLink = document.createElement('a');
        articleLink.classList.add('no-decoration');
        articleLink.classList.add('block');
        articleLink.setAttribute('href', `/#/${prefix}/${articleName}`);

        const articlePreview = document.createElement('div');
        articlePreview.classList.add('article-content');
        articlePreview.classList.add('hvr-article-preview');
        articlePreview.classList.add('fade-in');

        articlePreview.innerHTML = convertMarkdownToHtml(content, articleName, true);

        const articlePreviewBox = document.createElement('div');
        articlePreviewBox.classList.add('article-preview');
        articlePreviewBox.appendChild(articlePreview);

        articleLink.appendChild(articlePreviewBox);

        element.appendChild(articleLink);
    }

    function loadFullArticle(latestArticlesElement, content, articlePath) {
        const articlePreview = document.createElement('div');
        articlePreview.classList.add('article-content');
        articlePreview.classList.add('open-article');
        articlePreview.innerHTML = convertMarkdownToHtml(content, articlePath, false);

        const fullArticleBox = document.createElement('div');
        fullArticleBox.classList.add('full-article');
        fullArticleBox.appendChild(articlePreview);

        latestArticlesElement.appendChild(fullArticleBox);
    }

    function convertMarkdownToHtml(markdownContent, articlePath, isPreview) {
        let baseUrl = articlePath.substring(0, articlePath.lastIndexOf('/'));
        if (baseUrl) {
            baseUrl = `${contentPrefix}/${baseUrl}/`;
        } else {
            baseUrl = `${contentPrefix}/`;
        }

        const renderer = new marked.Renderer();
        const toc = [];

        renderer.heading = function(text, level, raw) {
            const id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
            const aElement = `<a class="no-decoration" href="#/${prefix}/${articlePath}#${id}">${text}</a>`;
            const tocEntry = `<a class="no-decoration toc-item toc${level}" href="#/${prefix}/${articlePath}#${id}">${text}</a>`;
            const hElement = `<h${level} id="${id}">${aElement}</h${level}>`;

            toc.push({
                id: id,
                level: level,
                text: text,
                aElement: aElement,
                hElement: hElement,
                tocEntry: tocEntry
            });

            return hElement + '\n';
        };

        const codeHighlighting = [];
        renderer.code = function(code, infostring, escaped) {
            const firstLine = code.split('\n')[0];
            if (firstLine.startsWith('hl=')) {
                code = code.split('\n').slice(1).join('\n');
                codeHighlighting.push(parseHighlighting(firstLine));
            } else {
                codeHighlighting.push([]);
            }

            function parseHighlighting(highlightingLine) {
                const lines = highlightingLine.split('=')[1].split(',');
                const highlighting = [];

                for (let line of lines) {
                    let startEnd = line.split('-');
                    if (startEnd.length == 1) {
                        highlighting.push({start: startEnd[0], end: startEnd[0], color: '#ee8'});
                    } else {
                        highlighting.push({start: startEnd[0], end: startEnd[1], color: '#ee8'});
                    }
                }

                return highlighting;
            }

            if (infostring == 'console') {
                return `<pre><code class="language-${infostring} hljs nohljsln">${code}</code></pre>`;
            }

            return `<pre><code class="language-${infostring} hljs">${code}</code></pre>`;
        };

        marked.setOptions({
            renderer: renderer,
            baseUrl: baseUrl
        });

        let content = marked.parse(markdownContent);
        const tocContent = `<div class="toc">${generateToc(toc)}</div>`

        if (isPreview) {
            content = content.replace('<p>[TOC]</p>', '');
        } else {
            content = content.replace('<p>[TOC]</p>', tocContent);
        }

        // TODO: Return highlighting here as well, instead of using global variables.
        highlighting = codeHighlighting;
        return content;
    }

    function generateToc(toc) {
        let tocContent = '';
        for (let heading of toc) {
            tocContent += heading.tocEntry + '\n';
        }

        return tocContent;
    }
}

export { articleFactory };