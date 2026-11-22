
import { getCollections } from "./collections.js";

export async function createIndexes() {
  const { users, tuitions, applications, payments } =
    await getCollections();

  // Users
  await users.createIndex(
    { email: 1 },
    { unique: true }
  );

  // Tuitions
  await tuitions.createIndex({ status: 1, createdAt: -1 });
  await tuitions.createIndex({ tutorId: 1 });
  await tuitions.createIndex({ studentId: 1 });

  // Applications
  // Remove the old unique index (tuitionId + tutorId).
  const existingIndexes = await applications.indexes();

  const oldApplicationIndex = existingIndexes.find(
    (index) => index.name === "tuitionId_1_tutorId_1"
  );

  if (oldApplicationIndex) {
    await applications.dropIndex("tuitionId_1_tutorId_1");
  }

  // Prevent duplicate applications from the same student.
  // studentPhone excludes records created by the old workflow.
  await applications.createIndex(
    { tuitionId: 1, studentId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        studentPhone: { $type: "string" },
      },
    }
  );

  await applications.createIndex({ tutorId: 1, status: 1 });
  await applications.createIndex({ studentId: 1, status: 1 });

  // Payments: remove the obsolete Stripe index if it still exists.
  const paymentIndexes = await payments.indexes();
  const stripeIndex = paymentIndexes.find(
    (index) =>
      index.name !== "_id_" &&
      Object.keys(index.key).length === 1 &&
      "stripeSessionId" in index.key
  );

  if (stripeIndex?.name) {
    try {
      await payments.dropIndex(stripeIndex.name);
    } catch (error) {
      console.warn("Could not drop the old Stripe payment index.", error);
    }
  }

  // bKash submissions are also checked for duplicates in the route.
  const bkashIndex = paymentIndexes.find(
    (index) =>
      index.name !== "_id_" &&
      Object.keys(index.key).length === 1 &&
      "bkashTransactionId" in index.key
  );

  if (!bkashIndex) {
    try {
      await payments.createIndex(
        { bkashTransactionId: 1 },
        { name: "bkashTransactionId_1", unique: true, sparse: true }
      );
    } catch (error) {
      // Existing duplicate IDs should not prevent the app from starting.
      console.warn("Unique bKash index unavailable; using a non-unique index.", error);
      await payments.createIndex(
        { bkashTransactionId: 1 },
        { name: "bkashTransactionId_1", sparse: true }
      );
    }
  }

  await payments.createIndex({ paymentStatus: 1, createdAt: -1 });
  await payments.createIndex({ userId: 1, createdAt: -1 });

  console.log("MongoDB indexes created successfully.");
}
