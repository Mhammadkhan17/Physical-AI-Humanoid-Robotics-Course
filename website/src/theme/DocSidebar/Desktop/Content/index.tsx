import React, {type ReactNode, useState} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  useAnnouncementBar,
  useScrollPosition,
} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import DocSidebarItems from '@theme/DocSidebarItems';
import type {Props} from '@theme/DocSidebar/Desktop/Content';

import styles from './styles.module.css';

function useShowAnnouncementBar() {
  const {isActive} = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);

  useScrollPosition(
    ({scrollY}) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0);
      }
    },
    [isActive],
  );
  return isActive && showAnnouncementBar;
}

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className,
}: Props): ReactNode {
  const showAnnouncementBar = useShowAnnouncementBar();
  const moduleCount = sidebar.filter((item) => item.type === 'category').length;
  const lessonCount = sidebar.reduce(
    (total, item) =>
      total + (item.type === 'category' ? item.items.length : 0),
    0,
  );

  return (
    <>
      <div className={styles.railHead}>
        <span className={styles.railEyebrow}>Course index</span>
        <p className={styles.railTitle}>Physical AI &amp; Humanoid Robotics</p>
        <div className={styles.railMeta}>
          <span>{moduleCount} modules</span>
          <span className={styles.railMetaDot} aria-hidden="true" />
          <span>{lessonCount} lessons</span>
        </div>
      </div>
      <nav
        aria-label={translate({
          id: 'theme.docs.sidebar.navAriaLabel',
          message: 'Docs sidebar',
          description: 'The ARIA label for the sidebar navigation',
        })}
        className={clsx(
          'menu thin-scrollbar',
          styles.menu,
          showAnnouncementBar && styles.menuWithAnnouncementBar,
          className,
        )}>
        <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list')}>
          <DocSidebarItems items={sidebar} activePath={path} level={1} />
        </ul>
      </nav>
      <div className={styles.railFoot}>
        <span className={styles.railSignal} aria-hidden="true" />
        <div>
          <p className={styles.railFootTitle}>Ask the text</p>
          <p className={styles.railFootCopy}>
            Select a passage in any chapter to ask the course tutor about it.
          </p>
        </div>
      </div>
    </>
  );
}
