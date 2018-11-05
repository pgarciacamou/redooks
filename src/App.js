import React, {
  useReducer,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback
} from 'react';
import _ from "lodash";

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
  const [state, dispatch] = useReducer(rootReducer, initialState, {});

  // Only update this callback unless the object reference is different
  // in case the rootReducer returns a new object.
  const getState = useCallback(() => state, [state]);

  // Use flag to only render on dispatch
  const [isDirty, toggleDirty] = useState(false);
  const proxyDispatch = useCallback((action) => {
    dispatch(action);
    toggleDirty(true);
  }, [dispatch]);

  // Handle subscribers
  const [subscribers, setSubscribers] = useState([]);
  const subscribe = useCallback((subscriber) => {
    setSubscribers((subscribers) => [...subscribers, subscriber]);
    return function unsubscribe() {
      setSubscribers((subscribers) => _.reject(subscribers, subscriber));
    };
  }, []);

  // Nofity subscribers when there is an update
  if (isDirty) {
    toggleDirty(false);
    subscribers.forEach(subscriber => subscriber(getState()));
  }

  // this ensures that the store only changes when
  return useMemo(() => [
    getState,
    subscribe,
    proxyDispatch
  ], [getState, subscribe, proxyDispatch]);
}

// react-redux abstraction
function useConnect(
  StoreContext,
  mapStateToProps = (s) => s,
  mapDispatchToProps = () => ({})
) {
  const [getState, subscribe, dispatch] = useContext(StoreContext);
  const initialState = useMemo(() => mapStateToProps(getState()), []);
  const actions = useMemo(() => mapDispatchToProps(dispatch));
  const [localState, setLocalState] = useState(initialState);

  useEffect(() => {
    return subscribe((state) => {
      // Shallow compare
      const newState = mapStateToProps(state);
      if(localState.length !== newState.length) {
        setLocalState(mapStateToProps(state));
      } else {
        for (let prop in localState) {
          if(localState[prop] !== newState[prop]) {
            setLocalState(mapStateToProps(state));
            break;
          }
        }
      }
    });
  }, [subscribe]);

  return useMemo(() => [
    localState,
    actions
  ], [localState, actions]);
}

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
