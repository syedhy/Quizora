import type { OptionKey, Question, QuizOption, QuizPreset } from '@/quiz';

export type QuizPack = QuizPreset & {
  libraryOrder?: number;
};

function option(key: OptionKey, label: string): QuizOption {
  return { key, label };
}

export function question(prompt: string, labels: [string, string, string, string], answer: OptionKey): Omit<Question, 'id'> {
  return {
    answer,
    options: [option('A', labels[0]), option('B', labels[1]), option('C', labels[2]), option('D', labels[3])],
    prompt,
  };
}

export function makePreset(
  id: string,
  title: string,
  category: string,
  description: string,
  questions: Array<Omit<Question, 'id'>>,
  libraryOrder?: number,
): QuizPack {
  return {
    category,
    description,
    id,
    libraryOrder,
    questions: questions.map((item, index) => ({ ...item, id: `${id}-${index + 1}` })),
    title,
  };
}
