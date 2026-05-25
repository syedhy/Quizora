import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type FinishReason, type OptionKey, type Question, type QuizMode } from '@/quiz';
import { AppHeader } from './ModeSelectionPage';

const resultCopy: Record<FinishReason, string> = {
  complete: 'Quiz complete.',
  manual: 'Quiz ended early.',
  survival: 'Survival run ended.',
  time: 'The timer closed the final question.',
};

type ResultPageProps = {
  answers: Record<string, OptionKey>;
  fileName: string;
  finishReason: FinishReason;
  goModes: () => void;
  percentScore: number;
  questions: Question[];
  resultReachedCount: number;
  resultTotal: number;
  restartQuiz: () => void;
  score: number;
  selectedMode: QuizMode;
};

export function ResultPage({
  answers,
  fileName,
  finishReason,
  goModes,
  percentScore,
  questions,
  resultReachedCount,
  resultTotal,
  restartQuiz,
  score,
  selectedMode,
}: ResultPageProps) {
  const scoreLine = resultTotal ? `Score ${score}/${resultTotal}` : 'No answers yet';

  return (
    <main className="page-shell">
      <AppHeader active="Results" goHome={goModes} />

      <section className="result-layout">
        <div className="result-summary">
          <p className="section-kicker">{resultCopy[finishReason]}</p>
          <h1>{scoreLine}</h1>
          <div className="result-ring" style={{ '--score': `${percentScore}%` } as CSSProperties}>
            <span>{percentScore}%</span>
          </div>
          <div className="result-actions">
            <Button onClick={restartQuiz} variant="solid">
              Try again
            </Button>
            <Button onClick={goModes} variant="ghost">
              Change mode
            </Button>
          </div>
          <p className="result-meta">
            {selectedMode} mode · {fileName}
          </p>
        </div>

        <div className="review-list">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.answer;
            const wasReached = index < resultReachedCount;
            const wasSkipped = !userAnswer && wasReached;
            const wasNotReached = !userAnswer && !wasReached;
            const state = isCorrect ? 'correct' : userAnswer ? 'wrong' : 'skipped';
            const answerCopy = getAnswerCopy(userAnswer, question.answer, wasSkipped);

            return (
              <article className={cn('review-item', state, wasNotReached && 'not-reached')} key={question.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{question.prompt}</strong>
                  <p>{answerCopy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function getAnswerCopy(userAnswer: OptionKey | undefined, answer: OptionKey, wasSkipped: boolean) {
  if (userAnswer) {
    return `Your answer: ${userAnswer} · Correct answer: ${answer}`;
  }

  return wasSkipped ? `Skipped · Correct answer: ${answer}` : 'Not reached';
}
