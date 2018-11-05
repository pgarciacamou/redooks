import { useMemo, useState, useReducer, useCallback } from 'react';

function useFlag(value = false) {
  const [flag, setFlag] = useState(value);
  const toggleOn = useCallback(() => setFlag(true), []);
  const toggleOff = useCallback(() => setFlag(false), []);
  return [flag, toggleOn, toggleOff];
}

function useProxyReducer(reducer, initialState, initalActions, getDispatchProxy) {
  const [state, dispatch] = useReducer(reducer, initialState, initalActions);
  const stateProxy = useCallback(() => state, [state]);
  const dispatchProxy = useCallback(getDispatchProxy(dispatch), [dispatch]);
  return [stateProxy, dispatchProxy];
}

function useListeners() {
  const [listeners, setListeners] = useState([]);
  const addListener = useCallback((listener) => {
    setListeners((listeners) => [...listeners, listener]);
  }, [setListeners]);
  const removeListener = useCallback((listener) => {
    setListeners((listeners) => {
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

function useSubscriber(onSubscribe, onUnsubscribe) {
  return useCallback((...args) => {
    onSubscribe(...args);
    return () => onUnsubscribe(...args);
  }, []);
}

export function combineReducers(reducers) {
  return (state = {}, action) => {
    for (let prop in reducers) {
      state[prop] = reducers[prop](state[prop], action);
    }
    return state;
  };
};

export function useStore(rootReducer, initialState = {}, initialActions = {}) {
  // Handle state updates
  const [isDirty, setDirty, unsetDirty] = useFlag();

  // Handle subscribers
  const [notifySubscribers, addSubscriber, removeSubscriber] = useListeners();
  const subscribe = useSubscriber(addSubscriber, removeSubscriber);

  // Handle state
  const [getState, proxyDispatch] = useProxyReducer(
    rootReducer,
    initialState,
    initialActions,
    function getDispatchProxy(dispatch) {
      return (action) => {
        dispatch(action);
        setDirty();
      };
    }
  );

  // Handle store
  const store = useMemo(() => [
    getState,
    subscribe,
    proxyDispatch
  ], [getState, subscribe, proxyDispatch]);

  // Execute subscribers upon updates
  if (isDirty) {
    notifySubscribers(getState());
    unsetDirty();
  }

  return store;
};
