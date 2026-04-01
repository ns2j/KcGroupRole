"use client";

import { useEffect, useState } from 'react';
import { UserCircle, Key, Loader2, AlertCircle } from 'lucide-react';
import styles from './page.module.scss';

export default function InfoPage() {
  const [infoData, setInfoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${BASE_PATH}/api/node/api/info`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setInfoData(data);
        } else if (response.status === 401) {
          setError('Not logged in. Please log in to view this page.');
        } else {
          setError('Failed to fetch data.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to communicate with the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <AlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1>
          <UserCircle className="text-indigo-600 h-7 w-7" />
          User Information Dashboard
        </h1>
        <p>
          You can check the basic profile of the currently logged-in user and detailed token information obtained from Keycloak.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Profile Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <UserCircle className="h-5 w-5 text-indigo-500" />
            <h2>Basic Profile</h2>
          </div>
          <div className={styles.cardContent}>
            <div>
              <p className={styles.profileLabel}>Preferred Username</p>
              <p className={styles.profileValue}>
                {infoData?.decodedAccessToken?.preferred_username || 'Not set'}
              </p>
            </div>
            <div>
              <p className={styles.profileLabel}>Username</p>
              <p className={styles.profileValue}>
                {infoData?.user?.displayName || infoData?.user?.username || 'Not set'}
              </p>
            </div>
            <div>
              <p className={styles.profileLabel}>ID</p>
              <p className={styles.profileValueId}>
                {infoData?.user?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Decode token Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Key className="h-5 w-5 text-indigo-500" />
            <h2>Access Token (Decoded)</h2>
          </div>
          <div className={`${styles.tokenContainer} custom-scrollbar`}>
            <pre>
              {JSON.stringify(infoData?.decodedAccessToken, null, 2)}
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}