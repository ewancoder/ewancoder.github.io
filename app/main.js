window.onhashchange = function () 
{
    refreshPageAsync();
};

window.onload = () => {
    setTimeout(() => {
        const scrollEl = document.getElementById('scroll');
        scrollEl.addEventListener('click', () => {
            document.getElementById('conclusion')
                .scrollIntoView({ 
                    behavior: "smooth",
                    block: "start"
                });
        })
    }, 500)    
}

const articles = [
    'dvorak/dvorak',
    'stuttering-issue/stuttering-issue'
]
const latestArticlesElement = document.getElementById('latest-articles');

async function refreshPageAsync() {
    const href = window.location.href;
    const hrefParts = href.split('#');
    let path = undefined;
    if (hrefParts.length > 1) {
        path = hrefParts[1];
    }

    if (path && path.startsWith('/articles/')) {
        await reloadArticleByPathAsync(path);
    } else {
        await reloadMainPage();
    }
};
refreshPageAsync();

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

    loadFullArticle(latestArticlesElement, content, articleName);
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

    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('hvr-reveal');
    articlePreview.classList.add('hvr-grow-rotate');
    articlePreview.classList.add('fade-in');

    articlePreview.innerHTML = convertMarkdownToHtml(content, articleName);

    const articlePreviewBox = document.createElement('div');
    articlePreviewBox.classList.add('article-preview');
    articlePreviewBox.appendChild(articlePreview);

    articleLink.appendChild(articlePreviewBox);

    latestArticlesElement.appendChild(articleLink);
}

function loadFullArticle(latestArticlesElement, content, articlePath) {
    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('open-article');
    articlePreview.innerHTML = convertMarkdownToHtml(content, articlePath);

    const fullArticleBox = document.createElement('div');
    fullArticleBox.classList.add('full-article');
    fullArticleBox.appendChild(articlePreview);

    latestArticlesElement.appendChild(fullArticleBox);
}

async function loadMarkdownArticleAsync(articleName) {
    const response = await fetch(`/articles/${articleName}.md`);
    return await response.text();
}

function convertMarkdownToHtml(markdownContent, articlePath) {
    let baseUrl = articlePath.substring(0, articlePath.lastIndexOf('/'));
    if (baseUrl) {
        baseUrl = `articles/${baseUrl}/`;
    } else {
        baseUrl = 'articles/';
    }

    return marked.parse(markdownContent, { baseUrl });
}