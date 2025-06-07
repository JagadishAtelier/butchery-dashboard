import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/orders`; // Update based on your backend setup

export const getOrders = () => axios.get(BASE_URL);
export const getOrderById = (id) => axios.get(`${BASE_URL}/${id}`);
export const createOrder = (data) => axios.post(BASE_URL, data);
export const updateOrder = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteOrder = (id) => axios.delete(`${BASE_URL}/${id}`);
