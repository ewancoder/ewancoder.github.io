(async function () {
    const latestArticlesElement = document.getElementById('latest-articles');

    loadArticlePreviews(latestArticlesElement);
})();

function loadArticlePreviews(latestArticlesElement) {
    loadArticlePreview(latestArticlesElement, '## First article\nPlaceholder for the first article.');
    loadArticlePreview(latestArticlesElement, '## Second article\nPlaceholder for the second article.');
}

function loadArticlePreview(latestArticlesElement, content) {
    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-preview');
    articlePreview.innerHTML = marked.parse(content);

    latestArticlesElement.appendChild(articlePreview);
}