function articleFactory(prefix, articles) {
    const lineHighlightColor = '#ee8';
    const contentPrefix = `content/${prefix}`;
    let highlighting = [];

    let currentPageTitle = undefined; // TODO: Move to return type instead of global variable.

    return ({
        refreshPageAsync
    });

    async function refreshPageAsync(element, path) {
        if (path == `/${prefix}`) {
            // Don't block on waiting for all the articles.
            loadMainPageAsync(element);
            return;
        }

        const articleName = path.split(`/${prefix}/`)[1];
        await loadArticleAsync(element, articleName);
        hljs.highlightAll();
        hljs.initLineNumbersOnLoad();
        hljs.highlightLinesAll(highlighting);
        return {
            title: currentPageTitle
        };
    }

    async function loadMainPageAsync(element) {
        await loadMainPageAsync(element);
        hljs.highlightAll();
        hljs.initLineNumbersOnLoad();
        hljs.highlightLinesAll(highlighting);
        currentPageTitle = undefined;
    }

    async function loadArticleAsync(element, articleName) {
        const content = await loadMarkdownArticleAsync(articleName);

        currentPageTitle = content.split('\n')[0].replaceAll('#', '').trim();

        // Get previous and next articles info.
        let previousArticleInfo = null;
        let nextArticleInfo = null;

        let first = true;
        let prevName = null;
        for (let name of articles) {
            if (name === articleName && first) {
                previousArticleInfo = null;
                break;
            }

            if (name === articleName) {
                previousArticleInfo = {
                    title: await getArticleTitleAsync(prevName),
                    articleName: prevName
                };
                break;
            }

            first = false;
            prevName = name;
        }

        let next = false;
        for (let name of articles) {
            if (name === articleName) {
                next = true;
                continue;
            }

            if (next) {
                nextArticleInfo = {
                    title: await getArticleTitleAsync(name),
                    articleName: name
                };
                break;
            }
        }

        loadFullArticle(element, content, articleName, previousArticleInfo, nextArticleInfo);
    }

    async function getArticleTitleAsync(articleName) {
        const content = await loadMarkdownArticleAsync(articleName);
        const title = content.split('\n')[0].replaceAll('#', '').trim();
        return title;
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
        const nameParts = articleName.split('/');
        const name = nameParts[nameParts.length - 1];
        const response = await fetch(`/${contentPrefix}/${articleName}/${name}.md`);
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

    function loadFullArticle(latestArticlesElement, content, articlePath, previousArticleInfo, nextArticleInfo) {
        const articlePreview = document.createElement('div');
        articlePreview.classList.add('article-content');
        articlePreview.classList.add('open-article');
        articlePreview.innerHTML = convertMarkdownToHtml(content, articlePath, false, previousArticleInfo, nextArticleInfo);

        const fullArticleBox = document.createElement('div');
        fullArticleBox.classList.add('full-article');
        fullArticleBox.appendChild(articlePreview);

        latestArticlesElement.appendChild(fullArticleBox);
    }

    function convertMarkdownToHtml(markdownContent, articlePath, isPreview, previousArticleInfo, nextArticleInfo) {
        if (nextArticleInfo) {
            markdownContent = markdownContent.replace('[TOC]', `[TOC]\n\n> The next article in the series is [${nextArticleInfo.title}](#/${prefix}/${nextArticleInfo.articleName})`);
            markdownContent = `${markdownContent}\n\n> The next article in the series is [${nextArticleInfo.title}](#/${prefix}/${nextArticleInfo.articleName})`;
        }

        if (previousArticleInfo) {
            markdownContent = markdownContent.replace('[TOC]', `[TOC]\n\n> Make sure to check out the previous article - [${previousArticleInfo.title}](#/${prefix}/${previousArticleInfo.articleName})`);
        }

        let baseUrl = articlePath.substring(0, articlePath.lastIndexOf('/'));
        if (baseUrl) {
            baseUrl = `${contentPrefix}/${baseUrl}/`;
        } else {
            baseUrl = `${contentPrefix}/`;
        }

        const renderer = new marked.Renderer();
        const toc = [];

        renderer.heading = function(data) {
            const id = data.raw.toLowerCase().replace(/[^\w]+/g, '-');
            const aElement = `<a class="no-decoration" href="#/${prefix}/${articlePath}#${id}">${data.text}</a>`;
            const tocEntry = `<a class="no-decoration toc-item toc${data.depth}" href="#/${prefix}/${articlePath}#${id}">${data.text}</a>`;
            const hElement = `<h${data.depth} id="${id}">${aElement}</h${data.depth}>`;

            toc.push({
                id: id,
                level: data.level,
                text: data.text,
                aElement: aElement,
                hElement: hElement,
                tocEntry: tocEntry
            });

            return hElement + '\n';
        };

        renderer.image = function(data) {
            const imgElement = `<img src="/${contentPrefix}/${articlePath}/${data.href}" alt="${data.text}"></img>`;
            return imgElement;
        };

        const codeHighlighting = [];
        renderer.code = function(data) {
            let code = data.text;
            let infostring = data.lang;

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
                        highlighting.push({start: startEnd[0], end: startEnd[0], color: lineHighlightColor});
                    } else {
                        highlighting.push({start: startEnd[0], end: startEnd[1], color: lineHighlightColor});
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