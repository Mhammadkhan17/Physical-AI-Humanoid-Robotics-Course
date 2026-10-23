import type {ReactNode, SVGProps} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import type {Props} from '@theme/DocCard/Heading/Icon';

import styles from './styles.module.css';

const iconProps: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export default function DocCardHeadingIcon(_props: Props): ReactNode {
  return (
    <span className={clsx(ThemeClassNames.docs.docCard.icon, styles.cardTitleIcon)}>
      <svg {...iconProps}>
        <path d="M6 3.5h7l5 5v12H6v-17Z" />
        <path d="M13 3.5v5h5" />
      </svg>
    </span>
  );
}
