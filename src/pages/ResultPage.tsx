import { Button } from '@/components/ui/button';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { cn } from '@/lib/utils';
import { modes, type FinishReason, type OptionKey, type Question, type QuizMode } from '@/quiz';
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
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const skippedCount = Math.max(0, resultReachedCount - answeredCount);
  const notReachedCount = Math.max(0, resultTotal - resultReachedCount);
  const modeTitle = modes.find((mode) => mode.id === selectedMode)?.title ?? selectedMode;
  const resultLabel = percentScore >= 85 ? 'Legendary run' : percentScore >= 60 ? 'Sharp showing' : 'Room to level up';

  return (
    <main className="result-page app-page">
      <AppHeader goHome={goModes} />

      <section className="result-stage">
        <CardContainer className="result-card-tilt">
          <CardBody className="result-title-card" role="article" aria-label="Quiz results summary">
            <CardItem className="result-doodle-mark" translateZ={70} aria-hidden="true">
              <span>{percentScore}%</span>
            </CardItem>
            <CardItem translateZ={34}>
              <p className="section-kicker">{resultCopy[finishReason]}</p>
            </CardItem>
            <CardItem translateZ={54}>
              <h1>{resultLabel}</h1>
            </CardItem>
            <CardItem translateZ={38}>
              <p className="result-score">
                {score}/{resultTotal} correct in {fileName}
              </p>
            </CardItem>
            <CardItem className="result-meta-grid" translateZ={28} aria-label="Result highlights">
              <span>
                <strong>{modeTitle}</strong>
                Mode
              </span>
              <span>
                <strong>{answeredCount}</strong>
                Attempted
              </span>
              <span>
                <strong>{skippedCount + notReachedCount}</strong>
                Skipped
              </span>
            </CardItem>
            <CardItem className="result-actions" translateZ={42}>
              <Button onClick={restartQuiz} variant="solid">
                Try again
              </Button>
              <Button onClick={goModes} variant="ghost">
                Change setup
              </Button>
            </CardItem>
            <CardItem translateZ={34}>
              <a
                className="result-idea-link"
                href="mailto:syedhyderalihamdani@gmail.com?subject=Quizora%20quiz%20idea"
              >
                Tell us ideas for your next quiz
              </a>
            </CardItem>
          </CardBody>
        </CardContainer>

        <section className="review-panel" aria-labelledby="review-title">
          <div className="review-heading">
            <p className="section-kicker">Question review</p>
            <h2 id="review-title">What happened out there</h2>
          </div>
          <div className="review-items">
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
