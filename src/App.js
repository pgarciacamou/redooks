import React, { useMemo } from 'react';
import { combineReducers, useStore } from "./not-redux";
import { useConnect } from "./not-react-redux";

// selectors
const getCount = (state) => state.count;
const getNeverUpdates = (state) => state.neverUpdates;

// reducers
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

// MainStore.js
const MainStoreContext = React.createContext();

// App.js
function App() {
  const store = useStore(rootReducer);
  const inner = useMemo(() => (
    <>
      <Counter />
      <br />
      <ShouldNotUpdateHeavyComponent />
    </>
  ), []);

  return (
    <MainStoreContext.Provider value={store}>
      {inner}
    </MainStoreContext.Provider>
  );
}

// Counter.js
function Counter() {
  const [state, actions] = useConnect(
    MainStoreContext,
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
  const [state] = useConnect(
    MainStoreContext,
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
