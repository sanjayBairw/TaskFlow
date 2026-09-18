"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAVE_SEARCH_API_URL = exports.getBraveApiKey = void 0;
const getBraveApiKey = () => {
    return process.env.BRAVE_SEARCH_API_KEY;
};
exports.getBraveApiKey = getBraveApiKey;
exports.BRAVE_SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';
