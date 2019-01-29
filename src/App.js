import React, { useMemo } from 'react';
import { combineReducers, useStore } from "./redooks.js";
import { useConnect } from "./react-redooks.js";

// selectors/...
const getCount = (state) => state.count;
const getNeverUpdates = (state) => state.neverUpdates;

// reducers/index.js
const defaultState = {
  neverUpdates: "always the same",
  count: 0
};
const rootReducer = combineReducers({
  neverUpdates: (state = defaultState.neverUpdates) => state,
  count: (state = defaultState.count, { type }) => {
    switch (type) {
      case "increment":
        return state + 1;
      case "decrement":
        return state - 1;
      default:
        return state;
    }
  }
});

// stores/MainStore.js
const MainStoreContext = React.createContext();
function useMainStore(mapStateToProps, mapDispatchToProps) {
  return useConnect(MainStoreContext, mapStateToProps, mapDispatchToProps);
}
function MainStoreProvider({ children }) {
  // WARNING: this will create a new store for every new instance
  const storeRef = useStore(rootReducer);
  return useMemo(() => (
    <MainStoreContext.Provider value={storeRef}>
      {children}
    </MainStoreContext.Provider>
  ), [storeRef, children]);
}

// App.js
function App() {
  return (
    <MainStoreProvider>
      <Counter />
      <br />
      <ShouldNotUpdateHeavyComponent />
    </MainStoreProvider>
  );
}

// Counter.js
function Counter() {
  const [state, actions] = useMainStore(
    (state) => ({ count: getCount(state) }),
    (dispatch) => ({
      increment: () => dispatch({ type: "increment" }),
      decrement: () => dispatch({ type: "decrement" })
    })
  );

  return (
    <>
      {JSON.stringify(state)}
      <button onClick={actions.increment}>increment</button>
      <button onClick={actions.decrement}>decrement</button>
    </>
  );
}

let externalCounter = 0;
function ShouldNotUpdateHeavyComponent() {
  const [state] = useMainStore(
    (state) => {
      return {
        neverUpdates: getNeverUpdates(state)
      };
    }
  );

  return (
    <>
      {`this number -->${++externalCounter}<-- should always equal 1`}
      <br />
      {`this should never change -->${state.neverUpdates}<--`}
    </>
  );
}

export default App;
