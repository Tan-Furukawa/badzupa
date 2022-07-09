"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonFormat = exports.InputFormat = exports.styled = exports.theme = exports.GlobalStyle = void 0;
require("reset-css/reset.css");
const styled_components_1 = __importStar(require("styled-components"));
exports.GlobalStyle = (0, styled_components_1.createGlobalStyle) `
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
exports.theme = {
    PRIMARY_0: '#fff',
    PRIMARY_1: '#222',
    PRIMARY_2: '#1479fb',
    PRIMARY_3: '#FA216F',
    PRIMARY_4: '#ddd',
    PRIMARY_5: '#1479fb',
    SECONDARY_5_0: '#fff',
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
exports.styled = styled_components_1.default;
exports.InputFormat = exports.styled.input `
  border: 1px solid ${exports.theme.PRIMARY_1};
  border-radius: 0;
`;
exports.ButtonFormat = exports.styled.button `
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
//# sourceMappingURL=FoundationStyles.js.map