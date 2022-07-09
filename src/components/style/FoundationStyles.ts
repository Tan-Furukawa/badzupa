import 'reset-css/reset.css';

import baseStyled, {
  createGlobalStyle,
  ThemedStyledInterface,
} from 'styled-components';

export const GlobalStyle = createGlobalStyle`
html, body {
    font-family: "Meiryo UI";
    font-size: 12pt;
    height: 100vh;
    width: 100vw;
}
`;

// テーマの設定
// SASS style sheet */
// Palette color codes */
// Palette URL: http://paletton.com/#uid=54r1g0knvBjdsPDiZI7sCwOvApZ */

export const theme = {
  PRIMARY_0: '#fff', // main background */
  PRIMARY_1: '#222', // main border */
  PRIMARY_2: '#1479fb', //  main blue
  PRIMARY_3: '#FA216F', // warning color
  PRIMARY_4: '#ddd', // sub line
  PRIMARY_5: '#1479fb', //  button blue
  SECONDARY_5_0: '#fff', // in PRIMARY_5 button color
  SECONDARY_5_1: '#44a9fb',
  DENSITY_CURVE: '#44a9fb',
  DENSITY_AREA: '#ccc',
  CERTAIN_LEVEL0: '#12A785',
  CERTAIN_LEVEL1: '#ffd700',
  CERTAIN_LEVEL2: '#f27538',
  CERTAIN_LEVEL3: '#FA016F',
  SECONDARY_1_2: '#52CAAF',
  SECONDARY_2_1: '#FF9E94',
  SECONDARY_2_2: '#FF7668',
  SECONDARY_2_3: '#FF311B',
  SECONDARY_2_4: '#',
  FOREGROUND: '#333',
  FOREGROUND_REVERSE: 'white',
};

export type Theme = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<Theme>;

export const InputFormat = styled.input`
  border: 1px solid ${theme.PRIMARY_1};
  border-radius: 0;
`;

export const ButtonFormat = styled.button`
  border: none;
  border-radius: 0.5em;
  background-color: ${p => p.theme.PRIMARY_5};
  color: ${p => p.theme.SECONDARY_5_0};
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 2px;
  margin-right: 2px;
  height 2em;
  &:hover {
    background-color: ${p => p.theme.SECONDARY_5_1};
  }
  &:active {
    background-color: ${p => p.theme.SECONDARY_5_1};
  }
`;
