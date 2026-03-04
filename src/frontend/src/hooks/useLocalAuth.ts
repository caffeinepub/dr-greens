import { useCallback, useEffect, useState } from "react";

export interface LocalUser {
  name: string;
  email: string;
  phone: string;
  location: string;
  googleMapsLink: string;
}

const STORAGE_KEY = "drgreens_user";

function loadUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

function saveUser(user: LocalUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function removeUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(() => loadUser());
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isLoggedIn = user !== null;

  const login = useCallback((userData: LocalUser) => {
    saveUser(userData);
    setUser(userData);
    setShowLoginModal(false);
  }, []);

  const logout = useCallback(() => {
    removeUser();
    setUser(null);
  }, []);

  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  return {
    user,
    isLoggedIn,
    login,
    logout,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  };
}
