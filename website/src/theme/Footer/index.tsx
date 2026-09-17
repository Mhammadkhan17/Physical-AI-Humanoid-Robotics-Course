import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';

export default function Footer(): ReactNode {
  const {
    footer: {style, links, copyright, logo},
  } = useThemeConfig() as any;

  if (!links) {
    throw new Error('footer links not found');
  }

  return (
    <footer className="footer footer--dark">
      <div className="container container-fluid">
        <div className="row footer__links">
          {links.map((column: any, i: number) => (
            <div key={i} className={`col footer__col ${column.className ?? ''}`}>
              <div className="footer__title">{column.title}</div>
              <ul className="footer__items clean-list">
                {column.items.map((item: any, j: number) => (
                  <li key={j} className="footer__item">
                    <a
                      className="footer__link-item"
                      href={item.href}
                      {...(item.href?.startsWith('http')
                        ? {target: '_blank', rel: 'noopener noreferrer'}
                        : {})}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright && (
              <div
                className="footer__copyright"
                dangerouslySetInnerHTML={{__html: copyright}}
              />
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
