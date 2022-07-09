import { applyMiddleware, combineReducers, createStore } from 'redux';
import { IState } from './states/IState';
import userReducer from './reducers/UserReducers';
import dataReducer from './reducers/DataReducers';
// import RReducer from './reducers/RReducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas/saga';

// 複数の reducer を束ねる
const combinedReducer = combineReducers<IState>({
  user: userReducer,
  data: dataReducer,
  // r: RReducer,
});

const sagaMiddleware = createSagaMiddleware();

// グローバルオブジェクトとして、store を作成する。
export const store = createStore(
  combinedReducer,
  applyMiddleware(sagaMiddleware),
);

sagaMiddleware.run(rootSaga);

// import store from './Store' とアクセスできるように default として定義する
export default store;
