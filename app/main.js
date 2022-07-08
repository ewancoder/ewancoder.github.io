const articles = [
    'first-article',
    'second-article'
]
const latestArticlesElement = document.getElementById('latest-articles');

(async function () {
    await loadAllArticlesAsync();
})();

async function loadAllArticlesAsync() {
    for (const articleName of articles) {
        const content = await loadMarkdownArticleAsync(articleName);
        loadArticlePreview(latestArticlesElement, content);
    }
}

function loadArticlePreview(latestArticlesElement, content) {
    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('hvr-reveal');
    articlePreview.classList.add('hvr-grow-rotate');
    articlePreview.innerHTML = marked.parse(content);

    const articlePreviewBox = document.createElement('div');
    articlePreviewBox.classList.add('article-preview');
    articlePreviewBox.appendChild(articlePreview);

    latestArticlesElement.appendChild(articlePreviewBox);
}

async function loadMarkdownArticleAsync(articleName) {
    const response = await fetch(`/articles/${articleName}.md`);
    return await response.text();
}