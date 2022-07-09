// import { reducerWithInitialState } from 'typescript-fsa-reducers';
// import { execRAction, registerStatus } from '../actions/RAction';
// import IRstatus from '../states/IR';
// // Stateの初期値
// const initIR: IRstatus = {
//   status: 'doNothing',
// };

// const RReducer = reducerWithInitialState<IRstatus>(initIR)
//   // Action ごとに`.case`をメソッドチェーンでつなぐ
//   // 1番目の引数は、アクション、2番めが処理の関数
//   // 処理の関数の引数は、1番目が変更前の State、2番めが Action の値
//   // 必ず、Stateと同じ型(ここでは、IUser)のオブジェクトを return する必要がある。
//   // payload はここでは、Actionで指定した`Partial<IUser>`の型のオブジェクト。
//   .case(execRAction.started, (state, payload) => ({
//     ...state,
//     status: payload,
//   }))
//   .case(execRAction.done, (state, payload) => ({ ...state, status: payload }))
//   .case(execRAction.failed, (state, payload) => ({ ...state, status: payload }))
//   .case(registerStatus, (state, payload) => ({ ...state, status: payload }))
//   .build();

// export default RReducer;
