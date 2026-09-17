import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import ColorModeToggle from '@theme/ColorModeToggle';
import type {Props} from '@theme/Navbar/ColorModeToggle';

export default function NavbarColorModeToggle({className}: Props): ReactNode {
  const {disableSwitch, respectPrefersColorScheme} = useThemeConfig().colorMode;
  const {colorModeChoice, setColorMode} = useColorMode();

  if (disableSwitch) {
    return null;
  }

  return (
    <div className={clsx(className)} style={{width: '2rem', height: '2rem', flexShrink: 0}}>
      <ColorModeToggle
        respectPrefersColorScheme={respectPrefersColorScheme}
        value={colorModeChoice}
        onChange={setColorMode}
      />
    </div>
  );
}
