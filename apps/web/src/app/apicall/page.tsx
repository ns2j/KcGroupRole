"use client";

import { useState } from 'react';
import { Send, Server, Code, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import styles from './page.module.scss';

export default function ApiCallPage() {
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activePath, setActivePath] = useState<string | null>(null);
    const [activeMethod, setActiveMethod] = useState<string | null>(null);

    const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8020/exclient';
    const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

    const apiEndpoints = [
        {
            name: 'Auth Check',
            path: `${BASE_PATH}/api/node/api/authorization/authenticated`, method: 'GET', category: 'Auth',
            description: 'Verify active BFF session'
        },
        {
            name: 'User Info',
            path: `${BASE_PATH}/api/node/api/info`, method: 'GET', category: 'Auth',
            description: 'Retrieve Keycloak token data'
        },
        {
            name: 'Public API',
            path: `${BASE_PATH}/api/node/api/public/hello`, method: 'GET', category: 'Public',
            description: 'Unprotected ApiServer endpoint'
        },
        {
            name: 'Role/Group',
            path: `${BASE_PATH}/api/node/api/authorization/roleorgroup`, method: 'GET', category: 'AST Policy',
            description: 'Requires admin, user, or /A group'
        },
        {
            name: 'Admin Zone',
            path: `${BASE_PATH}/api/node/api/authorization/admin`, method: 'GET', category: 'AST Policy',
            description: 'Requires manager role'
        },
        {
            name: 'Complex Logic',
            path: `${BASE_PATH}/api/node/api/authorization/a`, method: 'GET', category: 'AST Policy',
            description: 'Complex logic: manager + group'
        },
        {
            name: 'Protected (API)',
            path: `${BASE_PATH}/api/node/api/protected-resource`, method: 'GET', category: 'ApiServer',
            description: 'ApiServer protected endpoint'
        },
        {
            name: 'Admin-Only (API)',
            path: `${BASE_PATH}/api/node/api/admin-only`, method: 'GET', category: 'ApiServer',
            description: 'ApiServer admin role restriction'
        },
        {
            name: 'Group Restricted (API)',
            path: `${BASE_PATH}/api/node/api/group-restricted`, method: 'GET', category: 'ApiServer',
            description: 'ApiServer /A/C group restriction'
        },
    ];

    const handleApiCall = async (path: string, method: string) => {
        setIsLoading(true);
        setActivePath(path);
        setActiveMethod(method);
        setResponse(null);
        setStatusCode(null);

        try {
            const res = await fetch(path, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setStatusCode(res.status);

            try {
                const data = await res.json();
                setResponse(data);
            } catch (e) {
                const text = await res.text();
                setResponse({ message: "Not a JSON response", data: text });
            }

        } catch (error: any) {
            console.error('API call error:', error);
            setStatusCode(0);
            setResponse({ error: error.message || 'Communication failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Fix the height of the entire screen and set it so that it does not overflow
        <div className={styles.pageContainer}>

            <div className={styles.headerSection}>
                <h1>
                    <ShieldAlert size={28} />
                    API Authorization Test Console
                </h1>
                <p>
                    Test access control with RBAC (Role), Group, and AST (Abstract Syntax Tree) policies.
                </p>
            </div>

            {/* This is the point! Setting to force flex-row and always line up side-by-side */}
            <div className={styles.mainLayout}>

                {/* 🗂️ Left: API Menu (1/3 width, independently scrollable) */}
                <div className={`${styles.leftMenu} custom-scrollbar`}>

                    {apiEndpoints.map((api, index) => (
                        <button
                            key={index}
                            onClick={() => handleApiCall(api.path, api.method)}
                            disabled={isLoading}
                            className={`${styles.apiButton} ${activePath === api.path ? styles.apiButtonActive : styles.apiButtonInactive}`}
                        >
                            <div className={styles.apiButtonHeader}>
                                <div className={styles.apiButtonLeftArea}>
                                    <span className={`${styles.categoryTag} ${api.category.includes('AST') ? styles.categoryAst :
                                            api.category.includes('ApiServer') ? styles.categoryApiServer :
                                                api.category === 'Public' ? styles.categoryPublic :
                                                    styles.categoryDefault
                                        }`}>
                                        {api.category}
                                    </span>
                                </div>
                                {isLoading && activePath === api.path ? (
                                    <Loader2 className={styles.iconLoading} />
                                ) : (
                                    <Send className={activePath === api.path ? styles.iconActive : styles.iconInactive} />
                                )}
                            </div>
                            <h3 className={styles.apiName}>{api.name}</h3>
                            <p className={styles.apiDescription}>{api.description}</p>
                        </button>
                    ))}
                </div>

                {/* 💻 Right: Result Display Area (2/3 width, full height) */}
                <div className={styles.rightPanel}>
                    <div className={styles.resultContainer}>

                        <div className={styles.resultHeader}>
                            <div className={styles.resultHeaderLeft}>
                                <div className={styles.resultTitle}>
                                    <Code size={16} />
                                    <span>Response Payload</span>
                                </div>
                                {activePath && (
                                    <span className={styles.activePathBadge} title={activePath}>
                                        {activeMethod} <span className="font-bold ml-1">{activePath}</span>
                                    </span>
                                )}
                            </div>

                            {statusCode !== null && (
                                <div className={`${styles.statusBadge} ${statusCode >= 200 && statusCode < 300 ? styles.statusSuccess :
                                    statusCode === 401 || statusCode === 403 ? styles.statusWarning :
                                        styles.statusError
                                    }`}>
                                    {statusCode >= 200 && statusCode < 300 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    Status: {statusCode === 0 ? 'Network Error' : statusCode}
                                </div>
                            )}
                        </div>

                        <div className={styles.responseArea}>
                            {!activePath ? (
                                <div className={styles.responseEmpty}>
                                    Please select an API from the menu on the left to execute.
                                </div>
                            ) : isLoading ? (
                                <div className={styles.loadingDisplay}>
                                    <Loader2 className={styles.loadingDisplayIcon} />
                                    <span>Evaluating Policies...</span>
                                </div>
                            ) : (
                                <pre className={`${styles.responsePre} ${statusCode && statusCode >= 400 ? styles.textWarning : styles.textSuccess}`}>
                                    {response ? JSON.stringify(response, null, 2) : 'No data returned.'}
                                </pre>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}