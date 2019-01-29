import { useRef } from "react";

export function useEvergreenRef(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
