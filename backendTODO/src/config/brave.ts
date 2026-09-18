export const getBraveApiKey = (): string | undefined => {
  return process.env.BRAVE_SEARCH_API_KEY;
};

export const BRAVE_SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';
