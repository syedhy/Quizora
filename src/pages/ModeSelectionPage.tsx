import * as React from 'react';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { modes, percent, type Question, type QuizMode, type QuizStats } from '@/quiz';

type AppHeaderProps = {
  active: string;
  goHome: () => void;
};

export function AppHeader({ active, goHome }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand-mark dark" onClick={goHome} type="button">
        Quizora
      </button>
      <div className="header-tabs">
        <span>{active}</span>
      </div>
    </header>
  );
}

type ModeSelectionPageProps = {
  fileName: string;
  goHome: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  questions: Question[];
  startQuiz: (mode: QuizMode) => void;
  stats: QuizStats;
  status: string;
};

export function ModeSelectionPage({
  fileName,
  goHome,
  handleFileUpload,
  questions,
  startQuiz,
  stats,
  status,
}: ModeSelectionPageProps) {
  const [uploadHelpOpen, setUploadHelpOpen] = React.useState(false);

  return (
    <main className="page-shell">
      <AppHeader active="Modes" goHome={goHome} />

      <section className="mode-grid">
        <div className="mode-copy">
          <p className="section-kicker">Mode selection</p>
          <h1>Choose the pressure, then stay in flow.</h1>
          <p>
            Load a plain text set and pick the pace. The interface keeps the rules visible without
            making the quiz feel heavy.
          </p>

          <div className="file-row">
            <button className="file-chip" onClick={() => setUploadHelpOpen(true)} type="button">
              Load txt file
            </button>
            <span>
              {status} · {fileName}
            </span>
          </div>

          <div className="mode-card-grid">
            {modes.map((mode) => (
              <button
                className="mode-card"
                disabled={!questions.length}
                key={mode.id}
                onClick={() => startQuiz(mode.id)}
                type="button"
              >
                <span>{mode.kicker}</span>
                <strong>{mode.title}</strong>
                <p>{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        <ScoreStatsCard stats={stats} questionCount={questions.length} />
      </section>

      {uploadHelpOpen ? (
        <UploadFormatModal
          close={() => setUploadHelpOpen(false)}
          handleFileUpload={(event) => {
            handleFileUpload(event);
            setUploadHelpOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}

type UploadFormatModalProps = {
  close: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function UploadFormatModal({ close, handleFileUpload }: UploadFormatModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="upload-format-title">
      <section className="upload-modal">
        <button className="modal-close" onClick={close} type="button" aria-label="Close upload format dialog">
          Close
        </button>
        <p className="section-kicker">Txt format</p>
        <h2 id="upload-format-title">Format each question like this.</h2>
        <pre>{`Question: Your question here?
A) First option
B) Second option
C) Third option
D) Fourth option
Answer: B`}</pre>
        <p>Keep one blank line between question blocks. Answers must use A, B, C, or D.</p>
        <label className="file-chip modal-upload">
          <input className="sr-only" type="file" accept=".txt,text/plain" onChange={handleFileUpload} />
          Choose txt file
        </label>
      </section>
    </div>
  );
}

type ScoreStatsCardProps = {
  questionCount: number;
  stats: QuizStats;
};

function ScoreStatsCard({ questionCount, stats }: ScoreStatsCardProps) {
  const totalAnswered = stats.totalCorrect + stats.totalWrong;
  const statItems = [
    ['quizzes', stats.quizzesPlayed],
    ['right', stats.totalCorrect],
    ['wrong', stats.totalWrong],
    ['accuracy', `${percent(stats.totalCorrect, totalAnswered)}%`],
  ];

  return (
    <CardContainer className="stats-tilt-wrap">
      <CardBody className="stats-card">
        <CardItem translateZ={26}>
          <p className="section-kicker">Scorecard</p>
          <h2>Your practice pulse</h2>
        </CardItem>

        <CardItem className="stats-ring-wrap" translateZ={8}>
          <div className="stats-ring" style={{ '--score': `${stats.bestPercent}%` } as React.CSSProperties}>
            <span>{stats.bestPercent}%</span>
            <small>best</small>
          </div>
        </CardItem>

        <CardItem className="stats-grid" translateZ={24}>
          {statItems.map(([label, value]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </CardItem>

        <CardItem className="stats-note" translateZ={14}>
          Current file has {questionCount} questions.
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
