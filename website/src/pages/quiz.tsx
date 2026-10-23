import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './quiz.module.css';

const EXPERIENCE_LEVELS = [0, 1, 2, 3, 4, 5];

const HARDWARE_ITEMS = [
  { key: 'hasGpu', label: 'Do you have access to a GPU?', short: 'GPU' },
  { key: 'hasJetson', label: 'Do you have an NVIDIA Jetson device?', short: 'Jetson' },
  { key: 'hasRobotAccess', label: 'Do you have access to a physical robot?', short: 'Robot' },
] as const;

type HardwareKey = (typeof HARDWARE_ITEMS)[number]['key'];

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ActionArrow() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={styles.actionArrow}>
      <path
        d="M3.5 12.5 12.5 3.5M5.5 3.5h7v7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}>
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExperienceMeter({ value }: { value: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      {EXPERIENCE_LEVELS.map((level) => (
        <span
          key={level}
          className={styles.meterCell}
          data-on={level < value ? 'true' : undefined}
        />
      ))}
    </span>
  );
}

type ExperienceScaleProps = {
  id: 'pythonExp' | 'rosExp';
  index: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

function ExperienceScale({
  id,
  index,
  label,
  value,
  disabled,
  onChange,
}: ExperienceScaleProps) {
  const helpId = `${id}-help`;
  return (
    <fieldset className={styles.scale} aria-describedby={helpId}>
      <legend className={styles.srOnly}>{label}</legend>
      <div className={styles.fieldHead} aria-hidden="true">
        <span className={styles.fieldIndex}>{index}</span>
        <span>{label}</span>
      </div>
      <p id={helpId} className={styles.srOnly}>
        0 means no experience, 5 means confident.
      </p>
      <div className={styles.scaleTrack}>
        {EXPERIENCE_LEVELS.map((level) => (
          <label
            key={level}
            className={styles.scaleOption}
            data-selected={value === level ? 'true' : undefined}>
            <input
              type="radio"
              name={id}
              value={level}
              checked={value === level}
              disabled={disabled}
              onChange={() => onChange(level)}
              aria-label={`${level} of 5`}
              className={styles.scaleInput}
            />
            <span className={styles.scaleNumber} aria-hidden="true">
              {level}
            </span>
          </label>
        ))}
      </div>
      <div className={styles.scaleEnds} aria-hidden="true">
        <span>No experience</span>
        <span>Confident</span>
      </div>
    </fieldset>
  );
}

const QuizPage: React.FC = () => {
  const [pythonExp, setPythonExp] = useState(0);
  const [rosExp, setRosExp] = useState(0);
  const [hasGpu, setHasGpu] = useState(false);
  const [hasJetson, setHasJetson] = useState(false);
  const [hasRobotAccess, setHasRobotAccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error) return;
    window.setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: reducedMotion() ? 'auto' : 'smooth',
        block: 'center',
      });
      errorRef.current?.focus({ preventScroll: true });
    }, 0);
  }, [error]);

  const clearStatus = () => {
    setIsSaved(false);
    setError('');
  };

  const handleExperienceChange = (field: 'pythonExp' | 'rosExp', value: number) => {
    if (field === 'pythonExp') {
      setPythonExp(value);
    } else {
      setRosExp(value);
    }
    clearStatus();
  };

  const handleHardwareChange = (key: HardwareKey, checked: boolean) => {
    if (key === 'hasGpu') {
      setHasGpu(checked);
    } else if (key === 'hasJetson') {
      setHasJetson(checked);
    } else {
      setHasRobotAccess(checked);
    }
    clearStatus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsSaved(false);
    setError('');

    const quizAnswers = {
      python_experience: pythonExp,
      ros_experience: rosExp,
      has_gpu: hasGpu,
      has_jetson: hasJetson,
      has_robot_access: hasRobotAccess,
    };

    try {
      const response = await fetch('/api/profile/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAnswers),
      });

      let data: { detail?: unknown } = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        setIsSaved(true);
        window.setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: reducedMotion() ? 'auto' : 'smooth',
            block: 'start',
          });
          resultRef.current?.focus({ preventScroll: true });
        }, 0);
      } else {
        setError(
          typeof data.detail === 'string' ? data.detail : 'Failed to submit quiz.',
        );
      }
    } catch (submitError) {
      console.error('Error submitting quiz:', submitError);
      setError('Network error or server unavailable. Check the connection and submit again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewAnswers = () => {
    const form = formRef.current;
    if (!form) return;
    form.scrollIntoView({
      behavior: reducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    const firstAnswer = form.querySelector<HTMLInputElement>('input[type="radio"]');
    window.setTimeout(() => firstAnswer?.focus({ preventScroll: true }), 0);
  };

  const hardwareValues: Record<HardwareKey, boolean> = {
    hasGpu,
    hasJetson,
    hasRobotAccess,
  };

  const readoutRows: { label: string; value: string; level?: number }[] = [
    { label: 'Python', value: `${pythonExp} / 5`, level: pythonExp },
    { label: 'ROS 2', value: `${rosExp} / 5`, level: rosExp },
    { label: 'GPU', value: hasGpu ? 'Yes' : 'No' },
    { label: 'Jetson', value: hasJetson ? 'Yes' : 'No' },
    { label: 'Robot access', value: hasRobotAccess ? 'Yes' : 'No' },
  ];

  const readoutStatus = isSubmitting ? 'Saving' : isSaved ? 'Saved' : 'Not saved';

  return (
    <Layout
      title="Background Quiz"
      description="Answer a few questions to personalize your learning experience.">
      <main className={styles.page}>
        <div className={styles.field} aria-hidden="true">
          <svg
            className={styles.contours}
            viewBox="0 0 900 820"
            preserveAspectRatio="xMidYMid slice"
            fill="none">
            <ellipse cx="600" cy="370" rx="342" ry="252" transform="rotate(-16 600 370)" />
            <ellipse cx="600" cy="370" rx="286" ry="204" transform="rotate(-16 600 370)" />
            <ellipse cx="600" cy="370" rx="232" ry="160" transform="rotate(-16 600 370)" />
            <ellipse cx="600" cy="370" rx="180" ry="120" transform="rotate(-16 600 370)" />
            <ellipse cx="600" cy="370" rx="130" ry="84" transform="rotate(-16 600 370)" />
          </svg>
        </div>

        <div className={styles.shell}>
          <header className={styles.pageHead}>
            <Heading as="h1" className={styles.title}>
              Background Quiz
            </Heading>
            <div className={styles.headSide}>
              <p className={styles.deck}>
                Please answer a few questions to help us personalize your learning
                experience.
              </p>
              <span className={styles.headMeta}>
                <span className={styles.headMetaDot} aria-hidden="true" />
                5 answers
              </span>
            </div>
          </header>

          <div className={styles.layout}>
            <div className={styles.mainCol}>
              {isSaved ? (
                <section
                  ref={resultRef}
                  className={styles.result}
                  aria-labelledby="quiz-result-title"
                  tabIndex={-1}>
                  <div className={styles.resultTop}>
                    <span className={styles.resultMark} aria-hidden="true">
                      <CheckMark className={styles.resultMarkGlyph} />
                    </span>
                    <div>
                      <Heading
                        as="h2"
                        id="quiz-result-title"
                        className={styles.resultTitle}>
                        Profile saved
                      </Heading>
                      <p className={styles.resultCopy}>
                        Python and ROS levels drive chapter personalization. Hardware
                        answers are saved to your profile.
                      </p>
                    </div>
                  </div>

                  <ul className={styles.resultChips} aria-label="Saved answers">
                    <li className={styles.resultChip}>
                      Python <strong>{pythonExp}/5</strong>
                    </li>
                    <li className={styles.resultChip}>
                      ROS 2 <strong>{rosExp}/5</strong>
                    </li>
                    <li className={styles.resultChip}>
                      GPU <strong>{hasGpu ? 'Yes' : 'No'}</strong>
                    </li>
                    <li className={styles.resultChip}>
                      Jetson <strong>{hasJetson ? 'Yes' : 'No'}</strong>
                    </li>
                    <li className={styles.resultChip}>
                      Robot <strong>{hasRobotAccess ? 'Yes' : 'No'}</strong>
                    </li>
                  </ul>

                  <div className={styles.resultActions}>
                    <Link
                      className={styles.resultPrimary}
                      to="/docs/module-1-robotic-nervous-system">
                      Start Module 1
                      <ActionArrow />
                    </Link>
                    <button
                      type="button"
                      className={styles.resultSecondary}
                      onClick={reviewAnswers}>
                      Review answers
                    </button>
                  </div>

                  <p className={styles.provenance}>
                    <span className={styles.provenanceDot} aria-hidden="true" />
                    Saved to your learner profile
                  </p>
                </section>
              ) : null}

              {error ? (
                <div ref={errorRef} className={styles.error} role="alert" tabIndex={-1}>
                  <p className={styles.errorTitle}>Answers not saved</p>
                  <p className={styles.errorCopy}>{error}</p>
                </div>
              ) : null}

              <section className={styles.sheet} aria-labelledby="quiz-sheet-title">
                <header className={styles.sheetHead}>
                  <div>
                    <Heading as="h2" id="quiz-sheet-title" className={styles.sheetTitle}>
                      Learner profile
                    </Heading>
                    <p className={styles.sheetNote}>
                      Set a baseline for the material ahead.
                    </p>
                  </div>
                </header>

                <form
                  ref={formRef}
                  className={styles.form}
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}>
                  <div className={styles.scales}>
                    <ExperienceScale
                      id="pythonExp"
                      index="01"
                      label="Python Experience (0-5)"
                      value={pythonExp}
                      disabled={isSubmitting}
                      onChange={(value) => handleExperienceChange('pythonExp', value)}
                    />
                    <ExperienceScale
                      id="rosExp"
                      index="02"
                      label="ROS 2 Experience (0-5)"
                      value={rosExp}
                      disabled={isSubmitting}
                      onChange={(value) => handleExperienceChange('rosExp', value)}
                    />
                  </div>

                  <fieldset className={styles.hardware}>
                    <legend className={styles.srOnly}>Hardware Access</legend>
                    <div className={styles.fieldHead} aria-hidden="true">
                      <span className={styles.fieldIndex}>03</span>
                      <span>Hardware Access</span>
                    </div>

                    <div className={styles.hardwareList}>
                      {HARDWARE_ITEMS.map((item) => {
                        const checked = hardwareValues[item.key];
                        return (
                          <label
                            key={item.key}
                            className={styles.hardwareRow}
                            data-checked={checked ? 'true' : undefined}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSubmitting}
                              onChange={(event) =>
                                handleHardwareChange(item.key, event.target.checked)
                              }
                              aria-label={item.label}
                              className={styles.hardwareInput}
                            />
                            <span className={styles.checkbox} aria-hidden="true">
                              <CheckMark className={styles.checkboxGlyph} />
                            </span>
                            <span className={styles.hardwareLabel}>{item.label}</span>
                            <span className={styles.hardwareValue} aria-hidden="true">
                              {checked ? 'Yes' : 'No'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className={styles.submitRail}>
                    <p className={styles.submitNote}>
                      Python and ROS levels drive Personalize. Hardware answers are
                      saved to your profile.
                    </p>
                    <button type="submit" className={styles.submit} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      {isSubmitting ? null : <ActionArrow />}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <aside className={styles.readout} aria-label="Current answers">
              <header className={styles.readoutHead}>
                <span className={styles.readoutLabel}>Profile readout</span>
                <span className={styles.status} data-state={isSaved ? 'saved' : undefined}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  <span aria-live="polite">{readoutStatus}</span>
                </span>
              </header>

              <dl className={styles.readoutList}>
                {readoutRows.map((row) => (
                  <div key={row.label} className={styles.readoutRow}>
                    <dt>{row.label}</dt>
                    <dd>
                      <span className={styles.readoutValue}>{row.value}</span>
                      {row.level !== undefined ? (
                        <ExperienceMeter value={row.level} />
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className={styles.readoutFoot}>
                Python and ROS levels drive chapter personalization.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default QuizPage;
