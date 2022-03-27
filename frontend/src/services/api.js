import axios from 'axios';

const api = axios.create({
  // baseURL:'http://localhost:8080'
  baseURL:'https://sportbet-backend.herokuapp.com/'
})

export default api;
