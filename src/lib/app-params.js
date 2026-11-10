const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get('clear_access_token') === 'true';

const clearStoredAccessToken = () => {
  window.localStorage.removeItem('app_access_token');
  window.localStorage.removeItem('token');
};

const getAppParams = () => {
  if (isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }

  const rawToken = isNode ? null : window.localStorage.getItem('app_access_token');

  return {
    appId: import.meta.env.VITE_APP_ID ?? 'legacy-book-app',
    token: rawToken ?? import.meta.env.VITE_APP_TOKEN ?? null,
    functionsVersion: import.meta.env.VITE_APP_FUNCTIONS_VERSION ?? 'stable',
    appBaseUrl: import.meta.env.VITE_APP_BASE_URL ?? window.location.origin,
  };
};

export const appParams = {
  ...getAppParams(),
};
