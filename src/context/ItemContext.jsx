import { createContext, useReducer, useContext } from "react";

const ItemContext = createContext();

const itemReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_ITEM':
      return { ...state, items: state.items.map(item => item.id === action.payload.id ? action.payload : item) };
    default:
      return state;
  }
};

export const ItemProvider = ({ children }) => {
  const [state, dispatch] = useReducer(itemReducer, { items: [] });
  return (
    <ItemContext.Provider value={{ state, dispatch }}>
      {children}
    </ItemContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useItemContext = () => useContext(ItemContext);