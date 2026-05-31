const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINRFromPaise = (value: number) => inrFormatter.format(value / 100);

export const formatINR = (value: number) => inrFormatter.format(value);
