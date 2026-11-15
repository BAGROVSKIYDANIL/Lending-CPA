export const environment = {
  production: false,
  apiUrl: import.meta.env['VITE_API_URL'] ?? 'https://cpa-server-vtel.onrender.com',
  apiHeader: import.meta.env['VITE_API_HEADER'] ?? '',
};
