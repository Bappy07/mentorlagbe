
import type { ObjectId } from "mongodb";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  _id?: ObjectId;

  tuitionId: ObjectId;
  tutorId: ObjectId;
  studentId: ObjectId;

  tutorName: string;
  studentName: string;
  tuitionTitle: string;

  coverLetter: string;
  expectedSalary: number;

  status: ApplicationStatus;

  createdAt: Date;
  updatedAt: Date;
}
