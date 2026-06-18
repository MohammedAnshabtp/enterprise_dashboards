const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatINR = (value) => inrFormatter.format(Number(value) || 0);

export const buildUrl = (endpoint, query = {}) => {
  const params = new URLSearchParams(query).toString();
  return params ? `${endpoint}?${params}` : endpoint;
};

export const toFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return formData;
};
