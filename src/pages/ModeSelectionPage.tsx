import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import {
  modes,
  percent,
  type LlmQuizConfig,
  type Question,
  type QuizDifficulty,
  type QuizMode,
  type QuizStats,
} from '@/quiz';

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
  generateLlmQuiz: (config: LlmQuizConfig) => Promise<boolean>;
  goHome: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isGeneratingQuiz: boolean;
  llmStatus: string;
  questions: Question[];
  startQuiz: (mode: QuizMode) => void;
  stats: QuizStats;
  status: string;
};

export function ModeSelectionPage({
  fileName,
  generateLlmQuiz,
  goHome,
  handleFileUpload,
  isGeneratingQuiz,
  llmStatus,
  questions,
  startQuiz,
  stats,
  status,
}: ModeSelectionPageProps) {
  const [uploadHelpOpen, setUploadHelpOpen] = React.useState(false);
  const [llmSetupOpen, setLlmSetupOpen] = React.useState(false);

  return (
    <main className="page-shell">
      <AppHeader active="Modes" goHome={goHome} />

      <section className="mode-grid">
        <div className="mode-copy">
          <p className="section-kicker">Mode selection</p>
          <h1>Choose your quiz mode.</h1>
          <p>
            Load a text set, pick a pace, or generate a fresh quiz from a topic.
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
                disabled={mode.id !== 'llm' && !questions.length}
                key={mode.id}
                onClick={() => {
                  if (mode.id === 'llm') {
                    setLlmSetupOpen(true);
                    return;
                  }

                  startQuiz(mode.id);
                }}
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

      {llmSetupOpen ? (
        <LlmQuizModal
          close={() => setLlmSetupOpen(false)}
          generateLlmQuiz={async (config) => {
            const wasGenerated = await generateLlmQuiz(config);

            if (wasGenerated) {
              setLlmSetupOpen(false);
            }
          }}
          isGeneratingQuiz={isGeneratingQuiz}
          llmStatus={llmStatus}
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

type LlmQuizModalProps = {
  close: () => void;
  generateLlmQuiz: (config: LlmQuizConfig) => Promise<boolean>;
  isGeneratingQuiz: boolean;
  llmStatus: string;
};

const geminiModel = 'gemini-2.5-flash';
const envGeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';

function LlmQuizModal({ close, generateLlmQuiz, isGeneratingQuiz, llmStatus }: LlmQuizModalProps) {
  const [difficulty, setDifficulty] = React.useState<QuizDifficulty>('medium');
  const [model, setModel] = React.useState(geminiModel);
  const [topic, setTopic] = React.useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!topic.trim() || !envGeminiApiKey.trim()) {
      return;
    }

    await generateLlmQuiz({
      apiKey: envGeminiApiKey,
      difficulty,
      model,
      provider: 'gemini',
      topic,
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="llm-quiz-title">
      <form className="upload-modal llm-modal" onSubmit={handleSubmit}>
        <button className="modal-close" disabled={isGeneratingQuiz} onClick={close} type="button">
          Close
        </button>
        <p className="section-kicker">LLM mode</p>
        <h2 id="llm-quiz-title">Generate a 10-question quiz.</h2>

        <label className="llm-field">
          <span>Topic</span>
          <input
            onChange={(event) => setTopic(event.target.value)}
            placeholder="World history, React hooks, space science..."
            required
            type="text"
            value={topic}
          />
        </label>

        <div className="llm-form-grid">
          <label className="llm-field">
            <span>Difficulty</span>
            <select onChange={(event) => setDifficulty(event.target.value as QuizDifficulty)} value={difficulty}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <label className="llm-field">
          <span>Model</span>
          <input onChange={(event) => setModel(event.target.value)} required type="text" value={model} />
        </label>

        <p className="llm-note">
          {envGeminiApiKey ? 'Gemini key loaded from .env.' : 'Add VITE_GEMINI_API_KEY to .env and restart the dev server.'}
        </p>
        {llmStatus ? <p className="llm-status">{llmStatus}</p> : null}

        <Button disabled={isGeneratingQuiz || !topic.trim() || !envGeminiApiKey} type="submit">
          {isGeneratingQuiz ? 'Generating...' : 'Generate quiz'}
        </Button>
      </form>
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
