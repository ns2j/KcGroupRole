"use client";

import { Fingerprint } from 'lucide-react';
import { useManagerContext } from './context';
import styles from './page.module.scss';

export default function ManagerPage() {
  const { contextData } = useManagerContext();

  // UI when permissions are granted
  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        
        <div className={styles.heroSection}>
          <div className={styles.heroBackground}></div>
          
          <div className={styles.iconBox}>
            <Fingerprint className={styles.iconAsset} />
          </div>

          <div className={styles.textContent}>
            <h1 className={styles.mainTitle}>
              Top Secret Manager Area
            </h1>
            <p className={styles.subTitle}>
              Successfully verified Manager permissions. This page is fully protected by robust Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>

        <div className={styles.contentSection}>
          <h3 className={styles.contentTitle}>Your Security Context (via BFF)</h3>
          <p className={styles.contentDesc}>
            Roles and group information derived from Keycloak, evaluated by the BFF's AST policy engine.
          </p>
          <pre className={styles.codeBlock}>
            {JSON.stringify(contextData, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}
