# Tailwind CSS + Chakra UI v3 Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CSS Modules and inline styles with Tailwind CSS utility classes and Chakra UI v3 components across the Docusaurus frontend.

**Architecture:** Tailwind CSS v4 provides utility classes for layout, spacing, and typography. Chakra UI v3 provides theming via ChakraProvider and Button components for complex interactive elements. Infima CSS (Docusaurus default) remains as the base framework; Tailwind preflight is disabled to avoid conflicts.

**Tech Stack:** Tailwind CSS v4, PostCSS, Chakra UI v3, Emotion React, Docusaurus 3.9.2, React 19

**Spec:** `difference.md` (Section 1.1 — Styling deviation: CSS Modules → Tailwind CSS + Chakra UI)

---

## Global Constraints

- Docusaurus 3.9.2 with Infima CSS must remain functional
- Tailwind preflight must be disabled (conflicts with Infima)
- Chakra UI v3 uses Emotion for CSS-in-JS
- Existing Infima CSS variables in custom.css must be preserved
- Urdu translation RTL styles must be preserved
- Auth pages (login, signup, AuthContext) remain unchanged
- React 19 compatibility required

---

## File Structure

```
website/
├── postcss.config.js          # NEW — PostCSS pipeline for Tailwind
├── tailwind.config.js         # NEW — Tailwind configuration
├── src/
│   ├── css/
│   │   └── custom.css         # MODIFY — Add Tailwind directives + animations
│   ├── theme/
│   │   ├── Root.tsx            # MODIFY — Add ChakraProvider wrapper
│   │   └── theme.ts           # NEW — Chakra UI system config
│   ├── components/
│   │   ├── RAGChatbot.tsx      # MODIFY — Replace CSS module with Tailwind
│   │   ├── RAGChatbot.module.css  # DELETE
│   │   ├── HomepageFeatures/
│   │   │   ├── index.tsx       # MODIFY — Replace CSS module with Tailwind
│   │   │   └── styles.module.css  # DELETE
│   │   └── ChapterProgress.tsx # MODIFY — Replace inline styles with Tailwind
│   └── pages/
│       ├── index.tsx           # MODIFY — Replace CSS module with Tailwind
│       └── index.module.css    # DELETE
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `website/package.json`

**Interfaces:**
- Consumes: None (first task)
- Produces: Dependencies available for all subsequent tasks

- [ ] **Step 1: Install Tailwind CSS v4 and PostCSS**

```bash
cd website && npm install tailwindcss @tailwindcss/postcss
```

- [ ] **Step 2: Install Chakra UI v3 and Emotion**

```bash
cd website && npm install @chakra-ui/react @emotion/react
```

- [ ] **Step 3: Verify package.json has new dependencies**

```bash
cd website && cat package.json | grep -E "tailwind|chakra|emotion"
```

Expected output should show all three packages.

- [ ] **Step 4: Commit**

```bash
git add website/package.json website/yarn.lock
git commit -m "deps(website): add tailwindcss v4, chakra-ui v3, emotion"
```

---

### Task 2: Create PostCSS Configuration

**Files:**
- Create: `website/postcss.config.js`

**Interfaces:**
- Consumes: tailwindcss package from Task 1
- Produces: PostCSS pipeline used by Docusaurus build

- [ ] **Step 1: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la website/postcss.config.js
```

- [ ] **Step 3: Commit**

```bash
git add website/postcss.config.js
git commit -m "config(website): add postcss config for tailwind"
```

---

### Task 3: Create Tailwind Configuration

**Files:**
- Create: `website/tailwind.config.js`

**Interfaces:**
- Consumes: Infima CSS variables from custom.css (colors, fonts)
- Produces: Tailwind theme tokens used by all components

