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
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('hvr-reveal');
    articlePreview.classList.add('hvr-grow-rotate');
    articlePreview.innerHTML = marked.parse(content);

    const articlePreviewBox = document.createElement('div');
    articlePreviewBox.classList.add('article-preview');
    articlePreviewBox.appendChild(articlePreview);

    latestArticlesElement.appendChild(articlePreviewBox);
}