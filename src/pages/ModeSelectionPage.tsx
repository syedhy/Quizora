import * as React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  modes,
  parseQuestions,
  percent,
  questionCountOptions,
  quizPresets,
  survivalLifeOptions,
  timedSecondOptions,
  type OptionKey,
  type Question,
  type QuizMode,
  type QuizPreset,
  type QuizSettings,
  type QuizStats,
  type SavedQuiz,
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
      <div className="header-actions">
        <ThemeToggleButton />
        <a href="mailto:syedhyderalihamdani@gmail.com?subject=Quizora%20Feedback">Reach Us</a>
      </div>
    </header>
  );
}

type ThemeName = 'light' | 'dark';

const themeStorageKey = 'quizora-theme';

function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = getStoredTheme();
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  setStoredTheme(theme);
}

function getStoredTheme() {
  try {
    return window.localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

function setStoredTheme(theme: ThemeName) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Dark mode still works for this session if storage is unavailable.
  }
}

function ThemeToggleButton() {
  const [theme, setTheme] = React.useState<ThemeName>(() => getInitialTheme());
  const isDark = theme === 'dark';

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn('theme-toggle-button', isDark && 'is-dark')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Light mode' : 'Dark mode'}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
      >
        <clipPath id="quizora-theme-btn">
          <path
            className="theme-toggle-clip-path"
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>

        <g clipPath="url(#quizora-theme-btn)">
          <circle className="theme-toggle-sun" cx="16" cy="16" r="8" />

          <g className="theme-toggle-sun-rays" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </g>
        </g>
      </svg>
    </button>
  );
}

type SetupPageProps = {
  continueToLibrary: () => void;
  settings: QuizSettings;
  stats: QuizStats;
  updateSettings: (settings: QuizSettings) => void;
};

export function SetupPage({ continueToLibrary, settings, stats, updateSettings }: SetupPageProps) {
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.setup-copy > *', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo('.choice-card', 
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.1 }
    );
    gsap.fromTo('.control-section:not(:first-child)', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
    );
    gsap.fromTo('.setup-footer', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4 }
    );
  }, { scope: container });

  useGSAP(() => {
    gsap.fromTo('.setting-group', 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    );
  }, { scope: container, dependencies: [settings.mode] });

  function updateMode(mode: QuizMode) {
    updateSettings({ ...settings, mode });
  }

  function updateSetting<Key extends keyof QuizSettings>(key: Key, value: QuizSettings[Key]) {
    updateSettings({ ...settings, [key]: value });
  }

  return (
    <main ref={container} className="page-shell app-page">
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
  onDeleteSavedQuiz: (id: string) => void;
  onResetRotation: (id: string) => void;
  onStartCustomQuiz: (questions: Question[], title: string, saveToLibrary: boolean) => void;
  savedQuizzes: SavedQuiz[];
  selectedQuestionCount: number;
  startPreset: (preset: QuizPreset) => void;
  startSavedQuiz: (quiz: SavedQuiz) => void;
  uploadError: string;
};

function getPresetIcon(id: string) {
  switch (id) {
    case 'ancient-history':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 22h14" />
          <path d="M5 2h14" />
          <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
          <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
      );
    case 'games':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect width="20" height="12" x="2" y="6" rx="2" />
        </svg>
      );
    case 'geography':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" x2="22" y1="12" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    case 'pokemon':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="2" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'pop-culture':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'science':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31" />
          <path d="M14 9.3V1.99" />
          <path d="M8.5 2h7" />
          <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
          <path d="M5.52 16h12.96" />
        </svg>
      );
    case 'technology':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

