import * as mainpage from './mainpage.js';
import * as articles from './articles/articles.js';
import * as dev from './dev/dev.js';

const navigationBarElement = document.getElementById('navigation-bar');
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
    if (href.indexOf('%23') > -1) {
        // If loading a link with multiple '#' - we need to avoid escaping them.
        window.location.href = href.replace('%23', '#');
        return;
    }

    const hrefParts = href.split('#');
    const path = hrefParts[1];
    currentAnchor = hrefParts[2];

    if (currentPath && currentPath == path) {
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
        navigationBarElement.innerHTML = '';
        await mainpage.refreshPageAsync(routerElement, currentPath);
        return;
    }

    if (currentPath.startsWith('/articles')) {
        refreshNavigationBar();

        // Articles (blog) page.
        await articles.refreshPageAsync(routerElement, currentPath);
        return;
    }

    if (currentPath.startsWith('/dev')) {
        refreshNavigationBar();

        /*const p = document.createElement('p');
        p.innerHTML = 'I am a .NET backend developer. During years of programming I stumbled upon nontrivial problems that a lot of people stumble upon, but that are not easy to solve without prior experience. Here I\'m sharing all this knowledge as a set of themed articles.';
        routerElement.appendChild(p);*/

        await dev.refreshPageAsync(routerElement, currentPath);
        return;
    }

    if (currentPath.startsWith('/simracing')) {
        refreshNavigationBar();

        const p = document.createElement('p');
        p.innerHTML = 'Apart from programming I am sim racing - racing virtual cars on virtual tracks with real people. The tracks are laser-scanned and the physics is simulated, so it\'s not an easy thing. But I\'m learning and driving faster with each passing day.';

        routerElement.appendChild(p);
        return;
    }

    if (currentPath.startsWith('/projects')) {
        refreshNavigationBar();

        const p = document.createElement('p');
        p.innerHTML = 'Here I\'ll add a list of my projects, both personal ones and the descriptions of those I worked on during the years. One of the personal projects is TypingRealm - a tool & game to help learn touchtyping. It\s a network game and involves a bunch of concurrency concerns.';

        routerElement.appendChild(p);
        return;
    }

    // Load main page if route contains unknown path.
    navigationBarElement.innerHTML = '';
    await mainpage.refreshPageAsync(routerElement, currentPath);
}

function refreshNavigationBar() {
    navigationBarElement.innerHTML = '';

    const firstPart = currentPath.split('/')[1];
    const secondPart = currentPath.split('/').slice(2).join('/');

    const home = document.createElement('a');
    home.innerHTML = 'Home';
    home.classList.add('navigation-link');
    home.setAttribute('href', '#/');

    const navigationFirstPart = document.createElement('a');
    navigationFirstPart.innerHTML = firstPart;
    navigationFirstPart.classList.add('navigation-link');
    navigationFirstPart.setAttribute('href', `#/${firstPart}`)

    const navigationSecondPart = document.createElement('a');
    if (secondPart) {
        navigationSecondPart.innerHTML = secondPart;
        navigationSecondPart.classList.add('navigation-link');
        navigationSecondPart.setAttribute('href', `#/${firstPart}/${secondPart}`);
    }

    navigationBarElement.appendChild(home);
    navigationBarElement.appendChild(navigationFirstPart);
    if (secondPart) {
        navigationBarElement.appendChild(navigationSecondPart);
    }
}

export { processRoutingAsync };