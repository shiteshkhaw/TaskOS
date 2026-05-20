'use client';

import styles from './layout.module.css';
import { motion } from 'framer-motion';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            {/* Left Visual Panel */}
            <div className={styles.visualPanel}>
                <div className={styles.visualContent}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className={styles.heading}>
                            Organize your life<br />without friction
                        </h1>
                        <p className={styles.subtext}>
                            TaskGuru helps you focus on what truly matters.
                        </p>
                    </motion.div>

                    <div className={styles.floatingElements}>
                        {/* Floating Task Card */}
                        <motion.div 
                            className={`${styles.floatCard} ${styles.taskCard}`}
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        >
                            <div className={styles.cardIcon}>✓</div>
                            <div className={styles.cardLines}>
                                <div className={styles.line1}></div>
                                <div className={styles.line2}></div>
                            </div>
                        </motion.div>

                        {/* Floating Calendar Block */}
                        <motion.div 
                            className={`${styles.floatCard} ${styles.calendarCard}`}
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                        >
                            <div className={styles.calendarHeader}></div>
                            <div className={styles.calendarBody}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                        </motion.div>

                        {/* Floating Progress Indicator */}
                        <motion.div 
                            className={`${styles.floatCard} ${styles.progressCard}`}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
                        >
                            <div className={styles.progressCircle}></div>
                            <div className={styles.progressText}></div>
                        </motion.div>
                    </div>
                </div>
                
                {/* Optional dynamic text */}
                <div className={styles.dynamicWelcome}>
                    Welcome, friend 👋
                </div>
            </div>

            {/* Right Content Panel */}
            <main className={styles.contentPanel}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
}
