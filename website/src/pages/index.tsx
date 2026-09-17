import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import FeatureCard from '@site/src/components/FeatureCard';
import React from 'react';

const modules = [
  {
    number: '01',
    title: 'The Robotic Nervous System',
    subtitle: 'ROS 2',
    description: 'The communication layer for robotics. Build nodes, topics, and services that connect AI to hardware.',
    link: '/docs/module-1-robotic-nervous-system/ros-nodes-topics-services',
  },
  {
    number: '02',
    title: 'The Digital Twin',
    subtitle: 'Gazebo & Unity',
    description: 'Simulate before you build. Test robot behaviors in physics-accurate virtual worlds.',
    link: '/docs/module-2-digital-twin/simulating-physics-in-gazebo',
  },
  {
    number: '03',
    title: 'The AI-Robot Brain',
    subtitle: 'NVIDIA Isaac',
    description: 'Perception and planning at scale. Use Isaac Sim for synthetic data and Isaac ROS for accelerated VSLAM.',
    link: '/docs/module-3-ai-robot-brain/nvidia-isaac-sim',
  },
  {
    number: '04',
    title: 'Vision-Language-Action',
    subtitle: 'VLA Models',
    description: 'Speak to your robot. Combine Whisper, LLMs, and motor control for voice-driven action.',
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
    title: 'AI Study Assistant',
    description: 'Ask questions and get instant answers with textbook citations.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Adaptive Chapters',
    description: 'Content rewrites itself based on your Python and ROS skill level.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: 'Urdu Support',
    description: 'Read any chapter in Urdu with one click.',
  },
];

function HeroSection() {
  return (
    <header className="hero relative overflow-hidden min-h-screen flex items-center text-text-primary">
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.5) 39px, rgba(255,255,255,0.5) 40px)'}} />
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none" style={{background: 'radial-gradient(circle, oklch(62% 0.19 265) 0%, transparent 70%)'}} />
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{background: 'linear-gradient(to top, var(--color-surface-secondary), transparent)'}} />
      <div className="relative container py-20 md:py-24">
        <div className="max-w-3xl">
          <Heading as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-text-primary">
            The Bridge Between Code and Motion
          </Heading>
          <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl leading-relaxed">
            From neural networks to physical robots — master the full stack of humanoid robotics through hands-on simulation and real hardware.
          </p>
          <div className="flex flex-wrap gap-4">
             <Link
               className="inline-flex items-center px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors"
               to="/docs/module-1-robotic-nervous-system/ros-nodes-topics-services">
               Start Module 1
             </Link>
             <Link
               className="inline-flex items-center px-6 py-3 bg-transparent text-text-primary font-medium rounded-md hover:bg-surface-secondary transition-colors border border-text-primary/30"
               to="/quiz">
               Take the Quiz
             </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 bg-surface-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-3 text-text-primary scroll-reveal range-cover">
            Built for Learning
          </Heading>
          <p className="text-text-secondary max-w-xl mx-auto scroll-child-text scroll-child-delay-2">
            Learn through hands-on modules that blend AI, simulation, and real-world robotics.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} icon={feature.icon} title={feature.title} description={feature.description} index={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section className="py-20 bg-surface-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-3 text-text-primary scroll-reveal range-cover">
            Course Modules
          </Heading>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((module, idx) => (
            <Link key={idx} to={module.link} className="group block no-underline">
              <div className={`h-full p-6 bg-surface rounded-md border border-border-subtle transition-all duration-200 hover:shadow-sm hover:border-brand/30 hover:-translate-y-1 scroll-reveal-left scroll-stagger-${idx + 1}`}>
                <div className="flex items-start gap-4">
                   <span className="text-3xl font-bold text-brand/50 scroll-child-counter">
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
    <section className="py-20 bg-surface-secondary">
      <div className="container text-center">
        <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-3 text-brand scroll-cta-heading">
          Start Building
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
  return (
    <Layout
      title="Home"
      description="From neural networks to physical robots — master the full stack of humanoid robotics through hands-on simulation and real hardware.">
      <HeroSection />
      <FeaturesSection />
      <ModulesSection />
      <CTASection />
    </Layout>
  );
}