- [ ] **Step 1: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2e8555',
          dark: '#29784c',
          darker: '#277148',
          darkest: '#205d3b',
          light: '#33925d',
          lighter: '#359962',
          lightest: '#3cad6e',
        },
        dark: {
          DEFAULT: '#25c2a0',
          dark: '#21af90',
          darker: '#1fa588',
          darkest: '#1a8870',
          light: '#29d5b0',
          lighter: '#32d8b4',
          lightest: '#4fddbf',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      animation: {
        'pulse-chat': 'pulse 1.5s infinite ease-in-out',
        'spin-loader': 'spin 0.8s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disabled to avoid conflicts with Infima CSS
  },
};
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la website/tailwind.config.js
```

- [ ] **Step 3: Commit**

```bash
git add website/tailwind.config.js
git commit -m "config(website): add tailwind config with custom theme tokens"
```

---

### Task 4: Create Chakra UI Theme

**Files:**
- Create: `website/src/theme/theme.ts`

**Interfaces:**
- Consumes: Same color tokens as Tailwind config
- Produces: ChakraProvider system config used by Root.tsx

- [ ] **Step 1: Create theme.ts**

```typescript
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e8f5e9" },
          100: { value: "#c8e6c9" },
          200: { value: "#a5d6a7" },
          300: { value: "#81c784" },
          400: { value: "#66bb6a" },
          500: { value: "#2e8555" },
          600: { value: "#29784c" },
          700: { value: "#277148" },
          800: { value: "#205d3b" },
          900: { value: "#1b4d31" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          DEFAULT: { value: "{colors.brand.500}" },
          dark: { value: "{colors.brand.600}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la website/src/theme/theme.ts
```

- [ ] **Step 3: Commit**

```bash
git add website/src/theme/theme.ts
git commit -m "feat(website): add chakra ui theme config"
```

---

### Task 5: Update Global CSS

**Files:**
- Modify: `website/src/css/custom.css`

**Interfaces:**
- Consumes: Tailwind directives, animation keyframes from RAGChatbot.module.css
- Produces: Global CSS with Tailwind utilities and preserved Infima overrides

- [ ] **Step 1: Read current custom.css**

Read `website/src/css/custom.css` to confirm current content.

- [ ] **Step 2: Update custom.css with Tailwind directives and animations**

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/**
 * Any CSS included here will be global. The classic template
 * bundles Infima by default. Infima is a CSS framework designed to
 * work well for content-centric websites.
 */

/* You can override the default Infima variables here. */
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  --ifm-color-primary-darker: #277148;
  --ifm-color-primary-darkest: #205d3b;
  --ifm-color-primary-light: #33925d;
  --ifm-color-primary-lighter: #359962;
  --ifm-color-primary-lightest: #3cad6e;
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

/* For readability concerns, you should choose a lighter palette in dark mode. */
[data-theme='dark'] {
  --ifm-color-primary: #25c2a0;
  --ifm-color-primary-dark: #21af90;
  --ifm-color-primary-darker: #1fa588;
  --ifm-color-primary-darkest: #1a8870;
  --ifm-color-primary-light: #29d5b0;
  --ifm-color-primary-lighter: #32d8b4;
  --ifm-color-primary-lightest: #4fddbf;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}

.urdu-translation-content {
  font-family: 'Noto Nastaliq Urdu', serif;
  direction: rtl;
  line-height: 3em;
}

/* Chatbot spinner animation */
@keyframes chatbot-spin {
  to {
    transform: rotate(360deg);
  }
}

.chatbot-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--ifm-color-primary);
  border-radius: 50%;
  animation: chatbot-spin 0.8s linear infinite;
  margin: 5px;
}
```

- [ ] **Step 3: Verify file was updated**

```bash
head -10 website/src/css/custom.css
```

Expected: Should show the Tailwind directives.

- [ ] **Step 4: Commit**

```bash
git add website/src/css/custom.css
git commit -m "style(website): add tailwind directives and move animations to global css"
```

---

### Task 6: Update Root.tsx with ChakraProvider

**Files:**
- Modify: `website/src/theme/Root.tsx`

**Interfaces:**
- Consumes: system from theme.ts (Task 4)
- Produces: ChakraProvider wrapping all children

- [ ] **Step 1: Read current Root.tsx**

Read `website/src/theme/Root.tsx` to confirm current content.

- [ ] **Step 2: Update Root.tsx to wrap with ChakraProvider**

```typescript
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@theme/theme';
import { AuthProvider } from '@site/src/contexts/AuthContext';
import { SelectedTextProvider } from '@site/src/contexts/SelectedTextContext';
import { ChatbotVisibilityProvider } from '@site/src/contexts/ChatbotVisibilityContext';

export default function Root({children}) {
  return (
    <ChakraProvider value={system}>
      <ChatbotVisibilityProvider>
        <SelectedTextProvider>
          <AuthProvider>{children}</AuthProvider>
        </SelectedTextProvider>
      </ChatbotVisibilityProvider>
    </ChakraProvider>
  );
}
```

- [ ] **Step 3: Verify file was updated**

```bash
head -5 website/src/theme/Root.tsx
```

Expected: Should show ChakraProvider import.

- [ ] **Step 4: Commit**

```bash
git add website/src/theme/Root.tsx
git commit -m "feat(website): wrap Root with ChakraProvider for theming"
```

---

### Task 7: Migrate HomepageFeatures to Tailwind

**Files:**
- Modify: `website/src/components/HomepageFeatures/index.tsx`
- Delete: `website/src/components/HomepageFeatures/styles.module.css`

**Interfaces:**
- Consumes: Tailwind classes from tailwind.config.js
- Produces: Component using Tailwind utilities only

- [ ] **Step 1: Read current HomepageFeatures/index.tsx**

Read `website/src/components/HomepageFeatures/index.tsx` to confirm current content.

- [ ] **Step 2: Update HomepageFeatures/index.tsx to use Tailwind**

```typescript
import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

type ModuleItem = {
  title: string;
  description: ReactNode;
  link: string;
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
    <div className="col col--4">
      <Link to={link} className="block no-underline hover:no-underline">
        <div className="text-center px-4">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="flex items-center py-8 w-full">
      <div className="container">
        <div className="row">
          {ModuleList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Delete styles.module.css**

```bash
rm website/src/components/HomepageFeatures/styles.module.css
```

- [ ] **Step 4: Verify build works**

```bash
cd website && yarn build
```

Expected: Build succeeds without CSS module import errors.

- [ ] **Step 5: Commit**

```bash
git add website/src/components/HomepageFeatures/index.tsx
git commit -m "refactor(website): migrate HomepageFeatures from CSS module to Tailwind"
```

---

### Task 8: Migrate Index Page to Tailwind

**Files:**
- Modify: `website/src/pages/index.tsx`
- Delete: `website/src/pages/index.module.css`

**Interfaces:**
- Consumes: Tailwind classes from tailwind.config.js
- Produces: Page using Tailwind utilities only

- [ ] **Step 1: Read current index.tsx**

Read `website/src/pages/index.tsx` to confirm current content.

- [ ] **Step 2: Update index.tsx to use Tailwind**

```typescript
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import { useAuth } from '@site/src/contexts/AuthContext';
import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--primary py-16 text-center relative overflow-hidden max-md:py-8">
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className="flex items-center justify-center">
          <Link
            className="button button--secondary button--lg"
            to="/docs/module-1-robotic-nervous-system/ros-nodes-topics-services">
            Start Learning ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
```

- [ ] **Step 3: Delete index.module.css**

```bash
rm website/src/pages/index.module.css
```

- [ ] **Step 4: Verify build works**

```bash
cd website && yarn build
```

Expected: Build succeeds without CSS module import errors.

- [ ] **Step 5: Commit**

```bash
git add website/src/pages/index.tsx
git commit -m "refactor(website): migrate index page from CSS module to Tailwind"
```

---

### Task 9: Migrate ChapterProgress to Tailwind

**Files:**
- Modify: `website/src/components/ChapterProgress.tsx`

**Interfaces:**
- Consumes: Tailwind classes from tailwind.config.js
- Produces: Component using Tailwind utilities only

- [ ] **Step 1: Read current ChapterProgress.tsx**

Read `website/src/components/ChapterProgress.tsx` to confirm current content.

- [ ] **Step 2: Update ChapterProgress.tsx to use Tailwind**

```typescript
import React, { useState, useEffect } from 'react';

interface ChapterProgressProps {
  chapterId: string;
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({ chapterId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const chapterContent = document.querySelector('.theme-doc-markdown');
      if (chapterContent) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  return (
    <div
      className="fixed top-0 left-0 h-[5px] bg-primary z-[9999]"
      style={{ width: `${progress}%` }}
    />
  );
};

export default ChapterProgress;
```

- [ ] **Step 3: Verify build works**

```bash
cd website && yarn build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add website/src/components/ChapterProgress.tsx
git commit -m "refactor(website): migrate ChapterProgress from inline styles to Tailwind"
```

---

### Task 10: Migrate RAGChatbot to Tailwind

**Files:**
- Modify: `website/src/components/RAGChatbot.tsx`
- Delete: `website/src/components/RAGChatbot.module.css`

**Interfaces:**
- Consumes: Tailwind classes, chatbot-spinner class from custom.css
- Produces: Component using Tailwind utilities only

- [ ] **Step 1: Read current RAGChatbot.tsx and RAGChatbot.module.css**

Read both files to confirm current content.

- [ ] **Step 2: Update RAGChatbot.tsx to use Tailwind**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useSelectedText } from '@site/src/contexts/SelectedTextContext';
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const RAGChatbot: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { selectedText, setSelectedText, chapterId, setChapterId } = useSelectedText();
  const { isOpen, setIsOpen } = useChatbotVisibility();
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedText(null);
      setChapterId(null);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage: Message = { text: input, sender: 'user' };
    setChatHistory((prev) => [...prev, newUserMessage, { text: '', sender: 'bot' }]);
    setInput('');
    setIsStreaming(true);

    try {
      const body: { message: string; selected_text?: string; chapter_id?: string } = { message: input };
      if (selectedText && selectedText.trim().length > 0) {
        body.selected_text = selectedText;
        if (chapterId) {
          body.chapter_id = chapterId;
        }
      }

      console.log("Sending to backend:", body);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend validation error:', errorData.detail);
        throw new Error(errorData.detail ? JSON.stringify(errorData.detail) : `HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setChatHistory((prev) => {
          const lastMessage = prev[prev.length - 1];
          lastMessage.text += chunk;
          return [...prev];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        { text: 'Error communicating with the chatbot.', sender: 'bot' },
      ]);
    } finally {
      setIsStreaming(false);
      setSelectedText(null);
      setChapterId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      <button
        className="bg-primary text-white border-none rounded-full w-[60px] h-[60px] text-base cursor-pointer shadow-lg flex justify-center items-center hover:bg-primary-dark transition-colors"
        onClick={toggleChat}
      >
        {isOpen ? 'Close' : 'Chat'}
      </button>

      {isOpen && (
        <div className="w-[370px] h-[500px] max-h-[80vh] bg-[var(--ifm-background-color)] rounded-lg shadow-xl flex flex-col overflow-hidden font-poppins backdrop-blur-[10px]">
          <div className="bg-[var(--ifm-card-background-color)] py-2.5 px-4 border-b border-[var(--ifm-color-gray-300)] flex justify-between items-center">
            <h3 className="m-0 text-[1.1em]">RAG Chatbot</h3>
            <button onClick={toggleChat} className="bg-transparent border-none text-[1.5em] cursor-pointer text-[var(--ifm-color-gray-600)]">×</button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-2.5">
            {selectedText && (
              <div className="bg-[var(--ifm-color-info-background)] border border-[var(--ifm-color-info)] rounded-lg p-2.5 mb-2.5 text-[0.9em] text-[var(--ifm-color-info-dark)] relative">
                <p className="m-0 mb-1.5"><strong>Context from selection:</strong></p>
                <p className="m-0 max-h-[80px] overflow-y-auto whitespace-pre-wrap break-words bg-[var(--ifm-background-color)] p-1.5 rounded-[5px] border border-[var(--ifm-color-gray-300)]">{selectedText}</p>
                <button className="absolute top-1.5 right-1.5 bg-transparent border-none text-[var(--ifm-color-danger)] cursor-pointer text-[0.8em] px-1.5 py-[3px] rounded-[3px] hover:bg-[rgba(var(--ifm-color-danger-rgb),0.1)]" onClick={() => setSelectedText(null)}>Clear Context</button>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`p-2.5 px-3 rounded-[15px] max-w-[80%] break-words text-[0.9em] leading-[1.4] ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white self-end rounded-br-[2px]'
                    : 'bg-[var(--ifm-card-background-color)] text-[var(--ifm-font-color-base)] self-start border border-[var(--ifm-color-gray-300)] rounded-bl-[2px]'
                } ${isStreaming && index === chatHistory.length - 1 ? 'animate-pulse-chat' : ''}`}
              >
                {isStreaming && msg.sender === 'bot' && msg.text === '' ? (
                  <div className="chatbot-spinner"></div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex border-t border-[var(--ifm-color-gray-300)] p-2.5 bg-[var(--ifm-card-background-color)]"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow border border-[var(--ifm-color-gray-300)] rounded-[20px] py-2.5 px-4 mr-2.5 text-base outline-none"
              disabled={isStreaming}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="bg-primary text-white border-none rounded-[20px] py-2.5 px-4 cursor-pointer text-base font-bold hover:bg-primary-dark disabled:bg-[var(--ifm-color-gray-500)] disabled:cursor-not-allowed transition-colors"
              disabled={!input.trim() || !token || isStreaming}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RAGChatbot;
```

- [ ] **Step 3: Delete RAGChatbot.module.css**

```bash
rm website/src/components/RAGChatbot.module.css
```

- [ ] **Step 4: Verify build works**

```bash
cd website && yarn build
```

Expected: Build succeeds without CSS module import errors.

- [ ] **Step 5: Commit**

```bash
git add website/src/components/RAGChatbot.tsx
git commit -m "refactor(website): migrate RAGChatbot from CSS module to Tailwind"
```

---

### Task 11: Migrate DocItem to Chakra UI + Tailwind

**Files:**
- Modify: `website/src/theme/DocItem/index.tsx`

**Interfaces:**
- Consumes: ChakraProvider from Root.tsx (Task 6), Tailwind classes
- Produces: Component using Chakra Button + Tailwind utilities

- [ ] **Step 1: Read current DocItem/index.tsx**

Read `website/src/theme/DocItem/index.tsx` to confirm current content.

- [ ] **Step 2: Update DocItem/index.tsx to use Chakra Button + Tailwind**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import DocItem from '@theme-original/DocItem';
import ChapterProgress from '@site/src/components/ChapterProgress';
import { useAuth } from '@site/src/contexts/AuthContext';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useSelectedText } from '@site/src/contexts/SelectedTextContext';
import { useChatbotVisibility } from '@site/src/contexts/ChatbotVisibilityContext';
import { Button, Box, Text } from '@chakra-ui/react';

export default function DocItemWrapper(props) {
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [isLoadingPersonalize, setIsLoadingPersonalize] = useState(false);
  const [errorPersonalize, setErrorPersonalize] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [showAskAiButton, setShowAskAiButton] = useState(false);
  const [askAiButtonPosition, setAskAiButtonPosition] = useState({ x: 0, y: 0 });

  const { isAuthenticated, loading, token, user } = useAuth();
  const { selectedText, setSelectedText, setChapterId } = useSelectedText();
  const { setIsOpen: setChatbotOpen } = useChatbotVisibility();
  const history = useHistory();
  const baseUrl = useBaseUrl('/login');
  const quizUrl = useBaseUrl('/quiz');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = `${baseUrl}?reason=unauthorized_content`;
    }
  }, [loading, isAuthenticated, baseUrl]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && token && user) {
        try {
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.profile) {
                setHasProfile(true);
            } else {
                setHasProfile(false);
            }
          } else {
            console.error("Failed to fetch user profile:", response.status);
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Network error fetching user profile:", error);
          setHasProfile(false);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, token, user]);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (contentRef.current && contentRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        const selectedString = selection.toString().trim();

        if (selectedString.length > 0) {
          setSelectedText(selectedString);
          setChapterId(props.content.metadata.id);
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setAskAiButtonPosition({
            x: rect.right + window.scrollX - 50,
            y: rect.bottom + window.scrollY + 5,
          });
          setShowAskAiButton(true);
        } else {
          setSelectedText(null);
          setChapterId(null);
          setShowAskAiButton(false);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSelectedText, setChapterId, props.content.metadata.id]);

  useEffect(() => {
    if (!selectedText) {
      setShowAskAiButton(false);
    }
  }, [selectedText]);

  if (loading || !isAuthenticated) {
    return (
      <div className="p-5">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const handlePersonalize = async () => {
    if (!user || !token) {
      alert("Please log in to personalize content.");
      return;
    }
    const chapterText = contentRef.current?.innerText || '';
    if (!chapterText) {
      alert("Could not find chapter content to personalize.");
      return;
    }

    setIsLoadingPersonalize(true);
    setErrorPersonalize(null);
    setPersonalizedContent(null);
    setTranslatedContent(null);

    try {
      const response = await fetch('/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_original_text: chapterText,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPersonalizedContent(data.personalized_chapter_text);
        setShowTranslated(false);
      } else {
        setErrorPersonalize(data.detail || 'Failed to personalize chapter.');
      }
    } catch (err) {
      console.error('Error personalizing chapter:', err);
      setErrorPersonalize('Network error or server unavailable.');
    } finally {
      setIsLoadingPersonalize(false);
    }
  };

  const handleTranslate = async () => {
    if (!user || !token) {
      alert("Please log in to translate content.");
      return;
    }
    const textToTranslate = personalizedContent || contentRef.current?.innerText || '';
    if (!textToTranslate) {
      alert("Could not find chapter content to translate.");
      return;
    }

    setIsLoadingTranslate(true);
    setErrorTranslate(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: textToTranslate,
          target_language: 'Urdu',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedContent(data.translated_text);
        setShowTranslated(true);
      } else {
        setErrorTranslate(data.detail || 'Failed to translate chapter.');
      }
    } catch (err) {
      console.error('Error translating chapter:', err);
      setErrorTranslate('Network error or server unavailable.');
    } finally {
      setIsLoadingTranslate(false);
    }
  };

  const displayContent = showTranslated
    ? translatedContent
    : personalizedContent;

  const handleAskAiClick = () => {
    if (selectedText) {
      setChatbotOpen(true);
      setShowAskAiButton(false);
    }
  };

  return (
    <>
      {isAuthenticated && <ChapterProgress chapterId={props.content.metadata.id} />}
      {isAuthenticated && (
        <div className="flex justify-end mb-5">
          <Button
            colorScheme="green"
            mr={2.5}
            onClick={
              hasProfile
                ? handlePersonalize
                : () => history.push(quizUrl)
            }
            isLoading={isLoadingPersonalize}
            loadingText="Personalizing..."
            fontFamily="Poppins, sans-serif"
          >
            {hasProfile ? 'Personalize this chapter' : 'Take Quiz to Personalize'}
          </Button>
          <Button
            colorScheme="green"
            onClick={handleTranslate}
            isLoading={isLoadingTranslate}
            loadingText="Translating..."
            fontFamily="Poppins, sans-serif"
          >
            <span className="font-urdu">اردو میں پڑھیں</span> / Read in Urdu
          </Button>
        </div>
      )}

      {errorPersonalize && <Text color="red.500">Error: {errorPersonalize}</Text>}
      {errorTranslate && <Text color="red.500">Error: {errorTranslate}</Text>}

      {isAuthenticated && personalizedContent && (
        <Box bg="blue.50" color="blue.700" p={2.5} rounded="md" mb={3.75}>
          This chapter has been personalized for your experience level.
        </Box>
      )}

      {displayContent ? (
        <ReactMarkdown
          className={showTranslated ? "urdu-translation-content" : undefined}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {displayContent}
        </ReactMarkdown>
      ) : (
        <div ref={contentRef}>
          <DocItem {...props} />
        </div>
      )}

      {isAuthenticated && showAskAiButton && selectedText && (
        <Button
          position="absolute"
          left={askAiButtonPosition.x}
          top={askAiButtonPosition.y}
          colorScheme="green"
          size="sm"
          zIndex={1001}
          boxShadow="0 2px 5px rgba(0,0,0,0.2)"
          onClick={handleAskAiClick}
        >
          Ask AI about this
        </Button>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify build works**

```bash
cd website && yarn build
```

Expected: Build succeeds.

- [ ] **Step 4: Run typecheck**

```bash
cd website && yarn typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add website/src/theme/DocItem/index.tsx
git commit -m "refactor(website): migrate DocItem from inline styles to Chakra UI + Tailwind"
```

---

### Task 12: Final Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks completed
- Produces: Verified working build

- [ ] **Step 1: Full build verification**

```bash
cd website && yarn build
```

Expected: Build completes successfully.

- [ ] **Step 2: Typecheck verification**

```bash
cd website && yarn typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 3: Verify no CSS module files remain**

```bash
find website/src -name "*.module.css"
```

Expected: No output (all CSS modules deleted).

- [ ] **Step 4: Verify Tailwind and Chakra in package.json**

```bash
cat website/package.json | grep -E "tailwind|chakra|emotion"
```

Expected: Shows all three packages.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(website): complete tailwind + chakra-ui migration, cleanup"
```
