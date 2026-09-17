import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import React from 'react';

const modules = [
  {
    number: '01',
    title: 'The Robotic Nervous System',
    subtitle: 'ROS 2',
    description: 'Master the core middleware for robotics. Build nodes, topics, and services that bridge AI agents with physical hardware.',
    link: '/docs/module-1-robotic-nervous-system/ros-nodes-topics-services',
  },
  {
    number: '02',
    title: 'The Digital Twin',
    subtitle: 'Gazebo & Unity',
    description: 'Create photorealistic simulations. Test robot behaviors in physics-accurate virtual environments before touching real hardware.',
    link: '/docs/module-2-digital-twin/simulating-physics-in-gazebo',
  },
  {
    number: '03',
    title: 'The AI-Robot Brain',
    subtitle: 'NVIDIA Isaac',
    description: 'Deploy perception and planning models. Leverage Isaac Sim for synthetic data and Isaac ROS for hardware-accelerated VSLAM.',
    link: '/docs/module-3-ai-robot-brain/nvidia-isaac-sim',
  },
  {
    number: '04',
    title: 'Vision-Language-Action',
    subtitle: 'VLA Models',
    description: 'Translate voice commands into robot actions. Combine Whisper, LLMs, and motor control for natural human-robot interaction.',
    link: '/docs/module-4-vision-language-action/voice-to-action-whisper',
  },
];

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'RAG Chatbot',
    description: 'Ask questions about any chapter. The AI answers from the textbook content with citations.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Personalized Content',
    description: 'Rewrite chapters based on your Python and ROS experience level.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: 'Urdu Translation',
    description: 'Read any chapter in Urdu with one click.',
  },
];

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-footer-background via-surface-code to-footer-background text-on-dark">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}} />
      </div>
        <div className="relative container pt-32 pb-40 md:pt-40 md:pb-48">
        <div className="max-w-3xl">
          <Heading as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-on-dark animate-[slideUp_0.35s_var(--ease-out)_both]">
            {siteConfig.title}
          </Heading>
          <p className="text-lg md:text-xl text-on-dark-muted mb-8 max-w-2xl leading-relaxed animate-[slideUp_0.35s_var(--ease-out)_both] [animation-delay:50ms]">
            {siteConfig.tagline}
          </p>
          <div className="flex flex-wrap gap-4 animate-[slideUp_0.35s_var(--ease-out)_both] [animation-delay:100ms]">
            <Link
              className="inline-flex items-center px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors"
              to="/docs/module-1-robotic-nervous-system/ros-nodes-topics-services">
              Start Learning
            </Link>
            <Link
              className="inline-flex items-center px-6 py-3 bg-white/10 text-on-dark font-medium rounded-md hover:bg-white/20 transition-colors border border-white/20"
              to="/quiz">
              Placement Quiz
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 bg-surface-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <Heading as="h2" className="text-2xl md:text-3xl font-bold mb-3 text-text-primary scroll-reveal range-cover">
            Built for Learning
          </Heading>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className={`p-6 bg-surface rounded-md border border-border-subtle scroll-reveal scroll-stagger-${idx + 1}`}>
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-subtle text-brand mb-4 scroll-child-icon">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 scroll-child-text">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed scroll-child-text scroll-child-delay-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <Heading as="h2" className="text-2xl md:text-3xl font-bold mb-3 text-text-primary scroll-reveal range-cover">
            Course Modules
          </Heading>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, idx) => (
            <Link key={idx} to={module.link} className="group block no-underline">
              <div className={`h-full p-6 bg-surface rounded-md border border-border-subtle transition-all duration-200 hover:shadow-sm hover:border-brand/30 hover:-translate-y-1 scroll-reveal-left scroll-stagger-${idx + 1}`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-brand/20 scroll-child-counter">
                    {module.number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand transition-colors scroll-child-text">
                        {module.title}
                      </h3>
                      <span className="text-xs font-medium text-brand bg-brand-subtle px-2 py-0.5 rounded scroll-child-text scroll-child-delay-2">
                        {module.subtitle}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed m-0 scroll-child-text scroll-child-delay-3">
                      {module.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-brand-subtle">
      <div className="container text-center">
        <Heading as="h2" className="text-2xl md:text-3xl font-bold mb-3 text-brand scroll-cta-heading">
          Ready to Build Robots?
        </Heading>
        <p className="text-text-secondary mb-8 max-w-xl mx-auto scroll-cta-text">
          Start with ROS 2 fundamentals or take the placement quiz to skip ahead.
        </p>
        <div className="flex flex-wrap justify-center gap-4 scroll-cta-buttons">
          <Link
            className="inline-flex items-center px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors"
            to="/docs/module-1-robotic-nervous-system/ros-nodes-topics-services">
            Begin Module 1
          </Link>
          <Link
            className="inline-flex items-center px-6 py-3 bg-transparent text-brand font-medium rounded-md hover:bg-brand/10 transition-colors border border-brand/30"
            to="/quiz">
            Placement Quiz
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title="Home"
      description="AI-native textbook for learning Physical AI and Humanoid Robotics. Master ROS 2, Digital Twins, NVIDIA Isaac, and Vision-Language-Action models.">
      <HeroSection />
      <FeaturesSection />
      <ModulesSection />
      <CTASection />
    </Layout>
  );
}
