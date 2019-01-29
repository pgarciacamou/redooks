import { useReducer } from "react";
import { useEvergreenRef } from "./useEvergreenRef";

export default function useReducerRef(...args) {
  const [state, setState] = useReducer(...args);
  const stateRef = useEvergreenRef(state);
  const setStateRef = useEvergreenRef(setState);
  return [stateRef, setStateRef];
};
