async function refreshPageAsync(element, path) {
    const p = document.createElement('p');
    p.innerHTML = 'I like solving complex problems and learning new things. Pick a category above to learn more about me.';

    element.appendChild(p);
}

export { refreshPageAsync };