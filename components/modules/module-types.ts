export type TopicQuestion = { id: string };

export type ModuleTopic = {
  id: string;
  name: string;
  description: string | null;
  week_number: number;
  module_id: string | null;
  lesson_number: number | null;
  Question: TopicQuestion[];
};

export type CourseModule = {
  id: string;
  module_number: number;
  name: string;
  description: string | null;
};

export type StudentAnswer = { question_id: string; is_correct: boolean };
