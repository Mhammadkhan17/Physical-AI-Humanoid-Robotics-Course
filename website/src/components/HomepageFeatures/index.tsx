import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link'; // Import Link for clickable cards

type ModuleItem = {
  title: string;
  description: ReactNode;
  link: string; // Add a link property
};

const ModuleList: ModuleItem[] = [
  {
    title: 'Module 1: The Robotic Nervous System (ROS 2)',
    description: (
      <>
        Dive into the core middleware for robotics. Understand ROS 2 nodes, topics, and services, and learn to bridge Python AI agents with ROS controllers.
      </>
    ),
    link: '/docs/module-1-robotic-nervous-system/ros-nodes-topics-services',
  },
  {
    title: 'Module 2: The Digital Twin (Gazebo & Unity)',
    description: (
      <>
        Explore the creation of realistic digital twins. Master physics simulation in Gazebo and high-fidelity rendering for Human-Robot Interaction in Unity.
      </>
    ),
    link: '/docs/module-2-digital-twin/simulating-physics-in-gazebo',
  },
  {
    title: 'Module 3: The AI-Robot Brain (NVIDIA Isaac™)',
    description: (
      <>
        Unleash the power of NVIDIA Isaac for advanced perception and training. Learn about Isaac Sim for photorealistic simulation and Isaac ROS for hardware-accelerated VSLAM.
      </>
    ),
    link: '/docs/module-3-ai-robot-brain/nvidia-isaac-sim',
  },
  {
    title: 'Module 4: Vision-Language-Action (VLA)',
    description: (
      <>
        Bridge AI and robotics with large language models. Discover how to translate voice commands into complex robot actions using Whisper and LLM-driven cognitive planning.
      </>
    ),
    link: '/docs/module-4-vision-language-action/voice-to-action-whisper',
  },
];

function Feature({title, description, link}: ModuleItem) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}> {/* Add a class for custom styling */}
      <Link to={link} className={styles.featureLink}> {/* Make the entire card clickable */}
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {ModuleList.map((props, idx) => ( // Changed FeatureList to ModuleList
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
