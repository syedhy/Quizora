import * as React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedQuestionCount: number;
  startPreset: (preset: QuizPreset) => void;
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
  handleFileUpload,
  selectedQuestionCount,
  startPreset,
  uploadError,
}: QuizLibraryPageProps) {
  const [uploadHelpOpen, setUploadHelpOpen] = React.useState(false);
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.library-heading > *', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo('.preset-card', 
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.15 }
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
          <p>Each run shuffles the source and loads up to {selectedQuestionCount} questions.</p>
        </div>

        <div className="preset-grid">
          <button className="preset-card upload-card" onClick={() => setUploadHelpOpen(true)} type="button">
            <div className="preset-graphic upload-graphic">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            <strong>Load your own quiz</strong>
            <small>Question/A/B/C/D text format</small>
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
