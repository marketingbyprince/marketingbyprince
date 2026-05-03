import React, { useState } from 'react';
import styles from './Experience.module.css';
import { data } from '../data';

export default function Experience() {
  const [active, setActive] = useState(0);
  const exp = data.experience[active];

  return (
    <section id="experience" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>02 — Experience</span>
        <h2 className={styles.heading}>Where I've Built Results</h2>
      </div>

      <div className={styles.layout}>
        {/* Sidebar tabs */}
        <div className={styles.sidebar}>
          {data.experience.map((e, i) => (
            <button
              key={i}
              className={`${styles.tab} ${active === i ? styles.tabActive : ''}`}
              onClick={() => setActive(i)}
            >
              <span className={styles.tabPeriod}>{e.period}</span>
              <span className={styles.tabCompany}>{e.company}</span>
              <span className={styles.tabRole}>{e.role}</span>
              {e.current && <span className={styles.currentBadge}>Current</span>}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className={styles.panel} key={active}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.role}>{exp.role}</h3>
              <div className={styles.meta}>
                <span className={styles.company}>{exp.company}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.location}>{exp.location}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.period}>{exp.period}</span>
              </div>
            </div>
          </div>

          <ul className={styles.bullets}>
            {exp.bullets.map((b, i) => (
              <li key={i} className={styles.bullet} style={{ animationDelay: `${i * 0.06}s` }}>
                <span className={styles.bulletArrow}>→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
