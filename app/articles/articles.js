import { articleFactory } from "../shared/index.js";

const prefix = "articles";
const articles = ["linux/going-back-to-linux", "dvorak", "stuttering-issue"];

const refreshPageAsync = articleFactory(prefix, articles).refreshPageAsync;
export { refreshPageAsync };
