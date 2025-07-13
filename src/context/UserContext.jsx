import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const LOCAL_STORAGE_KEY = 'user_login';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.exp || parsed.exp > Date.now()) {
        setUser(parsed);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY); //expired
      }
    }
  }, []);

  const loginAsUser = (userPayload) => {
    const loginData = {
      ...userPayload,
      exp: Date.now() + SESSION_DURATION_MS,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loginData));
    setUser(loginData);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    queryClient.removeQueries({ queryKey: ['performances'] });
  };

  const isRole = (competitionId, roleKey) => {
    return user?.roles?.some(
      (r) => r.competition.id === competitionId && r[roleKey]
    );
  };

  const value = {
    user,
    competitionId: user?.competition_id ?? null,
    loginAsUser,
    logout,
    isVoter: (compId) => isRole(compId, 'is_voter'),
    isJury: (compId) => isRole(compId, 'is_jury'),
    isPerformer: (compId) => isRole(compId, 'is_performer'),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);