import { useCallback } from "react";
import useStateRef from "./useStateRef";

export default function useListeners() {
  const [listenersRef, setListenersRef] = useStateRef([]);
  const addListener = useCallback((listener) => {
    setListenersRef.current((listeners) => [...listeners, listener]);
  }, [setListenersRef]);
  const removeListener = useCallback((listener) => {
    setListenersRef.current((listeners) => {
      return listeners.reduce((accum, l) => {
        if (l === listener) {
          return accum;
        }
        return [...accum, l];
      }, []);
    });
  }, [setListenersRef]);
  const executeListeners = useCallback((...args) => {
    listenersRef.current.forEach(listener => listener(...args));
  }, [listenersRef]);
  return [executeListeners, addListener, removeListener];
}
