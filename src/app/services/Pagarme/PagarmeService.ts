import axios from 'axios';

const PagarmeApi = axios.create({
  baseURL: 'https://api.pagar.me/1',
  headers: {
    'Content-Type': 'application/json'
  }
});

PagarmeApi.interceptors.request.use(config => {
  config.params = config.params || {};
  config.params['api_key'] = process.env.PAGARME_API_KEY;
  return config;
});

export default PagarmeApi;
