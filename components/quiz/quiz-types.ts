export type Option = { id: string; text: string };
export type OptionFeedback = { optionId: string; isCorrect: boolean; justification: string | null };
export type QuizFeedback = { correctOptionId: string | null; optionFeedback: OptionFeedback[] };
export type Question = {
  id: string;
  text: string;
  points: number;
  stimulus_code: string | null;
  stimulus_asset_url: string | null;
  stimulus_asset_alt: string | null;
  QuestionOption: Option[];
  feedback: QuizFeedback | null;
};
export type AnswerRecord = {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
};
