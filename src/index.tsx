import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux'; // 追加
import UserForm from './components/UserForm'; // 追加
// import InitialSetup from './components/InitialSetup'; // 追加
import Store from './Store'; // 追加
import { GlobalStyle, theme } from './components/style/FoundationStyles';
import { ThemeProvider } from 'styled-components';

const container = document.getElementById('contents');

// (async () => {
// const setupDone = await window.core.getInitialSetupData();
// console.log(setupDone);
// if (setupDone === 1) {
ReactDom.render(
  // 変更 -->
  <Provider store={Store}>
    <GlobalStyle />
    <ThemeProvider theme={theme}>
      <UserForm />
    </ThemeProvider>
  </Provider>,
  // <-- 変更
  container,
);
// } else {
// ReactDom.render(
//   // 変更 -->
//   <Provider store={Store}>
//     <GlobalStyle />
//     <ThemeProvider theme={theme}>
//       <InitialSetup />
//     </ThemeProvider>
//   </Provider>,
//   // <-- 変更
//   container,
// );
// }
// })();
