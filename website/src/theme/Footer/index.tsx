import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {ThemeClassNames} from '@docusaurus/theme-common';
import FooterLayout from '@theme/Footer/Layout';
import FooterLinks from '@theme/Footer/Links';
import FooterLogo from '@theme/Footer/Logo';
import FooterCopyright from '@theme/Footer/Copyright';

export default function Footer(): ReactNode {
  const {
    footer: {style, links, logo, copyright},
  } = useThemeConfig();

  return (
    <FooterLayout
      style={style}
      links={<FooterLinks links={links} />}
      logo={logo ? <FooterLogo logo={logo} /> : undefined}
      copyright={<FooterCopyright copyright={copyright} />}
    />
  );
}
