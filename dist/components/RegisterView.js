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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const UserActions_1 = require("../actions/UserActions");
const DataActions_1 = require("../actions/DataActions");
const react_datasheet_1 = __importDefault(require("react-datasheet"));
const react_csv_reader_1 = __importDefault(require("react-csv-reader"));
const DataGridStyle_1 = require("./style/DataGridStyle");
require("react-datasheet/lib/react-datasheet.css");
const styled_components_1 = __importDefault(require("styled-components"));
const FoundationStyles_1 = require("./style/FoundationStyles");
const UserReducers_1 = require("../reducers/UserReducers");
const input_1 = require("./common/input");
const shortid_1 = __importDefault(require("shortid"));
// CSS
// ===========================================================================
const registerViewStyleParams = {
    inputContainerHeight: 120,
};
const InputContainer = styled_components_1.default.div `
  box-sizing: border-box;
  padding: 20px;
  height: ${registerViewStyleParams.inputContainerHeight}px;
  width: 100%;
  position: absolute;
`;
const GridContainer = styled_components_1.default.div `
  box-sizing: border-box;
  padding-top: ${registerViewStyleParams.inputContainerHeight}px;
  width: 100%;
  height: 90%;
`;
const GridBox = styled_components_1.default.div `
  box-sizing: border-box;
  margin: 0px 20px 0px 20px;
  width: 80%;
  height: 90%;
  border: 1px solid ${(p) => p.theme.PRIMARY_4};
  overflow-y: scroll;
`;
const RegisterButtonContainer = styled_components_1.default.div `
  box-sizing: border-box;
  padding-left: 20px;
  width: 100%;
  height: 10%;
`;
class MyReactDataSheet extends react_datasheet_1.default {
} // ただ同じ型なだけ
// You can also strongly type all the Components or SFCs that you pass into ReactDataSheet.
// 以下開発中
// 不適切な入力を警告する機能
const cellRenderer = (props) => {
    const isReadOnly = props.cell.readOnly;
    const backgroundStyle = (isNaN(parseFloat(props.cell.value)) || props.cell.value < 0) && !isReadOnly
        ? { color: 'red' }
        : undefined;
    const className = ` cell${props.selected ? ' selected' : ''}${isReadOnly ? ' value-viewer' : ''}${props.col === 0 ? ' rowHeader' : ''}${props.row === 0 ? ' header' : ''} `;
    return (react_1.default.createElement("td", { style: backgroundStyle, onMouseDown: props.onMouseDown, onMouseOver: props.onMouseOver, onDoubleClick: props.onDoubleClick, onContextMenu: props.onContextMenu, className: className }, props.children));
};
const Grid = props => {
    const { loadedData, loadingBy } = (0, react_redux_1.useSelector)(a => a.user);
    const dispatch = (0, react_redux_1.useDispatch)();
    const valueRenderer = (cell) => cell.value;
    const grid = loadedData;
    const maxLengthOfData = UserReducers_1.initUser.loadedData.length;
    const isLargeData = grid.length > maxLengthOfData;
    const changeCells = (0, react_1.useCallback)((changes) => {
        changes.forEach(({ cell, row, col, value }) => {
            grid[row][col] = { ...grid[row][col], value };
        });
        const lastElemAge = grid.slice(-1)[0][1].value;
        // Error at when last element (:301) is Number type ....
        if (!isNaN(parseFloat(lastElemAge)) && !isLargeData) {
            console.log('Error: too large data size for data grid');
            dispatch((0, UserActions_1.sendFailedMessageAction)({
                id: 'error-data-size',
                msg: 'Error: The data size must be smaller than 300 if you use data grid; use CSV instead',
                status: 'error',
            }));
        }
        else {
            dispatch((0, UserActions_1.deleteFailedMessageAction)('error-data-size'));
        }
        dispatch((0, UserActions_1.updateLoadedDataAction)(grid));
        dispatch((0, UserActions_1.deleteFailedMessageAction)('error-no-data'));
    }, [grid]);
    const onClickUnsetButton = (0, react_1.useCallback)(() => {
        dispatch((0, UserActions_1.updateLoadedDataAction)(UserReducers_1.initUser.loadedData));
        dispatch((0, UserActions_1.loadingByAction)('grid'));
    }, []);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("p", null, loadingBy === 'csv' ? (react_1.default.createElement(FoundationStyles_1.ButtonFormat, { onClick: onClickUnsetButton }, "unset data")) : ('')),
        react_1.default.createElement("p", null, isLargeData ? `Omit the 300th line and after.` : ``),
        react_1.default.createElement("div", { style: { pointerEvents: isLargeData ? 'none' : 'unset' } },
            react_1.default.createElement(MyReactDataSheet, { data: !isLargeData ? grid : grid.filter((d, i) => i < maxLengthOfData), valueRenderer: valueRenderer, onContextMenu: (e, cell, i, j) => cell.readOnly ? e.preventDefault() : null, 
                // parsePaste={onPasteData}
                onCellsChanged: changeCells, cellRenderer: cellRenderer }))));
};
// SampleNameBox
// ===========================================================================
const SampleNameBox = () => {
    const { sampleName } = (0, react_redux_1.useSelector)(a => a.user);
    const dispatch = (0, react_redux_1.useDispatch)();
    const onChangeSampleName = (0, react_1.useCallback)((e) => {
        dispatch((0, UserActions_1.changeSampleNameAction)(e.target.value));
    }, []);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("p", null,
            "Sample Name:",
            ' ',
            react_1.default.createElement(FoundationStyles_1.InputFormat, { onChange: onChangeSampleName, type: "text", value: sampleName }))));
};
// RegisterView
// ===========================================================================
const RegisterView = () => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const inputRef = (0, react_1.useRef)(null);
    const { loadedData, nowSelectDataLoadingMethod, failedMessage, sampleName, nowComputation, } = (0, react_redux_1.useSelector)(a => a.user);
    const onToggleDataGrid = (0, react_1.useCallback)((e) => {
        dispatch((0, UserActions_1.selectTableOrCsvAction)(e.target.name));
    }, [nowSelectDataLoadingMethod]);
    const validation = (param) => {
        let nError = 0;
        if (param.sampleName === '') {
            nError += 1;
            dispatch((0, UserActions_1.sendFailedMessageAction)({
                id: 'error-no-sample-name',
                msg: 'Error: fill sample name.',
                status: 'error',
            }));
        }
        else {
            dispatch((0, UserActions_1.deleteFailedMessageAction)('error-no-sample-name'));
        }
        if (param.ageData.length === 0) {
            nError += 1;
            dispatch((0, UserActions_1.sendFailedMessageAction)({
                id: 'error-no-data',
                msg: 'error: fill data filed.',
                status: 'error',
            }));
        }
        else {
            dispatch((0, UserActions_1.deleteFailedMessageAction)('error-no-data'));
        }
        dispatch((0, UserActions_1.deleteFailedMessageAction)('error-data-size'));
        if (nError > 0) {
            return 'failed';
        }
        else {
            return 'ok';
        }
    };
    const onClickRegisterAction = (0, react_1.useCallback)(async () => {
        if (nowComputation) {
            alert('stop computation to continue');
        }
        else {
            const age = loadedData
                .map(d => ({
                age: typeof d[1].value === 'number'
                    ? d[1].value
                    : parseFloat(d[1].value),
                sd: typeof d[2].value === 'number'
                    ? d[2].value
                    : parseFloat(d[2].value),
            }))
                .filter((d) => {
                return !isNaN(d.age);
            });
            const validationRes = validation({
                sampleName: sampleName,
                ageData: age,
            });
            if (validationRes === 'ok') {
                const newSampleId = (0, shortid_1.default)();
                dispatch((0, UserActions_1.updateLoadedDataAction)(UserReducers_1.initUser.loadedData));
                dispatch((0, UserActions_1.loadingByAction)('grid'));
                (0, DataActions_1.addAgeDataToDB)(dispatch, {
                    sampleId: newSampleId,
                    data: age,
                });
                (0, DataActions_1.addSampleStatusToJSON)(dispatch, {
                    sampleId: newSampleId,
                    done: 0,
                    sampleName: sampleName,
                });
            }
            else {
                alert('Resolve all errors');
            }
        }
    }, [sampleName, loadedData, nowComputation]);
    const onFileLoaded = (data, fileInfo) => {
        const ageData = data.map((d, i) => {
            return [
                { readOnly: true, value: i + 1 },
                { readOnly: false, value: d[0] === undefined ? '' : d[0] },
                { readOnly: false, value: d[1] === undefined ? '' : d[1] },
            ];
        });
        dispatch((0, UserActions_1.deleteFailedMessageAction)('error-no-data'));
        dispatch((0, UserActions_1.deleteFailedMessageAction)('error-data-size'));
        dispatch((0, UserActions_1.loadingByAction)('csv'));
        dispatch((0, UserActions_1.updateLoadedDataAction)(ageData));
        dispatch((0, UserActions_1.selectTableOrCsvAction)('dataGrid'));
    };
    // const header = [
    //   [
    //     { value: '', readOnly: true },
    //     { value: 'age', readOnly: true },
    //     { value: '2sd', readOnly: true },
    //   ],
    // ];
    // const elem = loadedData;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(InputContainer, null,
            react_1.default.createElement(SampleNameBox, null),
            react_1.default.createElement("div", null,
                "Input format:",
                react_1.default.createElement(input_1.ToggleInputFormat, { names: ['Data Grid', 'CSV'], ids: ['dataGrid', 'csv'], onChange: onToggleDataGrid, label: 'Input Format:', selectedId: nowSelectDataLoadingMethod }))),
        react_1.default.createElement(GridContainer, null,
            react_1.default.createElement(GridBox, null,
                nowSelectDataLoadingMethod === 'csv' && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", { style: { padding: '20px' } },
                        react_1.default.createElement("div", { style: { textAlign: 'center' } },
                            react_1.default.createElement("p", null, " U-Pb age input format ")),
                        react_1.default.createElement("br", null),
                        react_1.default.createElement("li", null, " Input format: CSV "),
                        react_1.default.createElement("li", null, " Row 1: Age "),
                        react_1.default.createElement("li", null, " Row 2: Measurement error (2sigma) "),
                        react_1.default.createElement("li", null, " Column name: Row 1:age; Row 2: 2sd"),
                        react_1.default.createElement("br", null),
                        react_1.default.createElement(react_csv_reader_1.default, { onFileLoaded: onFileLoaded })))),
                nowSelectDataLoadingMethod === 'dataGrid' && (react_1.default.createElement("div", { className: 'container' },
                    react_1.default.createElement("div", { className: 'sheet-container' },
                        react_1.default.createElement(DataGridStyle_1.DataGridStyle, null),
                        react_1.default.createElement(Grid, null)))))),
        react_1.default.createElement(RegisterButtonContainer, null,
            react_1.default.createElement(FoundationStyles_1.ButtonFormat, { onClick: onClickRegisterAction }, "register"))));
};
exports.default = RegisterView; // 他のファイルから参照できるようにする。
//# sourceMappingURL=RegisterView.js.map