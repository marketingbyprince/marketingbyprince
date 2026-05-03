import React from 'react';
import styles from './Clients.module.css';
import { data } from '../data';

export default function Clients() {
  return (
    <section id="clients" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>04 — Clients & Verticals</span>
        <h2 className={styles.heading}>Who I've Worked With</h2>
      </div>

      <div className={styles.clientGrid}>
        {data.clients.map((c, i) => (
          <div key={i} className={styles.clientCard}>
            <span className={styles.clientVertical}>{c.vertical}</span>
            <h3 className={styles.clientName}>{c.name}</h3>
          </div>
        ))}
      </div>

      <div className={styles.verticalSection}>
        <span className={styles.verticalLabel}>Industries Served</span>
        <div className={styles.verticals}>
          {data.verticals.map((v, i) => (
            <span key={i} className={styles.vertical}>{v}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
