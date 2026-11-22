
/**
 * Seeds realistic, connected data: admin / tutor / student accounts,
 * 12 approved tuitions and sample applications.
 *
 * Run with: npm run seed
 */
import "dotenv/config";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { createAuth } from "../config/auth.js";

const adminEmail = process.env.ADMIN_EMAIL || "admin@mentorlagbe.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
const tutorEmail = process.env.TUTOR_EMAIL || "tutor@mentorlagbe.com";
const tutorPassword = process.env.TUTOR_PASSWORD || "Tutor@12345";
const studentEmail = process.env.STUDENT_EMAIL || "student@mentorlagbe.com";
const studentPassword = process.env.STUDENT_PASSWORD || "Student@12345";

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const accounts = [
  { name: "Admin Rahman", email: adminEmail, password: adminPassword, role: "admin" },
  { name: "Sadia Karim", email: tutorEmail, password: tutorPassword, role: "tutor" },
  {
    name: "Tanvir Hossain",
    email: "tanvir.tutor@mentorlagbe.com",
    password: "Tutor@12345",
    role: "tutor",
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.tutor@mentorlagbe.com",
    password: "Tutor@12345",
    role: "tutor",
  },
  {
    name: "Rahim Uddin",
    email: studentEmail,
    password: studentPassword,
    role: "student",
  },
  {
    name: "Karim Sheikh",
    email: "karim.student@mentorlagbe.com",
    password: "Student@12345",
    role: "student",
  },
  {
    name: "Mim Akter",
    email: "mim.student@mentorlagbe.com",
    password: "Student@12345",
    role: "student",
  },
] as const;

