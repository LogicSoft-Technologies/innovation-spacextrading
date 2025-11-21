// paymentMethodServices
import api from "../config/api";

// Get all payment methods
export const getPaymentMethods = async () => {
  const res = await api.get("/payment-methods");
  return res.data;
};

// Create payment method
export const createPaymentMethod = async (data) => {
  const res = await api.post("/payment-methods", data);
  return res.data;
};

// Update method
export const updatePaymentMethod = async (id, data) => {
  const res = await api.put(`/payment-methods/${id}`, data);
  return res.data;
};

// Delete method
export const deletePaymentMethod = async (id) => {
  const res = await api.delete(`/payment-methods/${id}`);
  return res.data;
};
