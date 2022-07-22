import { articleFactory } from '../shared/index.js';

const prefix = 'dev';
const articles = [
    'concurrency/introduction/introduction',
    'concurrency/thread-pool/thread-pool',
    'concurrency/task/task'
];

const refreshPageAsync = articleFactory(prefix, articles).refreshPageAsync;
export { refreshPageAsync };