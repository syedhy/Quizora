import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type OptionKey, type Question, type QuizMode, modes, questionFontSize } from '@/quiz';

type QuizPageProps = {
  activeMode: (typeof modes)[number];
  answers: Record<string, OptionKey>;
  chooseAnswer: (optionKey: OptionKey) => void;
  currentIndex: number;
  currentQuestion: Question;
  finishQuiz: () => void;
  goBack: () => void;
  goNext: () => void;
  goPrevious: () => void;
  progress: number;
  questionCount: number;
  score: number;
  selectedMode: QuizMode;
  timeLeft: number;
};

export function QuizPage({
  activeMode,
  answers,
  chooseAnswer,
  currentIndex,
  currentQuestion,
  finishQuiz,
  goBack,
  goNext,
  goPrevious,
  progress,
  questionCount,
  score,
  selectedMode,
  timeLeft,
}: QuizPageProps) {
  const selectedAnswer = answers[currentQuestion.id];
  const isAnswered = Boolean(selectedAnswer);
  const isClassicMode = selectedMode === 'classic';
  const questionSize = questionFontSize(currentQuestion.prompt);

  return (
    <main className="quiz-page">
      <div className="quiz-frame">
        <header className="quiz-header">
          <div>
            <button className="back-button" onClick={goBack} type="button">
              Modes
            </button>
            <p>{activeMode.title} mode</p>
            <h1>Question {currentIndex + 1}</h1>
          </div>
          <div className="quiz-metrics">
            <span>Score {score}</span>
            {selectedMode === 'timed' ? <span>{timeLeft}s</span> : <span>{currentIndex + 1}/{questionCount}</span>}
          </div>
        </header>

        <div className="quiz-progress" aria-label="Quiz progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        <section className="question-panel">
          <h2 style={{ '--question-size': questionSize } as CSSProperties}>{currentQuestion.prompt}</h2>

          <div className="answer-grid">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrect = option.key === currentQuestion.answer;
              const revealCorrect = isAnswered && isCorrect;
              const revealWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  className={cn(
                    'answer-option',
                    revealCorrect && 'is-correct',
                    revealWrong && 'is-wrong',
                    isSelected && 'is-selected',
                  )}
                  disabled={isAnswered}
                  key={option.key}
                  onClick={() => chooseAnswer(option.key)}
                  type="button"
                >
                  <span>{option.key}</span>
                  <div className="answer-copy">
                    <strong>{option.label}</strong>
                    {revealCorrect ? <small>Correct answer</small> : null}
                    {revealWrong ? <small>Your choice</small> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {isClassicMode ? (
          <div className="quiz-footer">
            <div className="quiz-footer-left">
              <Button disabled={currentIndex === 0} onClick={goPrevious} variant="ghost">
                Previous
              </Button>
              <Button onClick={finishQuiz} variant="ghost">
                End quiz
              </Button>
            </div>
            <Button disabled={!isAnswered} onClick={() => goNext()} variant="solid">
              {currentIndex === questionCount - 1 ? 'Finish quiz' : 'Next question'}
            </Button>
          </div>
        ) : (
          <div className="quiz-footer auto">
            <Button onClick={finishQuiz} variant="ghost">
              End quiz
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
