import { useReducer, useCallback } from "react";

export default function useReducerWithGetter(
  reducer,
  initialState,
  initalActions,
  getDispatchProxy = (dispatch) => dispatch
) {
  const [state, dispatch] = useReducer(reducer, initialState, initalActions);
  const getState = useCallback(() => state, [state]);
  const dispatchProxy = useCallback(getDispatchProxy(dispatch), [dispatch]);
  return [getState, dispatchProxy];
};
