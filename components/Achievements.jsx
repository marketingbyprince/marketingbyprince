import React from 'react';
import styles from './Achievements.module.css';
import { data } from '@/data';

export default function Achievements() {
  return (
    <section id="achievements" className={styles.section}>
      <div className={styles.left}>
        <span className={styles.label}>03 — Key Wins</span>
        <h2 className={styles.heading}>Numbers<br />That Speak</h2>
        <p className={styles.sub}>
          Every metric here represents a real campaign, a real client,
          and a measurable outcome delivered.
        </p>
      </div>

      <div className={styles.right}>
        {data.achievements.map((a, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            <p className={styles.text}>{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
