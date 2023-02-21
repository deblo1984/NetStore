import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { PaginatedResponse } from '../app/models/pagination';
import { router } from '../app/routes/Routes';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

//for loading component test purpose
//const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('user')!);
  if (token) config.headers.Authorization = `Bearer ${token.token}`;
  return config;
});

axios.interceptors.response.use(
  async (response) => {
    if (process.env.NODE_ENV === 'development') await sleep();
    const pagination = response.headers['pagination'];
    if (pagination) {
      response.data = new PaginatedResponse(response.data, JSON.parse(pagination));
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse;
    switch (status) {
      case 400:
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 403:
        toast.error('You are not allowed to do that');
        break;
      case 500:
        router.navigate('/server-error', { state: { error: data } });
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const requests = {
  get: (url: string, params?: URLSearchParams) => axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  postForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
  putForm: (url: string, data: FormData) =>
    axios
      .put(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
};

function createFormData(item: any) {
  let formData = new FormData();
  for (const key in item) {
    formData.append(key, item[key]);
  }
  return formData;
}

const admin = {
  createProduct: (product: any) => requests.post('products', createFormData(product)),
  updateProduct: (product: any) => requests.put('products', createFormData(product)),
  deleteProduct: (id: number) => requests.delete(`products/${id}`),
};

const catalog = {
  list: (params: URLSearchParams) => requests.get('products', params),
  details: (id: number) => requests.get(`products/${id}`),
  fetchFilters: () => requests.get('products/filters'),
};

const testErrors = {
  get400Error: () => requests.get('buggy/bad-request'),
  get401Error: () => requests.get('buggy/unauthorized'),
  get404Error: () => requests.get('buggy/not-found'),
  get500Error: () => requests.get('buggy/server-error'),
  getValidationError: () => requests.get('buggy/validation-error'),
};

const basket = {
  get: () => requests.get('basket'),
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

const account = {
  login: (values: any) => requests.post('account/login', values),
  register: (values: any) => requests.post('account/register', values),
  currentUser: () => requests.get('account/currentUser'),
  fetchAddress: () => requests.get('account/savedAddress'),
};

const orders = {
  list: () => requests.get('orders'),
  fetch: (id: number) => requests.get(`orders/${id}`),
  create: (values: any) => requests.post('orders', values),
};

const agent = {
  admin,
  catalog,
  testErrors,
  basket,
  account,
  orders,
};

export default agent;
