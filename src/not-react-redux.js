import { useMemo, useLayoutEffect, useContext } from "react";
import useStateRef from "./hooks/useStateRef.js";

export function useConnect(
  StoreContext,
  mapStateToProps = (s) => s,
  mapDispatchToProps = () => ({})
) {
  const storeRef = useContext(StoreContext);
  const initialState = useMemo(() => mapStateToProps(storeRef.current.getState()), []);
  const actions = useMemo(() => mapDispatchToProps(storeRef.current.dispatch), [storeRef.current.dispatch]);
  const [localStateRef, setLocalStateRef] = useStateRef(initialState);

  useLayoutEffect(() => {
    return storeRef.current.subscribe((state) => {
      // Shallow compare
      const newState = mapStateToProps(state);
      if (localStateRef.current.length !== newState.length) {
        setLocalStateRef.current(mapStateToProps(state));
      } else {
        for (let prop in localStateRef.current) {
          if (localStateRef.current[prop] !== newState[prop]) {
            setLocalStateRef.current(mapStateToProps(state));
            break;
          }
        }
      }
    });
  }, [storeRef.current.subscribe, localStateRef]);

  return useMemo(() => [
    localStateRef.current,
    actions
  ], [localStateRef.current, actions]);
};
