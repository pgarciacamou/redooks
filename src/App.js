import React, { useReducer, useContext, useMemo } from 'react';

// redux abstraction
function combineReducers(reducers) {
  return (state = {}, action) => {
    for(let prop in reducers) {
      const reducer = reducers[prop];
      state[prop] = reducer(state[prop], action);
    }
    return state;
  };
};
function useStore(rootReducer, initialState = {}) {
  // Pass empty action to run all reducers and get intial state
  return useReducer(rootReducer, initialState, {});
}

// react-redux abstraction
function useConnect(
  StoreContext,
  mapStateToProps = (s) => s,
  mapDispatchToProps = () => ({})
) {
  const [state, dispatch] = useContext(StoreContext);
  const actions = useMemo(() => mapDispatchToProps(dispatch));
  return [
    mapStateToProps(state),
    actions
  ];
}

// CounterSelectors.js
const selectCount = (state) => state.count;

// reducers
const defaultState = { count: 0 };
const rootReducer = combineReducers({
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
  return (
    <MainStoreContext.Provider value={store}>
      <Counter />
    </MainStoreContext.Provider>
  );
}

// Counter.js
function Counter() {
  const [state, actions] = useConnect(
    MainStoreContext,
    (state) => ({ count: selectCount(state) }),
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

export default App;
