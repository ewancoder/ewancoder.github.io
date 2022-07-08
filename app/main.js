const href = window.location.href;
const hrefParts = href.split('#');
let path = undefined;
if (hrefParts.length > 1) {
    path = hrefParts[1];
}

const articles = [
    'first-article',
    'second-article'
]
const latestArticlesElement = document.getElementById('latest-articles');

(async function () {
    if (path && path.startsWith('/articles/')) {
        await reloadArticleByPathAsync(path);
    } else {
        await reloadMainPage();
    }
})();

async function reloadMainPage() {
    latestArticlesElement.innerHTML = '';
    await loadAllArticlesAsync();
}

function reloadArticleByPathAsync(path) {
    latestArticlesElement.innerHTML = '';

    return reloadArticleByNameAsync(path.split('/articles/')[1]);
}

async function reloadArticleByNameAsync(articleName) {
    latestArticlesElement.innerHTML = '';

    const content = await loadMarkdownArticleAsync(articleName);

    loadFullArticle(latestArticlesElement, content);
}

async function loadAllArticlesAsync() {
    for (const articleName of articles) {
        let content = await loadMarkdownArticleAsync(articleName);

        const lines = content.split('\n');

        if (lines.length > 5) {
            content = lines
                .slice(0, 5)
                .concat(['', '...'])
                .join('\n');
        }

        loadArticlePreview(latestArticlesElement, content, articleName);

        await new Promise(x => setTimeout(x, 100));
    }
}

function loadArticlePreview(latestArticlesElement, content, articleName) {
    const articleLink = document.createElement('a');
    articleLink.classList.add('no-decoration');
    articleLink.setAttribute('href', `/#/articles/${articleName}`);

    articleLink.onclick = function() {
        reloadArticleByNameAsync(articleName);
    };

    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('hvr-reveal');
    articlePreview.classList.add('hvr-grow-rotate');
    articlePreview.classList.add('fade-in');
    articlePreview.innerHTML = marked.parse(content);

    const articlePreviewBox = document.createElement('div');
    articlePreviewBox.classList.add('article-preview');
    articlePreviewBox.appendChild(articlePreview);

    articleLink.appendChild(articlePreviewBox);

    latestArticlesElement.appendChild(articleLink);
}

function loadFullArticle(latestArticlesElement, content) {
    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('open-article');
    articlePreview.innerHTML = marked.parse(content);

    const fullArticleBox = document.createElement('div');
    fullArticleBox.classList.add('full-article');
    fullArticleBox.appendChild(articlePreview);

    latestArticlesElement.appendChild(fullArticleBox);
}

async function loadMarkdownArticleAsync(articleName) {
    const response = await fetch(`/articles/${articleName}.md`);
    return await response.text();
}