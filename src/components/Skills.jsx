import React from 'react';
import styles from './Skills.module.css';
import { data } from '../data';

export default function Skills() {
  return (
    <section id="skills" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>01 — Core Competencies</span>
          <h2 className={styles.heading}>What I Bring</h2>
        </div>

        <div className={styles.grid}>
          {Object.entries(data.competencies).map(([category, skills], i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.cardTitle}>{category}</h3>
              </div>
              <div className={styles.tags}>
                {skills.map((skill, j) => (
                  <span key={j} className={styles.tag}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Platform logos row */}
        <div className={styles.platforms}>
          <span className={styles.platformLabel}>Platforms</span>
          {['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Looker Studio', 'SEMrush', 'GTM'].map((p, i) => (
            <span key={i} className={styles.platform}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
