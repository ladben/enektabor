import { createContext, useContext, useEffect, useState } from "react";

const ProfileDisplayContext = createContext();

const LOCAL_STORAGE_KEY = 'profile_display';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

export const ProfileDisplayProvider = ({ children }) => {
  const [profileDisplay, setProfileDisplay] = useState(null);

  // Load profile display from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.exp || parsed.exp > Date.now()) {
        setProfileDisplay(parsed);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY); //expired
      }
    } else {
      const selectData = {
      icon: true,
      exp: Date.now() + SESSION_DURATION_MS,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectData));
    setProfileDisplay(selectData);
    }
  }, []);

  const get = () => {
    return profileDisplay;
  };

  const set = (selected) => {
    const selectData = {
      ...selected,
      exp: Date.now() + SESSION_DURATION_MS,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectData));
    setProfileDisplay(selectData);
  }

  const flip = () => {
    const newValue = {
      icon: !profileDisplay.icon,
      exp: Date.now() + SESSION_DURATION_MS,
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
    setProfileDisplay(newValue);
  }

  const value = {
    profileDisplay,
    get,
    set,
    flip,
  };

  return <ProfileDisplayContext.Provider value={value}>{children}</ProfileDisplayContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfileDisplay = () => useContext(ProfileDisplayContext);