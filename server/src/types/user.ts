
import type { ObjectId } from "mongodb";

export type UserRole = "student" | "tutor" | "admin";

export type SubscriptionPlan = "free" | "pro";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  phone?: string;
  address?: string;

  subscription: {
    plan: SubscriptionPlan;
    expiresAt?: Date;
  };

  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
