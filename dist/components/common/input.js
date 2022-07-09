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
exports.ToggleInputFormat = exports.NumberInputBox = void 0;
const react_1 = __importStar(require("react"));
const FoundationStyles_1 = require("../style/FoundationStyles");
const Input = FoundationStyles_1.styled.input `
  width: 50px;
`;
const NumberInputBox = props => {
    const onValueChange = (0, react_1.useCallback)((e) => {
        let res;
        if (e.currentTarget.value === '') {
            res = NaN;
        }
        else {
            res = Number(e.currentTarget.value);
        }
        props.onChangeVal(res);
    }, [props.onChangeVal]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(Input, { type: props.type, onChange: onValueChange })));
};
exports.NumberInputBox = NumberInputBox;
const ToggleInputFormat = props => {
    const { ids, names } = props;
    // onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("p", null, names.map((item, i) => (react_1.default.createElement("label", { key: i },
            react_1.default.createElement("input", { type: "radio", name: ids[i], value: item, checked: props.selectedId == ids[i], onChange: props.onChange }),
            item))))));
};
exports.ToggleInputFormat = ToggleInputFormat;
//# sourceMappingURL=input.js.map