const tuitionSeeds = [
  {
    title: "HSC Physics — Mechanics & Electromagnetism Batch",
    subjects: ["Physics"],
    classLevel: "HSC",
    mode: "online",
    location: "Online",
    monthlyFee: 2500,
    daysPerWeek: 3,
    hoursPerDay: 2,
    tutorIndex: 1,
    image: image("photo-1532094349884-543bc11b234d"),
    description:
      "A focused HSC Physics batch covering mechanics, electricity and magnetism with weekly mock tests, solved past papers and individual doubt-clearing sessions.",
  },
  {
    title: "Secondary School Mathematics — Class 8 to 10",
    subjects: ["Math"],
    classLevel: "Class 9",
    mode: "offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 3000,
    daysPerWeek: 4,
    hoursPerDay: 2,
    tutorIndex: 2,
    image: image("photo-1635070041078-e363dbe005cb"),
    description:
      "Build a strong foundation in algebra, geometry and trigonometry. Small offline batches with step-by-step problem solving and regular homework review.",
  },
  {
    title: "Complete Web Development Bootcamp",
    subjects: ["Programming", "Web Development"],
    classLevel: "University",
    mode: "online",
    location: "Online",
    monthlyFee: 6000,
    daysPerWeek: 3,
    hoursPerDay: 2,
    tutorIndex: 3,
    image: image("photo-1555066931-4365d14bab8c"),
    description:
      "Learn HTML, CSS, JavaScript, React and Node.js by building real projects. Includes code reviews, Git workflow and portfolio guidance for beginners.",
  },
  {
    title: "IELTS Academic — Target Band 7+",
    subjects: ["IELTS", "English"],
    classLevel: "University",
    mode: "online",
    location: "Online",
    monthlyFee: 4500,
    daysPerWeek: 3,
    hoursPerDay: 1.5,
    tutorIndex: 1,
    image: image("photo-1456513080510-7bf3a84b82f8"),
    description:
      " Intensive IELTS preparation with speaking practice, writing task feedback, listening drills and proven strategies for all four modules.",
  },
  {
    title: "SSC Chemistry — Organic & Inorganic Made Easy",
    subjects: ["Chemistry"],
    classLevel: "SSC",
    mode: "offline",
    location: "Uttara, Dhaka",
    monthlyFee: 2200,
    daysPerWeek: 3,
    hoursPerDay: 1.5,
    tutorIndex: 2,
    image: image("photo-1532094349884-543bc11b234d"),
    description:
      "Simplify chemical bonding, organic reactions and stoichiometry with visual explanations, formula sheets and weekly assessment tests.",
  },
  {
    title: "Primary School English & Spoken Confidence",
    subjects: ["English"],
    classLevel: "Class 5",
    mode: "online",
    location: "Online",
    monthlyFee: 1800,
    daysPerWeek: 2,
    hoursPerDay: 1,
    tutorIndex: 3,
    image: image("photo-1503676260728-1c00da094a0b"),
    description:
      "Friendly interactive classes for young learners focusing on reading, grammar, vocabulary and confident spoken English through games and stories.",
  },
  {
    title: "University Calculus & Linear Algebra Support",
    subjects: ["Math"],
    classLevel: "University",
    mode: "online",
    location: "Online",
    monthlyFee: 5000,
    daysPerWeek: 2,
    hoursPerDay: 2,
    tutorIndex: 1,
    image: image("photo-1513258496099-48168024aec0"),
    description:
      "University-level calculus and linear algebra mentoring with theorem walkthroughs, assignment support and exam-style problem sets.",
  },
  {
    title: "SSC Biology — Human Body & Plant Life",
    subjects: ["Biology"],
    classLevel: "SSC",
    mode: "offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 2000,
    daysPerWeek: 3,
    hoursPerDay: 1.5,
    tutorIndex: 2,
    image: image("photo-1576086213369-97a306d36557"),
    description:
      "Diagram-based Biology classes covering human physiology, genetics and botany with model tests and memorisation techniques.",
  },
  {
    title: "Python for Absolute Beginners",
    subjects: ["Programming"],
    classLevel: "Class 11",
    mode: "online",
    location: "Online",
    monthlyFee: 3500,
    daysPerWeek: 2,
    hoursPerDay: 2,
    tutorIndex: 3,
    image: image("photo-1516321318423-f06f85e504b3"),
    description:
      "Start from zero and learn Python fundamentals, loops, functions and small projects with friendly guidance and hands-on coding practice.",
  },
  {
    title: "HSC English Literature & Composition",
    subjects: ["English"],
    classLevel: "HSC",
    mode: "online",
    location: "Online",
    monthlyFee: 2600,
    daysPerWeek: 2,
    hoursPerDay: 1.5,
    tutorIndex: 1,
    image: image("photo-1524178232363-1fb2b075b655"),
    description:
      "Explore prescribed texts, literary devices and essay writing techniques. Includes model answers and personalised feedback on every composition.",
  },
  {
    title: "Class 6-8 Science Group Tuition",
    subjects: ["Physics", "Chemistry", "Biology"],
    classLevel: "Class 7",
    mode: "offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 2400,
    daysPerWeek: 4,
    hoursPerDay: 1.5,
    tutorIndex: 2,
    image: image("photo-1509062522246-3755977927d7"),
    description:
      "A balanced general science batch for school students with experiments, illustrations, weekly quizzes and concept maps for every chapter.",
  },
  {
    title: "Data Structures & Algorithm Interview Prep",
    subjects: ["Programming"],
    classLevel: "University",
    mode: "online",
    location: "Online",
    monthlyFee: 7000,
    daysPerWeek: 3,
    hoursPerDay: 2,
    tutorIndex: 3,
    image: image("photo-1523240795612-9a054b0db644"),
    description:
      "Interview-focused DSA training covering arrays, trees, graphs and dynamic programming with live problem solving and mock technical interviews.",
  },
];

async function ensureAccount(auth: ReturnType<typeof createAuth>, account: (typeof accounts)[number]) {
  const db = await connectDB();
  const users = db.collection("users");
  const existing = await users.findOne({ email: account.email });

  if (existing) {
    if (account.role === "admin" && existing.role !== "admin") {
      await users.updateOne(
        { email: account.email },
        { $set: { role: "admin", plan: "free", updatedAt: new Date() } }
      );
      console.log(`Promoted ${account.email} to admin.`);
    }
    return existing;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
    },
  });

  console.log(`Created ${account.role}: ${account.email}`);
  return result?.user ?? (await users.findOne({ email: account.email }));
}

