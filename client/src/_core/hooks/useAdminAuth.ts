import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface AdminSession {
  sessionToken: string;
  adminEmail: string;
  adminRole: string;
  loginTime: Date;
  isExpired: boolean;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sessão ao montar
  useEffect(() => {
    const checkSession = () => {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminEmail = localStorage.getItem('adminEmail');
      const adminRole = localStorage.getItem('adminRole');
      const loginTimeStr = localStorage.getItem('adminLoginTime');

      if (!sessionToken || !adminEmail || !adminRole || !loginTimeStr) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const loginTime = new Date(loginTimeStr);
      const now = new Date();
      const elapsedTime = now.getTime() - loginTime.getTime();

      // Verificar se sessão expirou
      if (elapsedTime > SESSION_TIMEOUT_MS) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminLoginTime');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setSession({
        sessionToken,
        adminEmail,
        adminRole,
        loginTime,
        isExpired: false,
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  // Monitorar inatividade
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      // Avisar 5 minutos antes de expirar
      warningTimer = setTimeout(() => {
        console.warn('Sessão expirará em 5 minutos');
      }, SESSION_TIMEOUT_MS - 5 * 60 * 1000);

      // Expirar sessão
      inactivityTimer = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT_MS);
    };

    // Eventos de atividade
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminLoginTime');
    setSession(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const extendSession = () => {
    if (session) {
      const newLoginTime = new Date().toISOString();
      localStorage.setItem('adminLoginTime', newLoginTime);
      setSession({
        ...session,
        loginTime: new Date(newLoginTime),
      });
    }
  };

  const getRemainingTime = (): number => {
    if (!session) return 0;
    const now = new Date();
    const elapsedTime = now.getTime() - session.loginTime.getTime();
    const remainingTime = SESSION_TIMEOUT_MS - elapsedTime;
    return Math.max(0, remainingTime);
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    logout,
    extendSession,
    getRemainingTime,
  };
}
