
import type { ObjectId } from "mongodb";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentPlan = "student_pro" | "tutor_pro";

export interface Payment {
  _id?: ObjectId;

  userId: ObjectId;
  userEmail: string;
  userRole: "student" | "tutor";

  plan: PaymentPlan;

  amount: number;
  currency: "usd";

  stripeSessionId: string;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;

  status: PaymentStatus;

  createdAt: Date;
  updatedAt: Date;
}
