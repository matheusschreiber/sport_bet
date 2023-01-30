import axios from 'axios';

const api = axios.create({
  // baseURL:'http://localhost:8080'
  // baseURL:'https://sportbet-production.up.railway.app'
  baseURL:'https://sport-bet.cyclic.app'
})

export default api;
