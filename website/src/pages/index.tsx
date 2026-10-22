import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const modules = [
  {
    number: '01',
    title: 'The Robotic Nervous System',
    subtitle: 'ROS 2',
    description: 'The communication layer for robotics. Build nodes, topics, and services that connect AI to hardware.',
    link: '/docs/module-1-robotic-nervous-system',
  },
  {
    number: '02',
    title: 'The Digital Twin',
    subtitle: 'Gazebo & Unity',
    description: 'Simulate before you build. Test robot behaviors in physics-accurate virtual worlds.',
    link: '/docs/module-2-digital-twin',
  },
  {
    number: '03',
    title: 'The AI-Robot Brain',
    subtitle: 'NVIDIA Isaac',
    description: 'Perception and planning at scale. Use Isaac Sim for synthetic data and Isaac ROS for accelerated VSLAM.',
    link: '/docs/module-3-ai-robot-brain',
  },
  {
    number: '04',
    title: 'Vision-Language-Action',
    subtitle: 'VLA Models',
    description: 'Speak to your robot. Combine Whisper, LLMs, and motor control for voice-driven action.',
    link: '/docs/module-4-vision-language-action',
  },
];

const apparatus = [
  {
    label: 'Grounding',
    title: 'AI Study Assistant',
    description: 'Ask questions and get instant answers with textbook citations.',
  },
  {
    label: 'Adaptation',
    title: 'Adaptive Chapters',
    description: 'Content rewrites itself based on your Python and ROS skill level.',
  },
  {
    label: 'Language',
    title: 'Urdu Support',
    description: 'Read any chapter in Urdu with one click.',
  },
];

const topics = ['Training Data', 'Algorithms', 'Computer Vision', 'NLP', 'Sensors'];

function Arrow() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0">
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

function SignalField() {
  return (
    <div className="hero-field" aria-hidden="true">
      <div className="hero-field-light" />
      <svg
        className="hero-contours"
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
  );
}

function PerceptionPane() {
  return (
    <div className="pane-wrap">
      <div className="pane-sheet pane-sheet-back" aria-hidden="true">
        <span className="pane-sheet-label">04 / VLA Models</span>
      </div>
      <div className="pane-sheet pane-sheet-mid" aria-hidden="true">
        <span className="pane-sheet-label">03 / NVIDIA Isaac</span>
      </div>
      <div className="pane-sheet pane-sheet-near" aria-hidden="true">
        <span className="pane-sheet-label">02 / Gazebo &amp; Unity</span>
      </div>
      <div className="pane" role="figure" aria-label="Sample of a selection-aware answer in Module 1">
        <div className="pane-bar">
          <span className="pane-chapter">Module 01 / ROS 2</span>
          <span className="pane-sample">
            <span className="pane-dot" aria-hidden="true" />
            Sample exchange
          </span>
        </div>

        <div className="pane-copy">
          <p className="pane-passage">
            ROS 2 is the middleware that{' '}
            <mark className="pane-mark">connects AI code to robot hardware</mark> — nodes,
            topics, and services are the vocabulary it speaks.
          </p>
          <Link to="/docs/module-1-robotic-nervous-system" className="pane-chip">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 5.5V3h2.5M10.5 3H13v2.5M13 10.5V13h-2.5M5.5 13H3v-2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M5.5 8h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Ask AI about this
          </Link>
        </div>

        <div className="pane-answer">
          <div className="pane-answer-head">
            <span className="pane-answer-label">Grounded answer</span>
            <span className="pane-answer-state">1 passage</span>
          </div>
          <p className="pane-answer-copy">
            ROS 2 is the layer between your AI code and the machine. Your agent runs in a node,
            publishes to topics, and the robot&rsquo;s controllers subscribe to those topics.
          </p>
          <p className="pane-source">Retrieved from Module 1 · sample</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="hero-shell">
      <SignalField />
      <div className="container relative z-10 pb-20 pt-12 md:pt-16 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 xl:gap-16">
          <div className="max-w-[46rem]">
            <Heading as="h1" className="hero-title">
              The Bridge Between Code and Motion
            </Heading>
            <p className="hero-deck">
              From neural networks to physical robots — master the full stack of humanoid
              robotics through hands-on simulation and real hardware.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn-solid" to="/docs/module-1-robotic-nervous-system">
                Start Module 1
                <Arrow />
              </Link>
              <Link className="btn-outline" to="/quiz">
                Take the Quiz
              </Link>
            </div>
            <div className="hero-meta">
              <span>4 modules</span>
              <span aria-hidden="true" className="hero-meta-sep" />
              <span>12 lessons</span>
              <span aria-hidden="true" className="hero-meta-sep" />
              <span>Open course</span>
            </div>
            <ul className="hero-topics" aria-label="Course subjects">
              {topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          <PerceptionPane />
        </div>
      </div>
    </header>
  );
}

function SectionHead({title, deck}: {title: string; deck?: string}) {
  return (
    <div className="section-head">
      <Heading as="h2" className="section-title">
        {title}
      </Heading>
      {deck ? <p className="section-deck">{deck}</p> : null}
    </div>
  );
}

function ModulesSection() {
  return (
    <section id="modules" className="home-section">
      <div className="container">
        <SectionHead
          title="Course modules"
          deck="Four modules, each an entry point with its own overview, prerequisites, and three lessons."
        />
        <div className="strata">
          {modules.map((module, index) => (
            <Link
              key={module.number}
              to={module.link}
              className="stratum focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt"
              style={{'--stratum-index': index} as React.CSSProperties}>
              <span className="stratum-index">{module.number}</span>
              <div className="stratum-body">
                <div className="stratum-head">
                  <h3 className="stratum-title">{module.title}</h3>
                  <span className="stratum-stack">{module.subtitle}</span>
                </div>
                <p className="stratum-copy">{module.description}</p>
              </div>
              <span className="stratum-open">
                Open
                <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApparatusSection() {
  return (
    <section className="home-section apparatus">
      <div className="container">
        <SectionHead
          title="Study apparatus"
          deck="The tools sit on top of every chapter: grounded answers, skill-level rewrites, and one-click translation."
        />
        <div className="ledger">
          {apparatus.map((item) => (
            <div key={item.title} className="ledger-row">
              <span className="ledger-label">{item.label}</span>
              <h3 className="ledger-title">{item.title}</h3>
              <p className="ledger-copy">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="cta-plane">
      <div className="cta-light" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="cta-inner">
          <div>
            <Heading as="h2" className="cta-title">
              Start building
            </Heading>
            <p className="cta-copy">
              Module 1 needs no prior modules — start at the ROS 2 layer. Already comfortable
              with ROS? Take the quiz and jump ahead.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-light" to="/docs/module-1-robotic-nervous-system">
              Start Module 1
              <Arrow />
            </Link>
            <Link className="btn-ghost-light" to="/quiz">
              Take the Quiz
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Humanoid Robotics Course"
      description="From neural networks to physical robots — master the full stack of humanoid robotics through hands-on simulation and real hardware.">
      <div className="home-page">
        <Hero />
        <ModulesSection />
        <ApparatusSection />
        <CTASection />
      </div>
    </Layout>
  );
}
