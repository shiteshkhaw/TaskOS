'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress, scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 200]);

  // For How it works connector line
  const connectorScale = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11L12 14L22 4" />
                <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" />
              </svg>
            </div>
            <span className={styles.logoText}>TaskGuru</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#how-it-works" className={styles.navLink}>How it Works</Link>
            <Link href="/login" className={styles.navLinkSignIn}>Sign In</Link>
            <Link href="/signup" className={styles.navButton}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
            {/* Left Content */}
            <motion.div 
                className={styles.heroContent}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
                <h1 className={styles.heroTitle}>
                    Focus deeply.<br />
                    <span className={styles.gradientText}>Execute effortlessly.</span>
                </h1>
                <p className={styles.heroDescription}>
                    TaskGuru helps you eliminate mental clutter, build momentum, and stay consistent without burnout.
                </p>
                <div className={styles.heroCta}>
                    <Link href="/signup" className={styles.ctaPrimary}>
                        Get Started Free
                    </Link>
                    <Link href="/login" className={styles.ctaSecondary}>
                        Sign In
                    </Link>
                </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
                className={styles.heroVisual}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{ y: yHero }}
            >
                <div className={styles.visualWrapper}>
                    <motion.div 
                        className={`${styles.floatingElement} ${styles.taskCard}`}
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    >
                        <div className={styles.taskCardHeader}>
                            <div className={styles.taskCheckbox}>✓</div>
                            <span className={styles.taskTitle}>Deploy landing page</span>
                        </div>
                        <div className={styles.taskCardBody}>
                            <div className={styles.taskProgress}>
                                <div className={styles.taskProgressBar}></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className={`${styles.floatingElement} ${styles.streakCard}`}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 6, delay: 1, ease: "easeInOut" }}
                    >
                        <span className={styles.streakIcon}>🔥</span>
                        <div>
                            <div className={styles.streakTitle}>14 Day Streak</div>
                            <div className={styles.streakSubtitle}>Momentum active</div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className={`${styles.floatingElement} ${styles.calendarCard}`}
                        animate={{ y: [0, -25, 0] }}
                        transition={{ repeat: Infinity, duration: 9, delay: 2, ease: "easeInOut" }}
                    >
                        <div className={styles.calendarRow}>
                            <div className={`${styles.calDot} ${styles.calDotActive}`}></div>
                            <div className={`${styles.calDot} ${styles.calDotActive}`}></div>
                            <div className={`${styles.calDot} ${styles.calDotActive}`}></div>
                            <div className={styles.calDot}></div>
                        </div>
                        <div className={styles.calendarRow}>
                            <div className={styles.calDot}></div>
                            <div className={styles.calDot}></div>
                            <div className={styles.calDot}></div>
                            <div className={styles.calDot}></div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>

        {/* Trust Bar */}
        <motion.div 
            className={styles.trustBar}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <p className={styles.trustTitle}>Trusted by high-performers worldwide</p>
            <div className={styles.trustStats}>
                <div className={styles.trustStat}>
                    <span className={styles.statValue}>10K+</span>
                    <span className={styles.statLabel}>Active Users</span>
                </div>
                <div className={styles.trustStat}>
                    <span className={styles.statValue}>500K+</span>
                    <span className={styles.statLabel}>Tasks Completed</span>
                </div>
                <div className={styles.trustStat}>
                    <span className={styles.statValue}>99%</span>
                    <span className={styles.statLabel}>Satisfaction</span>
                </div>
            </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.section}>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={styles.sectionHeader}
        >
            <h2 className={styles.sectionTitle}>Designed for deep work, not distraction</h2>
        </motion.div>
        
        <div className={styles.featuresGrid}>
            {[
                {
                    title: "Intelligent Prioritization",
                    desc: "Automatically surface what matters most. No more decision fatigue.",
                    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                },
                {
                    title: "Habit Stacking",
                    desc: "Build consistency with structured routines and streak systems.",
                    icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                },
                {
                    title: "Time Visualizer",
                    desc: "See your time clearly across days, weeks, and months.",
                    icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>
                },
                {
                    title: "Gamified Momentum",
                    desc: "Stay engaged with progress tracking, levels, and rewards.",
                    icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                },
                {
                    title: "Accountability System",
                    desc: "Stay aligned with shared goals and collaborative workflows.",
                    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>
                },
                {
                    title: "Smart Nudges",
                    desc: "Get timely reminders that keep you on track without overwhelm.",
                    icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>
                }
            ].map((feature, i) => (
                <motion.div 
                    key={i}
                    className={styles.featureCard}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                >
                    <div className={styles.featureIconWrapper}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {feature.icon}
                        </svg>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={styles.sectionHeader}
            >
                <h2 className={styles.sectionTitle}>A simpler way to stay consistent</h2>
            </motion.div>
            
            <div className={styles.stepsFlow}>
                <motion.div 
                    className={styles.flowConnector}
                    style={{ scaleX: connectorScale }}
                />
                
                {[
                    { num: "01", title: "Plan your tasks" },
                    { num: "02", title: "Build your habits" },
                    { num: "03", title: "Track your momentum" }
                ].map((step, i) => (
                    <motion.div 
                        key={i}
                        className={styles.stepWrapper}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: i * 0.2 }}
                    >
                        <div className={styles.stepNum}>{step.num}</div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepTitle}>{step.title}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.section}>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.sectionHeader}
        >
            <h2 className={styles.sectionTitle}>Built for people who take execution seriously</h2>
        </motion.div>
        
        <div className={styles.testimonialGrid}>
            {[
                { text: "TaskGuru completely eliminated the friction in my daily planning. I just open it, and I know exactly what to execute.", author: "Alex K., Developer" },
                { text: "The anti-gravity feel isn't just aesthetic—it actually makes the app feel faster and less stressful to use.", author: "Sarah M., Product Designer" },
                { text: "Finally, a tool that balances habit tracking and task management without feeling like a cluttered spreadsheet.", author: "James T., Founder" }
            ].map((test, i) => (
                <motion.div 
                    key={i}
                    className={styles.testimonialCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                >
                    <p className={styles.testText}>"{test.text}"</p>
                    <p className={styles.testAuthor}>{test.author}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className={styles.ctaContentWrapper}
            >
                <div className={styles.ctaGlow} />
                <h2>Ready to take control of your time?</h2>
                <p>Start building focus, momentum, and consistency today.</p>
                <div className={styles.ctaButtons}>
                    <Link href="/signup" className={styles.ctaPrimary}>
                        Get Started Free
                    </Link>
                    <Link href="/login" className={styles.ctaSecondaryLight}>
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <div className={styles.logoIconFooter}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11L12 14L22 4" />
                <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" />
              </svg>
            </div>
            <span>TaskGuru</span>
          </div>
          <div className={styles.footerLinks}>
              <Link href="#">Product</Link>
              <Link href="#features">Features</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