async function main() {
  const db = await connectDB();
  const auth = createAuth(db);
  const users = db.collection("users");
  const tuitions = db.collection("tuitions");
  const applications = db.collection("applications");

  const createdUsers: Awaited<ReturnType<typeof ensureAccount>>[] = [];
  for (const account of accounts) {
    createdUsers.push(await ensureAccount(auth, account));
  }

  const userIdOf = (user: Record<string, unknown> | null | undefined) =>
    String((user && (user._id ?? user.id)) || "");

  const tutorIds = [1, 2, 3].map((index) =>
    userIdOf(createdUsers[index] as unknown as Record<string, unknown>)
  );

  const tuitionIds: ObjectId[] = [];
  for (const seed of tuitionSeeds) {
    const tutorId = tutorIds[seed.tutorIndex - 1];
    const tutor = await users.findOne({
      $or: [
        { id: tutorId },
        ...(ObjectId.isValid(tutorId) ? [{ _id: new ObjectId(tutorId) }] : []),
      ],
    });
    const now = new Date(Date.now() - tuitionIds.length * 86400000);

    const result = await tuitions.updateOne(
      { title: seed.title, tutorId },
      {
        $setOnInsert: {
          title: seed.title,
          description: seed.description,
          classLevel: seed.classLevel,
          subjects: seed.subjects,
          subject: seed.subjects[0],
          salary: seed.monthlyFee,
          monthlyFee: seed.monthlyFee,
          daysPerWeek: seed.daysPerWeek,
          hoursPerDay: seed.hoursPerDay,
          mode: seed.mode,
          tuitionType: seed.mode === "online" ? "online" : "home",
          location: seed.location,
          preferredGender: "any",
          bannerImage: seed.image,
          tutorId,
          tutorName: tutor?.name ?? "MentorLagbe Tutor",
          tutorEmail: tutor?.email ?? tutorEmail,
          status: "approved",
          approvalStatus: "approved",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    const saved = result.upsertedId
      ? new ObjectId(result.upsertedId)
      : (
          await tuitions.findOne({ title: seed.title, tutorId })
        )?._id;

    if (saved) tuitionIds.push(new ObjectId(saved));
  }

  console.log(`Seeded ${tuitionIds.length} approved tuitions.`);

  const applicationSeeds = [
    { tuitionIndex: 0, studentIndex: 4, status: "pending" },
    { tuitionIndex: 2, studentIndex: 4, status: "accepted" },
    { tuitionIndex: 5, studentIndex: 5, status: "pending" },
    { tuitionIndex: 8, studentIndex: 5, status: "rejected" },
    { tuitionIndex: 9, studentIndex: 6, status: "accepted" },
  ];

  for (const item of applicationSeeds) {
    const tuition = await tuitions.findOne({ _id: tuitionIds[item.tuitionIndex] });
    const student = createdUsers[item.studentIndex];
    if (!tuition || !student) continue;

    const studentId = userIdOf(student as unknown as Record<string, unknown>);
    const now = new Date(Date.now() - item.tuitionIndex * 86400000);
    const result = await applications.updateOne(
      { tuitionId: tuition._id, studentId },
      {
        $setOnInsert: {
          tuitionId: tuition._id,
          tutorId: tuition.tutorId,
          tutorName: tuition.tutorName,
          tutorEmail: tuition.tutorEmail,
          studentId,
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: "+8801712345678",
          phone: "+8801712345678",
          tuitionTitle: tuition.title,
          subject: tuition.subject,
          monthlyFee: tuition.monthlyFee,
          preferredSchedule: "Evening batches after 6pm",
          studentNote: "I am motivated to learn and would like a structured weekly plan.",
          status: item.status,
          appliedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount) console.log("Added a sample application.");
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { closeDB } = await import("../config/db.js");
    closeDB();
  });
