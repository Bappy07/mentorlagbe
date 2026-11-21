
export type Tuition = {
  id: string;
  title: string;
  classLevel: string;
  subjects: string[];
  location: string;
  salary: number;
  tuitionType: "Home" | "Online";
  daysPerWeek: number;
  postedAt: string;
};

export const tuitions: Tuition[] = [
  {
    id: "tuition-001",
    title: "Mathematics Tutor Needed",
    classLevel: "Class 9",
    subjects: ["Mathematics", "Higher Math"],
    location: "Uttara, Dhaka",
    salary: 6000,
    tuitionType: "Home",
    daysPerWeek: 4,
    postedAt: "2 hours ago",
  },
  {
    id: "tuition-002",
    title: "English Version Tutor Required",
    classLevel: "Class 6",
    subjects: ["English", "Science"],
    location: "Dhanmondi, Dhaka",
    salary: 5000,
    tuitionType: "Home",
    daysPerWeek: 5,
    postedAt: "5 hours ago",
  },
  {
    id: "tuition-003",
    title: "Physics and Chemistry Tutor",
    classLevel: "HSC 1st Year",
    subjects: ["Physics", "Chemistry"],
    location: "Mirpur 10, Dhaka",
    salary: 8000,
    tuitionType: "Home",
    daysPerWeek: 3,
    postedAt: "Yesterday",
  },
  {
    id: "tuition-004",
    title: "Primary Level All Subjects",
    classLevel: "Class 4",
    subjects: ["English", "Mathematics", "Science"],
    location: "Bashundhara, Dhaka",
    salary: 4000,
    tuitionType: "Home",
    daysPerWeek: 5,
    postedAt: "Yesterday",
  },
  {
    id: "tuition-005",
    title: "Online IELTS Preparation Tutor",
    classLevel: "IELTS",
    subjects: ["English", "IELTS"],
    location: "Online",
    salary: 7000,
    tuitionType: "Online",
    daysPerWeek: 3,
    postedAt: "2 days ago",
  },
  {
    id: "tuition-006",
    title: "Biology Tutor for Medical Preparation",
    classLevel: "Admission",
    subjects: ["Biology", "Chemistry"],
    location: "Farmgate, Dhaka",
    salary: 10000,
    tuitionType: "Home",
    daysPerWeek: 4,
    postedAt: "2 days ago",
  },
];
