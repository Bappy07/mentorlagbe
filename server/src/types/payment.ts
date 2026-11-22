
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
  currency: "bdt";

  paymentMethod: "bkash";
  bkashSenderNumber: string;
  bkashTransactionId: string;

  status: PaymentStatus;

  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}
