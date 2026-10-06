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
  { minLength: 200, size: 'clamp(1.05rem, min(1.5vw, 2.3dvh), 1.25rem)' },
  { minLength: 130, size: 'clamp(1.2rem, min(1.85vw, 2.8dvh), 1.55rem)' },
  { minLength: 80, size: 'clamp(1.4rem, min(2.3vw, 3.4dvh), 1.95rem)' },
  { minLength: 45, size: 'clamp(1.65rem, min(2.9vw, 4.3dvh), 2.35rem)' },
];
const questionPrefix = /^(?:question\s*:|q\s*:|q\d+\s*:|\d+[\.\)]\s*)/i;
const answerPrefix = /^(?:answer\s*:|ans\s*:|correct(?:\s*answer)?\s*:)/i;
const optionPrefix = /^(?:[•\-\*]\s*)?([A-D])[\.\)]/i;
const optionPattern = /^(?:[•\-\*]\s*)?([A-D])[\.\)]\s*(.+)$/i;

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
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    throw new Error('Please enter or paste at least one question.');
  }

  const blocks = normalized
    .split(/\n\s*\n+/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    throw new Error('No question blocks found. Keep at least one blank line between questions.');
  }

  return blocks.map((block, index) => {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const questionLine = lines.find((line) => questionPrefix.test(line));
    const answerLine = lines.find((line) => answerPrefix.test(line));
    const optionLines = lines.filter((line) => optionPrefix.test(line));

    if (!questionLine) {
      throw new Error(`Question ${index + 1} is missing a question prompt (e.g. "Question: ...").`);
    }

    if (optionLines.length < 2) {
      throw new Error(`Question ${index + 1} must have at least 2 options (A, B, C, D).`);
    }

    if (!answerLine) {
      throw new Error(`Question ${index + 1} is missing an answer line (e.g. "Answer: B").`);
    }

    const options = optionLines.map((line) => {
      const match = line.match(optionPattern);

      if (!match) {
        throw new Error(`Question ${index + 1} has an invalid option format: "${line}".`);
      }

      return {
        key: match[1].toUpperCase() as OptionKey,
        label: match[2].trim(),
      };
    });

    const answerMatch = answerLine.replace(answerPrefix, '').trim().match(/^[\(\[]?([A-D])[\)\]]?/i);
    if (!answerMatch) {
      throw new Error(`Question ${index + 1} answer "${answerLine}" must specify A, B, C, or D.`);
    }

    const answer = answerMatch[1].toUpperCase() as OptionKey;

    if (!options.some((item) => item.key === answer)) {
      throw new Error(`Question ${index + 1} answer (${answer}) does not match any of the provided options.`);
    }

    const promptText = questionLine.replace(questionPrefix, '').trim();
    const cleanId = `custom-${index + 1}-${promptText.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '')}`;

    return {
      answer,
      id: cleanId,
      options,
      prompt: promptText,
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
  return questionSizeSteps.find((step) => length > step.minLength)?.size ?? 'clamp(1.85rem, min(3.4vw, 5.2dvh), 2.75rem)';
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

export type RotationResult = {
  isNewCycle: boolean;
  nextSeenIds: string[];
  questions: Question[];
  seenSoFar: number;
  totalQuestions: number;
};

export function selectQuestionsWithRotation(
  sourceQuestions: Question[],
  seenIds: string[],
  requestedCount: number,
): RotationResult {
  const total = sourceQuestions.length;
  const countToPick = Math.min(requestedCount, total);

  if (total === 0) {
    return {
      isNewCycle: true,
      nextSeenIds: [],
      questions: [],
      seenSoFar: 0,
      totalQuestions: 0,
    };
  }

  const seenSet = new Set(seenIds);
  let unseen = sourceQuestions.filter((q) => !seenSet.has(q.id));
  let isNewCycle = false;

  // If all questions in the rotation have already been seen, start fresh cycle
  if (unseen.length === 0) {
    unseen = [...sourceQuestions];
    seenSet.clear();
    isNewCycle = true;
  }

  const shuffledUnseen = shuffleQuestions(unseen);

  if (shuffledUnseen.length >= countToPick) {
    const picked = shuffledUnseen.slice(0, countToPick);
    const newSeenSet = isNewCycle ? new Set<string>() : new Set(seenSet);
    picked.forEach((q) => newSeenSet.add(q.id));
    const seenCount = newSeenSet.size;
    const nextSeenIds = seenCount >= total ? [] : Array.from(newSeenSet);

    return {
      isNewCycle,
      nextSeenIds,
      questions: picked,
      seenSoFar: seenCount,
      totalQuestions: total,
    };
  }

  // Unseen has fewer questions than requested count.
  // Pick all remaining unseen questions first:
  const picked = [...shuffledUnseen];
  const neededFromNextCycle = countToPick - picked.length;

  // The cycle completes with the picked questions (all questions of the current cycle shown).
  // Draw additional questions from the new cycle, avoiding any questions in this batch:
  const pickedIds = new Set(picked.map((q) => q.id));
  const nextCyclePool = sourceQuestions.filter((q) => !pickedIds.has(q.id));
  const additional = shuffleQuestions(nextCyclePool).slice(0, neededFromNextCycle);
  picked.push(...additional);

  const nextSeenIds = additional.map((q) => q.id);

  return {
    isNewCycle: true,
    nextSeenIds,
    questions: picked,
    seenSoFar: total,
    totalQuestions: total,
  };
}

