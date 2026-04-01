"use client";

import { ShieldCheck, Fingerprint } from 'lucide-react';
import { useProtectedContext } from './context';
import styles from './page.module.scss';

export default function ProtectedPage() {
  const { user, context } = useProtectedContext();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        
        {/* Header Hero Section */}
        <div className={styles.heroSection}>
          {/* Decorative background glow */}
          <div className={styles.glowBackground}></div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <ShieldCheck className={styles.heroIcon} />
              Secured Content Area
            </div>
            <h1 className={styles.heroTitle}>
              Protected Confidential Page
            </h1>
            <p className={styles.heroDescription}>
              You have accessed this page through a valid authentication process. The data and components within this area are only available to authenticated users.
            </p>
          </div>
          
          {/* User Profile Badge */}
          <div className={styles.profileBadgeContainer}>
            <div className={styles.profileAvatar}>
              <span className={styles.profileInitials}>
                {(user || 'U')[0]}
              </span>
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{user || 'User'}</div>
              <div className={styles.profileStatus}>Authenticated</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.gridSection}>
            <div className={styles.proofCard}>
              <h3 className={styles.proofHeader}>
                <span className={styles.proofIndicator}></span>
                Proof of Successful Authentication
              </h3>
              <p className={styles.proofDescription}>
                Successfully passed the frontend authentication check (<code className={styles.proofCode}>/authorization/authenticated</code>). This indicates that the session evaluated by the BFF's policy engine is valid.
              </p>
            </div>
          </div>

          <div className={styles.contextContainer}>
            <h3 className={styles.contextHeader}>
              <Fingerprint className={styles.contextIcon} />
              Your Security Context
            </h3>
            <pre className={styles.contextCode}>
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
