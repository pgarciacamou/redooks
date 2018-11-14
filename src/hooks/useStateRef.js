import { useRef, useState } from "react";

export default function useStateRef(value) {
  const [state, setState] = useState(value);
  const ref = useRef();
  ref.current = state;
  return [ref, setState];
};
