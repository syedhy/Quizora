import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  modes,
  percent,
  questionCountOptions,
  quizPresets,
  survivalLifeOptions,
  timedSecondOptions,
  type QuizMode,
  type QuizPreset,
  type QuizSettings,
  type QuizStats,
} from '@/quiz';

type AppHeaderProps = {
  goHome: () => void;
};

export function AppHeader({ goHome }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand-mark" onClick={goHome} type="button">
        Quizora
      </button>
      <div className="header-tabs">
        <a href="mailto:syedhyderalihamdani@gmail.com?subject=Quizora%20Feedback">Reach Us</a>
      </div>
    </header>
  );
}

type SetupPageProps = {
  continueToLibrary: () => void;
  settings: QuizSettings;
  stats: QuizStats;
  updateSettings: (settings: QuizSettings) => void;
};

export function SetupPage({ continueToLibrary, settings, stats, updateSettings }: SetupPageProps) {
  function updateMode(mode: QuizMode) {
    updateSettings({ ...settings, mode });
  }

  function updateSetting<Key extends keyof QuizSettings>(key: Key, value: QuizSettings[Key]) {
    updateSettings({ ...settings, [key]: value });
  }

  return (
    <main className="page-shell app-page">
      <AppHeader goHome={() => undefined} />

      <section className="setup-layout">
        <div className="setup-copy">
          <p className="section-kicker">Quiz setup</p>
          <h1>Pick the rules before the questions pick you.</h1>
          <p>Choose a mode, tune the quick settings, then select a preset quiz or load your own file.</p>
        </div>

        <div className="setup-panel">
          <section className="control-section">
            <div>
              <p className="section-kicker">Mode</p>
              <h2>How do you want to play?</h2>
            </div>
            <div className="choice-grid mode-choice-grid">
              {modes.map((mode) => (
                <button
                  className={settings.mode === mode.id ? 'choice-card active' : 'choice-card'}
                  key={mode.id}
                  onClick={() => updateMode(mode.id)}
                  type="button"
                >
                  <span>{mode.kicker}</span>
                  <strong>{mode.title}</strong>
                  <p>{mode.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="control-section compact">
            <SettingButtons
              label="Questions"
              options={questionCountOptions}
              value={settings.questionCount}
              onChange={(value) => updateSetting('questionCount', value)}
              suffix="q"
            />
            {settings.mode === 'timed' ? (
              <SettingButtons
                label="Seconds each"
                options={timedSecondOptions}
                value={settings.secondsPerQuestion}
                onChange={(value) => updateSetting('secondsPerQuestion', value)}
                suffix="s"
              />
            ) : null}
            {settings.mode === 'survival' ? (
              <SettingButtons
                label="Lives"
                options={survivalLifeOptions}
                value={settings.lives}
                onChange={(value) => updateSetting('lives', value)}
                suffix="lives"
              />
            ) : null}
          </section>

          <div className="setup-footer">
            <StatsStrip stats={stats} />
            <Button onClick={continueToLibrary}>Choose quiz</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

type SettingButtonsProps = {
  label: string;
  onChange: (value: number) => void;
  options: number[];
  suffix: string;
  value: number;
};

function SettingButtons({ label, onChange, options, suffix, value }: SettingButtonsProps) {
  return (
    <div className="setting-group">
      <span>{label}</span>
      <div className="segmented-row">
        {options.map((option) => (
          <button className={value === option ? 'active' : ''} key={option} onClick={() => onChange(option)} type="button">
            {option} {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

type StatsStripProps = {
  stats: QuizStats;
};

function StatsStrip({ stats }: StatsStripProps) {
  const totalAnswered = stats.totalCorrect + stats.totalWrong;
  return (
    <div className="stats-strip">
      <span>{stats.quizzesPlayed} played</span>
      <span>{percent(stats.totalCorrect, totalAnswered)}% accuracy</span>
      <span>{stats.bestPercent}% best</span>
    </div>
  );
}

type QuizLibraryPageProps = {
  goBack: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedQuestionCount: number;
  startPreset: (preset: QuizPreset) => void;
  uploadError: string;
};

export function QuizLibraryPage({
  goBack,
  handleFileUpload,
  selectedQuestionCount,
  startPreset,
  uploadError,
}: QuizLibraryPageProps) {
  const [uploadHelpOpen, setUploadHelpOpen] = React.useState(false);

  return (
    <main className="page-shell app-page">
      <AppHeader goHome={goBack} />

      <section className="library-layout">
        <div className="library-heading">
          <div>
            <p className="section-kicker">Quiz library</p>
            <h1>Choose what this run is about.</h1>
          </div>
          <p>Each run shuffles the source and loads up to {selectedQuestionCount} questions.</p>
        </div>

        <div className="preset-grid">
          <button className="preset-card upload-card" onClick={() => setUploadHelpOpen(true)} type="button">
            <img alt="" className="preset-image" src="/quiz-cards/upload.jpeg" />
            <strong>Load your own quiz</strong>
            <small>Question/A/B/C/D text format</small>
          </button>

          {quizPresets.map((preset) => (
            <button className="preset-card" key={preset.id} onClick={() => startPreset(preset)} type="button">
              <img alt="" className="preset-image" src={quizCardImagePath(preset.id)} />
              <strong>{preset.title}</strong>
              <small>{preset.questions.length} bundled questions</small>
            </button>
          ))}
        </div>

        {uploadError ? <p className="upload-error">{uploadError}</p> : null}
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

function quizCardImagePath(presetId: string) {
  return `/quiz-cards/${presetId}.jpeg`;
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
