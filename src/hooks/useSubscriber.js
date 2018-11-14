import { useCallback } from "react";

export default function useSubscriber(onSubscribe, onUnsubscribe) {
  return useCallback((...args) => {
    onSubscribe(...args);
    return () => onUnsubscribe(...args);
  }, [onSubscribe, onUnsubscribe]);
};
