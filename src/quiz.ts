export const STATS_KEY = 'quizora-stats-v6';

export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type QuizMode = 'classic' | 'timed' | 'survival';
export type Screen = 'setup' | 'library' | 'quiz' | 'results';
export type FinishReason = 'complete' | 'manual' | 'time' | 'survival';

export type QuizOption = {
  key: OptionKey;
  label: string;
};

export type Question = {
  answer: OptionKey;
  id: string;
  options: QuizOption[];
  prompt: string;
};

export type QuizSettings = {
  lives: number;
  mode: QuizMode;
  questionCount: number;
  secondsPerQuestion: number;
};

export type QuizPreset = {
  category: string;
  description: string;
  id: string;
  questions: Question[];
  title: string;
};

export type QuizStats = {
  bestPercent: number;
  quizzesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
};

export const defaultSettings: QuizSettings = {
  lives: 3,
  mode: 'classic',
  questionCount: 10,
  secondsPerQuestion: 30,
};

export const questionCountOptions = [5, 10, 15, 20];
export const timedSecondOptions = [15, 30, 45, 60];
export const survivalLifeOptions = [1, 3, 5];

export const defaultStats: QuizStats = {
  bestPercent: 0,
  quizzesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
};

const questionSizeSteps = [
  { minLength: 145, size: 'clamp(1.35rem, min(2.2vw, 3.8dvh), 2.2rem)' },
  { minLength: 95, size: 'clamp(1.55rem, min(2.65vw, 4.6dvh), 2.65rem)' },
  { minLength: 62, size: 'clamp(1.75rem, min(3.15vw, 5.2dvh), 3.05rem)' },
];
const questionPrefix = /^question\s*:/i;
const answerPrefix = /^answer\s*:/i;
const optionPrefix = /^[A-D]\)/i;
const optionPattern = /^([A-D])\)\s*(.+)$/i;

export const modes: Array<{
  id: QuizMode;
  title: string;
  kicker: string;
  description: string;
}> = [
  {
    id: 'classic',
    title: 'Classic',
    kicker: 'Browse freely',
    description: 'Move back and forward, reveal answers, and finish at your pace.',
  },
  {
    id: 'timed',
    title: 'Timed',
    kicker: 'Beat the clock',
    description: 'Pick your seconds per question and answer before time runs out.',
  },
  {
    id: 'survival',
    title: 'Survival',
    kicker: 'Limited lives',
    description: 'Wrong answers cost a life. Stay sharp until the deck runs dry.',
  },
];

export { quizPresets } from '@/quiz-packs';

export function parseQuestions(text: string): Question[] {
  const blocks = text
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const questionLine = lines.find((line) => questionPrefix.test(line));
    const answerLine = lines.find((line) => answerPrefix.test(line));
    const optionLines = lines.filter((line) => optionPrefix.test(line));

    if (!questionLine || optionLines.length < 2 || !answerLine) {
      throw new Error(`Question block ${index + 1} is missing a question, options, or answer.`);
    }

    const options = optionLines.map((line) => {
      const match = line.match(optionPattern);

      if (!match) {
        throw new Error(`Question block ${index + 1} has an invalid option.`);
      }

      return {
        key: match[1].toUpperCase() as OptionKey,
        label: match[2],
      };
    });

    const answer = answerLine.replace(answerPrefix, '').trim().toUpperCase() as OptionKey;

    if (!options.some((item) => item.key === answer)) {
      throw new Error(`Question block ${index + 1} has an answer that does not match an option.`);
    }

    return {
      answer,
      id: `custom-${index + 1}-${questionLine}`,
      options,
      prompt: questionLine.replace(questionPrefix, '').trim(),
    };
  });
}

export function readStats(): QuizStats {
  try {
    const saved = window.localStorage.getItem(STATS_KEY);

    if (!saved) {
      return defaultStats;
    }

    return { ...defaultStats, ...JSON.parse(saved) };
  } catch {
    return defaultStats;
  }
}

export function countCorrect(questions: Question[], answers: Record<string, OptionKey>) {
  return questions.filter((item) => answers[item.id] === item.answer).length;
}

export function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export function questionFontSize(prompt: string) {
  const length = prompt.trim().length;
  return questionSizeSteps.find((step) => length > step.minLength)?.size ?? 'clamp(2rem, min(3.8vw, 6dvh), 3.6rem)';
}

export function shuffleQuestions(questions: Question[]) {
  const nextQuestions = [...questions];

  for (let index = nextQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextQuestions[index], nextQuestions[swapIndex]] = [nextQuestions[swapIndex], nextQuestions[index]];
  }

  return nextQuestions;
}

export function selectQuestions(questions: Question[], requestedCount: number) {
  return shuffleQuestions(questions).slice(0, Math.min(requestedCount, questions.length));
}
