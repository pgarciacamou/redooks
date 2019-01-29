import { useState } from "react";
import useReducerWithGetter from "./hooks/useReducerWithGetter.js";
import useListeners from "./hooks/useListeners.js";
import useSubscriber from "./hooks/useSubscriber.js";
import { useEvergreenRef } from "./hooks/useEvergreenRef.js";

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
  const [isDirty, setIsDirtyFlag] = useState(false);

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
        setIsDirtyFlag(true);
      };
    }
  );

  // Execute subscribers upon updates
  if (isDirty) {
    notifySubscribers(getState());
    setIsDirtyFlag(false);
  }

  // Handle store
  return useEvergreenRef({
    getState,
    subscribe,
    dispatch: proxyDispatch
  });
};