export function QuizLibraryPage({
  goBack,
  onDeleteSavedQuiz,
  onResetRotation,
  onStartCustomQuiz,
  savedQuizzes,
  selectedQuestionCount,
  startPreset,
  startSavedQuiz,
  uploadError,
}: QuizLibraryPageProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.library-heading > *', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo('.preset-card', 
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: 'back.out(1.5)', delay: 0.15 }
    );
    gsap.fromTo('.preset-graphic svg',
      { scale: 0.5, opacity: 0, rotate: -15 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.8, stagger: 0.05, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
    );
  }, { scope: container });

  return (
    <main ref={container} className="page-shell app-page">
      <AppHeader goHome={goBack} />

      <section className="library-layout">
        <div className="library-heading">
          <div>
            <p className="section-kicker">Quiz library</p>
            <h1>Choose what this run is about.</h1>
          </div>
          <p>Each run loads up to {selectedQuestionCount} questions. Saved quizzes track rotation without repeats.</p>
        </div>

        {savedQuizzes.length > 0 ? (
          <div className="saved-quizzes-container">
            <div className="saved-quizzes-header">
              <div>
                <span className="section-kicker">Saved Quizzes ({savedQuizzes.length})</span>
                <h2>Rotation Quizzes</h2>
              </div>
              <p className="saved-subtext">Won't repeat questions until every question in the quiz has been done.</p>
            </div>

            <div className="preset-grid saved-preset-grid">
              {savedQuizzes.map((quiz) => {
                const seenCount = quiz.seenQuestionIds?.length ?? 0;
                const totalCount = quiz.questions.length;
                const isFullRotation = seenCount >= totalCount;
                const progressPct = totalCount ? Math.round((seenCount / totalCount) * 100) : 0;

                return (
                  <div className="preset-card saved-card" key={quiz.id}>
                    <div className="preset-graphic saved-graphic">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="10" y1="10" x2="14" y2="10" />
                      </svg>
                    </div>

                    <div className="saved-meta">
                      <strong>{quiz.title}</strong>
                      <small>{totalCount} total questions</small>
                    </div>

                    <div className="rotation-pill" title={`${seenCount} of ${totalCount} questions done in this rotation`}>
                      <div className="rotation-pill-text">
                        <span>{isFullRotation ? '✅ Cycle ready' : `🔄 ${seenCount}/${totalCount} seen`}</span>
                        <span className="rotation-pct">{progressPct}%</span>
                      </div>
                      <div className="rotation-bar-bg">
                        <div className="rotation-bar-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    <div className="saved-card-footer">
                      <Button
                        className="saved-play-button"
                        onClick={() => startSavedQuiz(quiz)}
                        variant="solid"
                      >
                        Play run
                      </Button>
                      <div className="saved-card-actions">
                        <button
                          className="action-icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetRotation(quiz.id);
                          }}
                          title="Restart rotation from 0"
                          type="button"
                          aria-label="Reset rotation"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        </button>
                        <button
                          className="action-icon-button is-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${quiz.title}" from saved quizzes?`)) {
                              onDeleteSavedQuiz(quiz.id);
                            }
                          }}
                          title="Delete saved quiz"
                          type="button"
                          aria-label="Delete quiz"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="presets-section-heading">
          <p className="section-kicker">Presets & Custom</p>
          <h2>Standard library</h2>
        </div>

        <div className="preset-grid">
          <button className="preset-card upload-card" onClick={() => setModalOpen(true)} type="button">
            <div className="preset-graphic upload-graphic">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </div>
            <strong>Add your own quiz</strong>
            <small>Direct paste or file upload</small>
          </button>

          {quizPresets.map((preset) => (
            <button className="preset-card" key={preset.id} onClick={() => startPreset(preset)} type="button">
              <div className="preset-graphic">
                {getPresetIcon(preset.id)}
              </div>
              <strong>{preset.title}</strong>
              <small>{preset.questions.length} bundled questions</small>
            </button>
          ))}
        </div>

        {uploadError ? <p className="upload-error">{uploadError}</p> : null}
      </section>

      {modalOpen ? (
        <AddCustomQuizModal
          close={() => setModalOpen(false)}
          onStartCustomQuiz={(questions, title, saveToLibrary) => {
            onStartCustomQuiz(questions, title, saveToLibrary);
            setModalOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}

const sampleQuestionsText = `Question: Which planet in our Solar System is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Saturn
Answer: B

Question: What is the primary gas found in Earth's atmosphere?
A) Oxygen
B) Nitrogen
C) Carbon Dioxide
D) Argon
Answer: B

Question: Which element has the chemical symbol 'Au'?
A) Silver
B) Gold
C) Aluminum
D) Copper
Answer: B`;

type AddCustomQuizModalProps = {
  close: () => void;
  onStartCustomQuiz: (questions: Question[], title: string, saveToLibrary: boolean) => void;
};

function AddCustomQuizModal({ close, onStartCustomQuiz }: AddCustomQuizModalProps) {
  const [quizTitle, setQuizTitle] = React.useState('');
  const [pasteText, setPasteText] = React.useState('');
  const [saveQuizOption, setSaveQuizOption] = React.useState(true);
  const [parseError, setParseError] = React.useState('');

  async function handlePasteFromClipboard() {
    try {
      if (!navigator.clipboard?.readText) {
        setParseError('Clipboard permission not supported. Paste directly using Ctrl+V or Cmd+V.');
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (!clipText.trim()) {
        setParseError('Clipboard is currently empty.');
        return;
      }
      setPasteText(clipText);
      setParseError('');
    } catch {
      setParseError('Could not read clipboard. Please paste directly into the box.');
    }
  }

  function handleFileLoaded(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setPasteText(content);
      if (!quizTitle.trim()) {
        setQuizTitle(file.name.replace(/\.[^.]+$/, '') || file.name);
      }
      setParseError('');
    };
    reader.onerror = () => setParseError('Could not read selected file.');
    reader.readAsText(file);
  }

  function handleStart() {
    const trimmed = pasteText.trim();
    if (!trimmed) {
      setParseError('Please paste your questions into the box before starting.');
      return;
    }

    try {
      const parsed = parseQuestions(trimmed);
      const title = quizTitle.trim() || 'Custom Quiz';
      onStartCustomQuiz(parsed, title, saveQuizOption);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid question format.');
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="custom-quiz-modal-title">
      <section className="upload-modal custom-quiz-modal">
        <button className="modal-close" onClick={close} type="button" aria-label="Close dialog">
          Close
        </button>

        <p className="section-kicker">Custom Quiz</p>
        <h2 id="custom-quiz-modal-title">Paste your quiz & play</h2>
        <p className="modal-lead">
          Paste your questions directly below to start immediately. Save to library to rotate questions without repeats.
        </p>

        <div className="custom-quiz-form">
          <div className="modal-field">
            <label htmlFor="custom-quiz-title">Quiz title (optional)</label>
            <input
              id="custom-quiz-title"
              className="modal-input"
              type="text"
              placeholder="e.g. Science Revision, Trivia Night"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <div className="modal-field-header">
              <label htmlFor="custom-quiz-text">Quiz Questions</label>
              <div className="modal-quick-actions">
                <button
                  type="button"
                  className="quick-action-link"
                  onClick={handlePasteFromClipboard}
                  title="Paste from system clipboard"
                >
                  📋 Paste Clipboard
                </button>
                <button
                  type="button"
                  className="quick-action-link"
                  onClick={() => {
                    setPasteText(sampleQuestionsText);
                    if (!quizTitle) setQuizTitle('Sample Science Quiz');
                    setParseError('');
                  }}
                  title="Insert sample questions"
                >
                  Insert Sample
                </button>
                {pasteText ? (
                  <button
                    type="button"
                    className="quick-action-link"
                    onClick={() => {
                      setPasteText('');
                      setParseError('');
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <textarea
              id="custom-quiz-text"
              className="modal-textarea"
              rows={8}
              placeholder={`Question: What is the capital of France?\nA) London\nB) Paris\nC) Berlin\nD) Rome\nAnswer: B`}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (parseError) setParseError('');
              }}
            />
          </div>

          <div className="modal-options-row">
            <label className="save-checkbox-label">
              <input
                type="checkbox"
                checked={saveQuizOption}
                onChange={(e) => setSaveQuizOption(e.target.checked)}
              />
              <span>Save to library (tracks question rotation without repeating)</span>
            </label>

            <label className="modal-file-link">
              <input
                className="sr-only"
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileLoaded}
              />
              📁 Or import .txt file
            </label>
          </div>

          {parseError ? (
            <div className="upload-error modal-error" role="alert">
              {parseError}
            </div>
          ) : null}

          <div className="modal-actions-footer">
            <Button onClick={close} variant="ghost" type="button">
              Cancel
            </Button>
            <Button
              disabled={!pasteText.trim()}
              onClick={handleStart}
              variant="solid"
              type="button"
            >
              Start quiz now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
