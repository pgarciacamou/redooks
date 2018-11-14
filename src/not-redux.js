import { useMemo } from "react";
import useFlag from "./hooks/useFlag.js";
import useReducerWithGetter from "./hooks/useReducerWithGetter.js";
import useListeners from "./hooks/useListeners.js";
import useSubscriber from "./hooks/useSubscriber.js";

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
  const [getState, proxyDispatch] = useReducerWithGetter(
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
