function articleFactory(prefix, articles) {
    return ({
        refreshPageAsync
    });

    async function refreshPageAsync(element, path) {
        if (path == `/${prefix}`) {
            await loadMainPageAsync(element);
            return;
        }

        const articleName = path.split(`/${prefix}/`)[1];
        await loadArticleAsync(element, articleName);
    }

    async function loadArticleAsync(element, articleName) {
        const content = await loadMarkdownArticleAsync(articleName);

        loadFullArticle(element, content, articleName);
    }

    async function loadMainPageAsync(element) {
        for (const articleName of articles) {
            let content = await loadMarkdownArticleAsync(articleName);

            const lines = content.split('\n');

            if (lines.length > 5) {
                content = lines
                    .slice(0, 5)
                    .concat(['', '...'])
                    .join('\n');
            }

            loadArticlePreview(element, content, articleName);

            // Artificial delay for beautiful article preview loading effect.
            await new Promise(x => setTimeout(x, 100));
        }
    }

    async function loadMarkdownArticleAsync(articleName) {
        const response = await fetch(`/${prefix}/${articleName}.md`);
        return await response.text();
    }

    function loadArticlePreview(element, content, articleName) {
        const articleLink = document.createElement('a');
        articleLink.classList.add('no-decoration');
        articleLink.classList.add('block');
        articleLink.setAttribute('href', `/#/${prefix}/${articleName}`);

        const articlePreview = document.createElement('div');
        articlePreview.classList.add('article-content');
        articlePreview.classList.add('hvr-article-preview');
        articlePreview.classList.add('fade-in');

        articlePreview.innerHTML = convertMarkdownToHtml(content, articleName);

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
        articlePreview.innerHTML = convertMarkdownToHtml(content, articlePath);

        articlePreview.querySelectorAll('h2, h3, h4, h5, h6').forEach(header => {
            const value = header.innerHTML;
            const id = header.getAttribute('id');

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', `#/${prefix}/${articlePath}#${id}`);
            linkElement.classList.add('no-decoration');
            linkElement.innerHTML = value;

            header.innerHTML = '';
            header.appendChild(linkElement);
        });

        const fullArticleBox = document.createElement('div');
        fullArticleBox.classList.add('full-article');
        fullArticleBox.appendChild(articlePreview);

        latestArticlesElement.appendChild(fullArticleBox);
    }

    function convertMarkdownToHtml(markdownContent, articlePath) {
        let baseUrl = articlePath.substring(0, articlePath.lastIndexOf('/'));
        if (baseUrl) {
            baseUrl = `${prefix}/${baseUrl}/`;
        } else {
            baseUrl = `${prefix}/`;
        }

        return marked.parse(markdownContent, { baseUrl });
    }
}

export { articleFactory };