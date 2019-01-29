import { useCallback } from "react";
import useReducerRef from "./useReducerRef";

export default function useReducerWithGetter(
  reducer,
  initialState,
  initalActions,
  getDispatchProxy = (dispatch) => dispatch
) {
  const [stateRef, dispatchRef] = useReducerRef(reducer, initialState, initalActions);
  const getState = useCallback(() => stateRef.current, [stateRef]);
  const dispatchProxy = useCallback(
    getDispatchProxy(dispatchRef.current),
    [dispatchRef]
  );
  return [getState, dispatchProxy];
};
