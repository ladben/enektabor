import { createContext, useContext } from "react";

export const SequenceContext = createContext({
  BUTTON_PRESSED_TIME: 150,
  SWIPE_DELAY: 50,
});

export const useSequenceConfig = () => useContext(SequenceContext);