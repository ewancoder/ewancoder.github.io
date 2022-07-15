import { articleFactory } from '../shared/index.js';

const prefix = 'dev';
const articles = [
    'concurrency/introduction'
];

const refreshPageAsync = articleFactory(prefix, articles).refreshPageAsync;
export { refreshPageAsync };