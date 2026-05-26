import * as React from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type OptionKey, type Question, type QuizSettings, modes, questionFontSize } from '@/quiz';

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
  livesLeft: number;
  progress: number;
  questionCount: number;
  score: number;
  settings: QuizSettings;
  sourceTitle: string;
  sourceTotal: number;
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
  livesLeft,
  progress,
  questionCount,
  score,
  settings,
  sourceTitle,
  sourceTotal,
  timeLeft,
}: QuizPageProps) {
  const selectedAnswer = answers[currentQuestion.id];
  const isAnswered = Boolean(selectedAnswer);
  const isClassicMode = settings.mode === 'classic';
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const questionSize = questionFontSize(currentQuestion.prompt);

  return (
    <main className="quiz-page">
      <div className="quiz-frame">
        <header className="quiz-header">
          <div>
            <button className="back-button" onClick={goBack} type="button">
              Library
            </button>
            <p>
              {sourceTitle} · {activeMode.title} mode
            </p>
            <h1>Question {currentIndex + 1}</h1>
          </div>
          <div className="quiz-metrics">
            <span>Score {score}</span>
            {settings.mode === 'timed' ? <span>{timeLeft}s</span> : null}
            {settings.mode === 'survival' ? <span>{livesLeft} lives</span> : null}
            <span>
              {currentIndex + 1}/{questionCount}
            </span>
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
              const optionIsCorrect = option.key === currentQuestion.answer;
              const revealCorrect = isAnswered && optionIsCorrect;
              const revealWrong = isAnswered && isSelected && !optionIsCorrect;

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

        <CatAssistant
          currentIndex={currentIndex}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          mode={settings.mode}
          questionId={currentQuestion.id}
          sourceTotal={sourceTotal}
          usedQuestionCount={questionCount}
        />
      </div>
    </main>
  );
}

type CatAssistantProps = {
  currentIndex: number;
  isAnswered: boolean;
  isCorrect: boolean;
  mode: QuizSettings['mode'];
  questionId: string;
  sourceTotal: number;
  usedQuestionCount: number;
};

const rightAssistantImages = [
  '/assistant/right/right1.jpeg',
  '/assistant/right/right2.jpeg',
  '/assistant/right/right3.jpeg',
  '/assistant/right/right4.jpeg',
];

const wrongAssistantImages = [
  '/assistant/wrong/wrong1.jpeg',
  '/assistant/wrong/wrong2.jpeg',
  '/assistant/wrong/wrong3.jpeg',
  '/assistant/wrong/wrong4.jpeg',
];

function CatAssistant({ currentIndex, isAnswered, isCorrect, mode, questionId, sourceTotal, usedQuestionCount }: CatAssistantProps) {
  const message = getAssistantMessage(currentIndex, isAnswered, isCorrect, mode, sourceTotal, usedQuestionCount);
  const [assistantImage, setAssistantImage] = React.useState(() => randomAssistantImage(rightAssistantImages));

  React.useEffect(() => {
    const imagePool = isAnswered && !isCorrect ? wrongAssistantImages : rightAssistantImages;
    setAssistantImage((currentImage) => randomAssistantImage(imagePool, currentImage));
  }, [isAnswered, isCorrect, questionId]);

  return (
    <aside className={cn('cat-assistant', message ? 'has-bubble' : 'quiet', isAnswered && (isCorrect ? 'happy' : 'spicy'))} aria-live="polite">
      <img alt="" className="cat-avatar" src={assistantImage} />
      {message ? (
        <div className="cat-bubble">
          <p>{message}</p>
        </div>
      ) : null}
    </aside>
  );
}

function getAssistantMessage(
  currentIndex: number,
  isAnswered: boolean,
  isCorrect: boolean,
  mode: QuizSettings['mode'],
  sourceTotal: number,
  usedQuestionCount: number,
) {
  if (!isAnswered) {
    if (currentIndex > 0) {
      return '';
    }

    const countCopy = sourceTotal > usedQuestionCount ? `${usedQuestionCount} shuffled questions loaded.` : 'Fresh questions loaded.';
    return countCopy;
  }

  if (isCorrect) {
    return mode === 'survival' ? 'Clean hit. The nine lives committee approves.' : 'Correct. Tiny applause, huge brain energy.';
  }

  return mode === 'survival' ? 'Oof. A life has left the chat.' : 'Not quite. The answer dodged you with style.';
}

function randomAssistantImage(images: string[], previousImage?: string) {
  if (images.length === 1) {
    return images[0];
  }

  const availableImages = previousImage ? images.filter((image) => image !== previousImage) : images;
  return availableImages[Math.floor(Math.random() * availableImages.length)];
}
