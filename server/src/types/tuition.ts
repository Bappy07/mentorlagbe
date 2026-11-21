
import type { ObjectId } from "mongodb";

export type TuitionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "closed";

export type TuitionType = "home" | "online";

export interface Tuition {
  _id?: ObjectId;

  title: string;
  description: string;

  studentId: ObjectId;
  studentName: string;

  classLevel: string;
  subjects: string[];

  tuitionType: TuitionType;
  location: string;

  salary: number;
  daysPerWeek: number;
  hoursPerDay: number;

  preferredGender?: "male" | "female" | "any";

  status: TuitionStatus;

  createdAt: Date;
  updatedAt: Date;
}
