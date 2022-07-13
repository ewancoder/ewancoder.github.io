import * as mainpage from './mainpage.js';
import * as articles from './articles/articles.js';

const routerElement = document.getElementById('router');

let currentPath = undefined;
let currentAnchor = undefined;

function generateAnchorLinks() {
    document.querySelectorAll('.anchor-link').forEach(element => {
        element.addEventListener('click', () => {
            const id = element.id.split('_')[1];
            window.location.hash = `${currentPath}#${id}`;
        });
    });
}

async function processRoutingAsync() {
    const href = window.location.href;
    const hrefParts = href.split('#');
    const path = hrefParts[1];
    currentAnchor = hrefParts[2];

    if (currentPath == path) {
        // If the anchor is not empty - we need to scroll to it.
        currentAnchor && await scrollToAnchorAsync();

        // Path did not change, no need for routing.
        return;
    }

    currentPath = path;
    await refreshPageAsync();
    currentAnchor && await scrollToAnchorAsync();
    generateAnchorLinks();
}

async function scrollToAnchorAsync() {
    const element = document.querySelector(`#${currentAnchor}`);

    if (element) {
        // Create artificial delay in case page is still loading.
        await new Promise(x => setTimeout(x, 100));

        element.scrollIntoView({ behavior: 'smooth' });
    }
}

async function refreshPageAsync() {
    routerElement.innerHTML = '';

    if (!currentPath) {
        // Home page.
        await mainpage.refreshPageAsync(routerElement, currentPath);
        return;
    }

    if (currentPath.startsWith('/articles')) {
        // Articles (blog) page.
        await articles.refreshPageAsync(routerElement, currentPath);
        return;
    }

    // Load main page if route contains unknown path.
    await mainpage.refreshPageAsync(routerElement, currentPath);
}

export { processRoutingAsync };