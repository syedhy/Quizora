import type { QuizPreset } from '@/quiz';
import type { QuizPack } from './builders';

const cardModules = import.meta.glob<{ default: QuizPack }>('./cards/*.ts', {
  eager: true,
});

export const quizPresets: QuizPreset[] = Object.values(cardModules)
  .map((module) => module.default)
  .sort((left, right) => {
    const leftOrder = left.libraryOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.libraryOrder ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder || left.title.localeCompare(right.title);
  });
