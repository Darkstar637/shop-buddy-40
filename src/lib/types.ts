export interface Tenant {
  id: string;
  shopNumber: number;
  name: string;
  mobile: string;
  countryCode: string;
  monthlyRent: number;
  rentDueDay: number;
  status: "occupied" | "vacant";
}

export interface Payment {
  id: string;
  tenantId: string;
  month: number; // 0-11
  year: number;
  paymentDate: string;
  mode: "Cash" | "UPI" | "Bank";
  amount: number;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const OWNER_NAME = "Property Owner";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
