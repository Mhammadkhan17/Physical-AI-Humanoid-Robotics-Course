import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import ContentVisibility from '@theme/ContentVisibility';
import {useAskAi} from '@site/src/features/ask-ai';
import type {Props} from '@theme/DocItem/Layout';

import styles from './styles.module.css';

const MODULE_NAMES: Record<string, string> = {
  '1': 'ROS 2',
  '2': 'Gazebo & Unity',
  '3': 'NVIDIA Isaac',
  '4': 'VLA Models',
};

function getModuleLabel(id: string): string {
  const match = id.match(/^module-(\d+)/i);
  if (!match) {
    return 'Course';
  }
  const name = MODULE_NAMES[match[1]];
  return name ? `Module ${match[1]} / ${name}` : `Module ${match[1]}`;
}

function useDocTOC() {
  const {frontMatter, toc} = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({children}: Props): ReactNode {
  const docTOC = useDocTOC();
  const {metadata} = useDoc();
  const {open} = useAskAi();

  return (
    <div
      className={clsx(
        styles.docSurface,
        !docTOC.desktop && styles.docSurfaceNoToc,
      )}>
      <div className={styles.docColumn}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.sheet}>
          <div className={styles.runningHead}>
            <div className={styles.runningMeta}>
              <span className={styles.moduleLabel}>
                {getModuleLabel(metadata.id)}
              </span>
              <span className={styles.runningRule} aria-hidden="true" />
              <span className={styles.runningTitle}>{metadata.title}</span>
            </div>
            <button
              type="button"
              className={styles.askText}
              onClick={open}>
              <span className={styles.askDot} aria-hidden="true" />
              Ask the text
            </button>
          </div>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && (
        <aside className={styles.tocRail} aria-label="On this page">
          <div className={styles.tocHead}>
            <span>On this page</span>
            <span className={styles.tocDot} aria-hidden="true" />
          </div>
          {docTOC.desktop}
        </aside>
      )}
    </div>
  );
}
