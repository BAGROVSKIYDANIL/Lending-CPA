import { localEnvironment } from './environment.local';

export const environment = {
    production: false,
    apiUrl: 'https://cpa-server-vtel.onrender.com',
    ...localEnvironment,
};