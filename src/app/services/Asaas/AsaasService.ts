import axios from 'axios';

const AsaasApi = axios.create({
  baseURL: 'https://www.asaas.com/api/v3',
  headers: {
    'Content-Type': 'application/json',
    'access_token': process.env.ASAAS_ACCESS_TOKEN
  }
});

export default AsaasApi;
