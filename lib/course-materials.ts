export type CourseMaterial = {
  title: string;
  moduleNumber: number;
  lessonNumbers: number[];
  lessonPages?: Record<number, { start: number; range: string }>;
  type: "pdf";
  url: string;
};

export const COURSE_MATERIALS: CourseMaterial[] = [
  {
    title: "Algorithms",
    moduleNumber: 1,
    lessonNumbers: [1],
    type: "pdf",
    url: "/course-materials/module-1/algorithms.pdf",
  },
  {
    title: "Flowcharts",
    moduleNumber: 1,
    lessonNumbers: [2],
    type: "pdf",
    url: "/course-materials/module-1/flowcharts.pdf",
  },
  {
    title: "Introduction to Programming · Lecture 1.3",
    moduleNumber: 1,
    lessonNumbers: [3],
    type: "pdf",
    url: "/course-materials/module-1/introduction-to-programming-1-3.pdf",
  },
  {
    title: "Introduction to Programming · Lecture 1.4",
    moduleNumber: 1,
    lessonNumbers: [3],
    type: "pdf",
    url: "/course-materials/module-1/introduction-to-programming-1-4.pdf",
  },
  {
    title: "Conditional Statements",
    moduleNumber: 2,
    lessonNumbers: [1, 2],
    type: "pdf",
    url: "/course-materials/module-2/conditional-statements.pdf",
  },
  {
    title: "Functions and Modules",
    moduleNumber: 2,
    lessonNumbers: [4],
    type: "pdf",
    url: "/course-materials/module-2/functions-and-modules.pdf",
  },
  {
    title: "Lists · Practice 1",
    moduleNumber: 2,
    lessonNumbers: [5],
    type: "pdf",
    url: "/course-materials/module-2/collection-data-types-lists.pdf",
  },
  {
    title: "Tuples and Dictionaries · Practice 2",
    moduleNumber: 2,
    lessonNumbers: [6],
    type: "pdf",
    url: "/course-materials/module-2/collection-data-types-tuples-dictionaries.pdf",
  },
  {
    title: "Introduction to Data Science and pandas",
    moduleNumber: 3,
    lessonNumbers: [1, 2, 3, 4, 5],
    lessonPages: {
      1: { start: 4, range: "4–13" },
      2: { start: 14, range: "14–33" },
      3: { start: 34, range: "34–53" },
      4: { start: 56, range: "56–59" },
      5: { start: 60, range: "60–68" },
    },
    type: "pdf",
    url: "/course-materials/module-3/introduction-to-data-science-and-pandas.pdf",
  },
];
