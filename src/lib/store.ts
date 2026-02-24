import { Tenant, Payment, generateId } from "./types";

const TENANTS_KEY = "rental_tenants";
const PAYMENTS_KEY = "rental_payments";
const AUTH_KEY = "rental_auth";
const PIN_KEY = "rental_pin";

// Default shops
const defaultTenants: Tenant[] = [
  { id: generateId(), shopNumber: 1, name: "", mobile: "", countryCode: "+91", monthlyRent: 0, rentDueDay: 1, status: "vacant" },
  { id: generateId(), shopNumber: 2, name: "", mobile: "", countryCode: "+91", monthlyRent: 0, rentDueDay: 1, status: "vacant" },
  { id: generateId(), shopNumber: 3, name: "", mobile: "", countryCode: "+91", monthlyRent: 0, rentDueDay: 1, status: "vacant" },
];

export function getTenants(): Tenant[] {
  const stored = localStorage.getItem(TENANTS_KEY);
  if (!stored) {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(defaultTenants));
    return defaultTenants;
  }
  return JSON.parse(stored);
}

export function saveTenants(tenants: Tenant[]) {
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
}

export function updateTenant(updated: Tenant) {
  const tenants = getTenants();
  const idx = tenants.findIndex((t) => t.id === updated.id);
  if (idx >= 0) tenants[idx] = updated;
  saveTenants(tenants);
}

export function getPayments(): Payment[] {
  const stored = localStorage.getItem(PAYMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addPayment(payment: Payment) {
  const payments = getPayments();
  payments.push(payment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function getPaymentsForTenant(tenantId: string): Payment[] {
  return getPayments().filter((p) => p.tenantId === tenantId);
}

export function isMonthPaid(tenantId: string, month: number, year: number): boolean {
  return getPayments().some(
    (p) => p.tenantId === tenantId && p.month === month && p.year === year
  );
}

export function getPin(): string {
  return localStorage.getItem(PIN_KEY) || "1234";
}

export function setPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(val: boolean) {
  if (val) localStorage.setItem(AUTH_KEY, "true");
  else localStorage.removeItem(AUTH_KEY);
}
