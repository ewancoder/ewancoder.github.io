import { articleFactory } from '../shared/index.js';

const prefix = 'dev';
const articles = [
    'concurrency/introduction',
    'concurrency/thread-pool',
    'concurrency/task'
];

const refreshPageAsync = articleFactory(prefix, articles).refreshPageAsync;
export { refreshPageAsync };