import { useState, useCallback } from "react";

export default function useListeners() {
  const [listeners, setListeners] = useState([]);
  const addListener = useCallback((listener) => {
    setListeners((listeners) => [...listeners, listener]);
  }, [setListeners]);
  const removeListener = useCallback((listener) => {
    setListeners((listeners) => {
      // FIXME: do not return the same array
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      return listeners
    });
  }, [setListeners]);
  const executeListeners = useCallback((...args) => {
    listeners.forEach(listener => listener(...args));
  }, [listeners]);
  return [executeListeners, addListener, removeListener];
}
