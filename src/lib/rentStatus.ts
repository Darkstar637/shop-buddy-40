import { Tenant } from "./types";
import { isMonthPaid } from "./store";

export type RentUrgency = "overdue" | "due-soon" | "normal";

export function getRentUrgency(tenant: Tenant): RentUrgency {
  if (tenant.status !== "occupied") return "normal";

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (!isMonthPaid(tenant.id, currentMonth, currentYear)) {
    const dayOfMonth = now.getDate();
    if (dayOfMonth > tenant.rentDueDay) return "overdue";
    if (tenant.rentDueDay - dayOfMonth <= 3) return "due-soon";
  }

  return "normal";
}

export function urgencyStyles(urgency: RentUrgency): string {
  switch (urgency) {
    case "overdue":
      return "border-destructive/40 bg-destructive/5";
    case "due-soon":
      return "border-warning/40 bg-warning/5";
    default:
      return "";
  }
}

export function urgencyBadge(urgency: RentUrgency): { label: string; className: string } | null {
  switch (urgency) {
    case "overdue":
      return { label: "Overdue", className: "bg-destructive/10 text-destructive" };
    case "due-soon":
      return { label: "Due soon", className: "bg-warning/10 text-warning-foreground" };
    default:
      return null;
  }
}
