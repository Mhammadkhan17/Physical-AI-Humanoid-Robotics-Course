import React, {type ReactNode} from 'react';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {translate} from '@docusaurus/Translate';

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function getNextColorMode(colorMode: string | null, respectPrefersColorScheme: boolean): string | null {
  if (!respectPrefersColorScheme) {
    return colorMode === 'dark' ? 'light' : 'dark';
  }
  switch (colorMode) {
    case null: return 'light';
    case 'light': return 'dark';
    case 'dark': return null;
    default: throw new Error(`unexpected color mode ${colorMode}`);
  }
}

function getColorModeLabel(colorMode: string | null) {
  switch (colorMode) {
    case null: return translate({message: 'system mode', id: 'theme.colorToggle.ariaLabel.mode.system', description: 'The name for the system color mode'});
    case 'light': return translate({message: 'light mode', id: 'theme.colorToggle.ariaLabel.mode.light', description: 'The name for the light color mode'});
    case 'dark': return translate({message: 'dark mode', id: 'theme.colorToggle.ariaLabel.mode.dark', description: 'The name for the dark color mode'});
    default: throw new Error(`unexpected color mode ${colorMode}`);
  }
}

export default function NavbarColorModeToggle(): ReactNode {
  const {disableSwitch, respectPrefersColorScheme} = useThemeConfig().colorMode;
  const {colorModeChoice, setColorMode} = useColorMode();
  const isBrowser = useIsBrowser();

  if (disableSwitch) {
    return null;
  }

  const Icon = colorModeChoice === 'dark' ? SunIcon : colorModeChoice === 'light' ? MoonIcon : SystemIcon;
  const label = getColorModeLabel(colorModeChoice);

  return (
    <button
      className="clean-btn"
      style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '50%', cursor: isBrowser ? 'pointer' : 'not-allowed', color: 'inherit', flexShrink: 0}}
      type="button"
      disabled={!isBrowser}
      onClick={() => isBrowser && setColorMode(getNextColorMode(colorModeChoice, respectPrefersColorScheme) as any)}
      title={label}
      aria-label={`Switch between dark and light mode (currently ${label})`}>
      <Icon />
    </button>
  );
}
