import { useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useItemContext } from "../context/ItemContext";

export const useItems = () => {
  const { state, dispatch } = useItemContext();

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase.from('items').select('*');
    if (!error) {
      dispatch({ type: 'SET_ITEMS', payload: data });
    }
  }, [dispatch]);

  const addItem = async (item) => {
    const { data, error } = await supabase.from('items').insert([item]).single();
    if (!error) {
      dispatch({ type: 'ADD_ITEM', payload: data });
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      dispatch({ type: 'DELETE_ITEM', payload: id });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items: state.items, addItem, deleteItem };
};