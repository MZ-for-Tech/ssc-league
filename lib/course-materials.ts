export type CourseMaterial = {
  title: string;
  moduleNumber: number;
  type: "pdf";
  url: string;
};

export const COURSE_MATERIALS: CourseMaterial[] = [
  {
    title: "Algorithms",
    moduleNumber: 1,
    type: "pdf",
    url: "/course-materials/module-1/algorithms.pdf",
  },
  {
    title: "Flowcharts",
    moduleNumber: 1,
    type: "pdf",
    url: "/course-materials/module-1/flowcharts.pdf",
  },
  {
    title: "Introduction to Programming · Lecture 1.3",
    moduleNumber: 1,
    type: "pdf",
    url: "/course-materials/module-1/introduction-to-programming-1-3.pdf",
  },
  {
    title: "Introduction to Programming · Lecture 1.4",
    moduleNumber: 1,
    type: "pdf",
    url: "/course-materials/module-1/introduction-to-programming-1-4.pdf",
  },
  {
    title: "Conditional Statements",
    moduleNumber: 2,
    type: "pdf",
    url: "/course-materials/module-2/conditional-statements.pdf",
  },
  {
    title: "Functions and Modules",
    moduleNumber: 2,
    type: "pdf",
    url: "/course-materials/module-2/functions-and-modules.pdf",
  },
  {
    title: "Lists · Practice 1",
    moduleNumber: 2,
    type: "pdf",
    url: "/course-materials/module-2/collection-data-types-lists.pdf",
  },
  {
    title: "Tuples and Dictionaries · Practice 2",
    moduleNumber: 2,
    type: "pdf",
    url: "/course-materials/module-2/collection-data-types-tuples-dictionaries.pdf",
  },
  {
    title: "Introduction to Data Science and pandas",
    moduleNumber: 3,
    type: "pdf",
    url: "/course-materials/module-3/introduction-to-data-science-and-pandas.pdf",
  },
];
