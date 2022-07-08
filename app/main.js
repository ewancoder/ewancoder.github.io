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
        let content = await loadMarkdownArticleAsync(articleName);

        const lines = content.split('\n');

        if (lines.length > 5) {
            content = lines
                .slice(0, 5)
                .concat(['', '...'])
                .join('\n');
        }

        loadArticlePreview(latestArticlesElement, content);

        await new Promise(x => setTimeout(x, 100));
    }
}

function loadArticlePreview(latestArticlesElement, content) {
    const articlePreview = document.createElement('div');
    articlePreview.classList.add('article-content');
    articlePreview.classList.add('hvr-reveal');
    articlePreview.classList.add('hvr-grow-rotate');
    articlePreview.classList.add('fade-in');
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