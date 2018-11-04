import React, { useReducer, useContext } from 'react';
import './App.css';

// redux
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

// react-redux
function useConnect(StoreContext) {
  const [state, dispatch] = useContext(StoreContext);
  return [
    function useStateFromStore(
      mapStateToProps = (s) => s,
      mapDispatchToProps = () => ({})
    ) {
      return [
        mapStateToProps(state),
        mapDispatchToProps(dispatch)
      ];
    }
  ];
}

// selectors
const selectCount = (state) => state.count;

// reducers
const defaultState = { count: 0 };
const rootReducer = combineReducers({
  random: () => Math.random(),
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

// stores/GlobalStore.js
const GlobalStoreContext = React.createContext();

// App.js
function App() {
  const [state, dispatch] = useStore(rootReducer);
  return (
    <GlobalStoreContext.Provider value={[state, dispatch]}>
      <MyComponent />
    </GlobalStoreContext.Provider>
  );
}

// MyComponent.js
function MyComponent() {
  const [useStateFromStore] = useConnect(GlobalStoreContext);
  const [state, actions] = useStateFromStore(
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
