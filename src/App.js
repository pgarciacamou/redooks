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
      state[prop] = reducers[prop](state[prop], action);
    }
    return state;
  };
};

function useFlag(value = false) {
  const [flag, setFlag] = useState(value);
  const toggleOn = useCallback(() => setFlag(true), []);
  const toggleOff = useCallback(() => setFlag(false), []);
  return [flag, toggleOn, toggleOff];
}

function useProxyReducer(reducer, initialState, initalActions, getDispatchProxy) {
  const [state, dispatch] = useReducer(reducer, initialState, initalActions);
  const stateProxy = useCallback(() => state, [state]);
  const dispatchProxy = useCallback(getDispatchProxy(dispatch), [dispatch]);
  return [stateProxy, dispatchProxy];
}

function useListeners() {
  const [listeners, setListeners] = useState([]);
  const addListener = useCallback((listener) => {
    setListeners((listeners) => [...listeners, listener]);
  }, [setListeners]);
  const removeListener = useCallback((listener) => {
    setListeners((listeners) => _.reject(listeners, listener));
  }, [setListeners]);
  const executeListeners = useCallback((...args) => {
    listeners.forEach(listener => listener(...args));
  }, [listeners]);
  return [executeListeners, addListener, removeListener];
}

function useSubscriber(onSubscribe, onUnsubscribe) {
  return useCallback((...args) => {
    onSubscribe(...args);
    return () => onUnsubscribe(...args);
  }, []);
}

function useStore(rootReducer, initialState = {}, initialActions = {}) {
  // Handle state updates
  const [isDirty, setDirty, unsetDirty] = useFlag();

  // Handle subscribers
  const [notifySubscribers, addSubscriber, removeSubscriber] = useListeners();
  const subscribe = useSubscriber(addSubscriber, removeSubscriber);

  // Handle state
  const [getState, proxyDispatch] = useProxyReducer(
    rootReducer,
    initialState,
    initialActions,
    function getDispatchProxy(dispatch) {
      return (action) => {
        dispatch(action);
        setDirty();
      };
    }
  );

  // Handle store
  const store = useMemo(() => [
    getState,
    subscribe,
    proxyDispatch
  ], [getState, subscribe, proxyDispatch]);

  // Execute subscribers upon updates
  if (isDirty) {
    notifySubscribers(getState());
    unsetDirty();
  }

  return store;
}

// react-redux abstraction
function useConnect(
  StoreContext,
  mapStateToProps = (s) => s,
  mapDispatchToProps = () => ({})
) {
  const [getState, subscribe, dispatch] = useContext(StoreContext);
  const initialState = useMemo(() => mapStateToProps(getState()), []);
  const actions = useMemo(() => mapDispatchToProps(dispatch), [dispatch]);
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
