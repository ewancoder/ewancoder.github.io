import { articleFactory } from '../shared/index.js';

const prefix = 'articles';
const articles = [
    'dvorak',
    'stuttering-issue'
];

const refreshPageAsync = articleFactory(prefix, articles).refreshPageAsync;
export { refreshPageAsync };