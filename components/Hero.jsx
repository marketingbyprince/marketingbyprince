import React, { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import { data } from '@/data';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Background grid */}
      <div className={styles.grid} style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
      <div className={styles.noise} />

      {/* Top bar */}
      <nav className={styles.nav}>
        <span className={styles.navTag}>Portfolio 2025</span>
        <div className={styles.navLinks}>
          <a href="#experience">Experience</a>
          <a href="#achievements">Wins</a>
          <a href="#clients">Clients</a>
          <a href={`mailto:${data.contact.email}`} className={styles.cta}>Hire Me</a>
        </div>
      </nav>

      {/* Main hero content */}
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          Available for opportunities
        </div>

        <h1 className={styles.name}>{data.name}</h1>

        <div className={styles.titleRow}>
          <span className={styles.accentLine} />
          <p className={styles.titleText}>{data.title} · {data.subtitle}</p>
        </div>

        <p className={styles.summary}>{data.summary}</p>

        <div className={styles.contactRow}>
          <a href={`mailto:${data.contact.email}`} className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            {data.contact.email}
          </a>
          <a href={`tel:${data.contact.phone}`} className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73 19.79 19.79 0 0 1 1.61 5.1 2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
            {data.contact.phone}
          </a>
          <span className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {data.contact.location}
          </span>
          <a href={data.contact.linkedin} target="_blank" rel="noreferrer" className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            LinkedIn
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        {data.stats.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
