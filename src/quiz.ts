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

export type SavedQuiz = {
  createdAt: number;
  id: string;
  questions: Question[];
  seenQuestionIds: string[];
  title: string;
};

export const SAVED_QUIZZES_KEY = 'quizora-saved-quizzes-v1';

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

export function readSavedQuizzes(): SavedQuiz[] {
  try {
    const raw = window.localStorage.getItem(SAVED_QUIZZES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function writeSavedQuizzes(quizzes: SavedQuiz[]): void {
  try {
    window.localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(quizzes));
  } catch (err) {
    console.error('Failed to save quizzes', err);
  }
}

export function saveQuiz(title: string, questions: Question[], existingId?: string): SavedQuiz {
  const current = readSavedQuizzes();
  const id = existingId || `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const cleanTitle = title.trim() || 'Custom Quiz';
  const existingIndex = current.findIndex((q) => q.id === id);

  const savedItem: SavedQuiz = {
    createdAt: existingIndex >= 0 ? current[existingIndex].createdAt : Date.now(),
    id,
    questions,
    seenQuestionIds: existingIndex >= 0 ? current[existingIndex].seenQuestionIds : [],
    title: cleanTitle,
  };

  if (existingIndex >= 0) {
    current[existingIndex] = savedItem;
  } else {
    current.unshift(savedItem);
  }

  writeSavedQuizzes(current);
  return savedItem;
}

export function deleteSavedQuiz(id: string): SavedQuiz[] {
  const current = readSavedQuizzes().filter((q) => q.id !== id);
  writeSavedQuizzes(current);
  return current;
}

export function resetSavedQuizRotation(id: string): SavedQuiz[] {
  const current = readSavedQuizzes().map((q) => {
    if (q.id === id) {
      return { ...q, seenQuestionIds: [] };
    }
    return q;
  });
  writeSavedQuizzes(current);
  return current;
}

export function updateSavedQuizSeen(id: string, newlySeenIds: string[]): SavedQuiz[] {
  const current = readSavedQuizzes().map((q) => {
    if (q.id === id) {
      const seenSet = new Set(q.seenQuestionIds);
      newlySeenIds.forEach((sid) => seenSet.add(sid));
      const allSeen = q.questions.every((item) => seenSet.has(item.id));
      return {
        ...q,
        seenQuestionIds: allSeen ? [] : Array.from(seenSet),
      };
    }
    return q;
  });
  writeSavedQuizzes(current);
  return current;
}

export type RotationResult = {
  isNewCycle: boolean;
  nextSeenIds: string[];
  questions: Question[];
  seenCountBefore: number;
  totalQuestions: number;
};

export function selectQuestionsWithRotation(
  quiz: { id: string; questions: Question[]; seenQuestionIds: string[] },
  requestedCount: number,
): RotationResult {
  const total = quiz.questions.length;
  const countToPick = Math.min(requestedCount, total);

  if (total === 0) {
    return {
      isNewCycle: true,
      nextSeenIds: [],
      questions: [],
      seenCountBefore: 0,
      totalQuestions: 0,
    };
  }

  const seenSet = new Set(quiz.seenQuestionIds);
  let unseen = quiz.questions.filter((q) => !seenSet.has(q.id));
  let isNewCycle = false;

  // If all questions in the rotation have already been seen, start fresh cycle
  if (unseen.length === 0) {
    unseen = [...quiz.questions];
    seenSet.clear();
    isNewCycle = true;
  }

  const shuffledUnseen = shuffleQuestions(unseen);

  if (shuffledUnseen.length >= countToPick) {
    const picked = shuffledUnseen.slice(0, countToPick);
    const newSeenIds = isNewCycle
      ? (picked.length === total ? [] : picked.map((q) => q.id))
      : (
          quiz.seenQuestionIds.length + picked.length >= total
            ? []
            : [...quiz.seenQuestionIds, ...picked.map((q) => q.id)]
        );

    return {
      isNewCycle,
      nextSeenIds: newSeenIds,
      questions: picked,
      seenCountBefore: isNewCycle ? 0 : quiz.seenQuestionIds.length,
      totalQuestions: total,
    };
  } else {
    // Unseen has fewer questions than requested count.
    // Pick all remaining unseen questions first, then roll over into next rotation
    const pickedUnseen = shuffledUnseen;
    const neededFromNextCycle = countToPick - pickedUnseen.length;

    const pickedUnseenIds = new Set(pickedUnseen.map((q) => q.id));
    const eligibleForNextCycle = quiz.questions.filter((q) => !pickedUnseenIds.has(q.id));
    const pickedNextCycle = shuffleQuestions(eligibleForNextCycle).slice(0, neededFromNextCycle);

    const allPicked = [...pickedUnseen, ...pickedNextCycle];
    const newSeenIds = pickedNextCycle.map((q) => q.id);

    return {
      isNewCycle: true,
      nextSeenIds: newSeenIds,
      questions: allPicked,
      seenCountBefore: quiz.seenQuestionIds.length,
      totalQuestions: total,
    };
  }
}
