import { useState, useCallback } from "react";

export default function useFlag(value = false) {
  const [flag, setFlag] = useState(value);
  const switchOn = useCallback(() => setFlag(true), []);
  const switchOff = useCallback(() => setFlag(false), []);
  return [flag, switchOn, switchOff];
};
