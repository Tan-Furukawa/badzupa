import { createGlobalStyle } from 'styled-components';
import { styled } from './FoundationStyles';

export const DataGridStyle = createGlobalStyle`
  .data-grid {
    margin-left: auto;
    margin-right: auto;
  }
  .equation.cell {
    position: relative;
  }
  .error.cell {
    background: rgba(255,0,0,0.14);
    font-size: 0.8em;
    color: red;
  }
  .error.cell > div.text {
    text-align: center;
  }
  .equation.cell:before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    left: 0;
    top: 0;
    border-style: solid;
    border-width: 6px 6px 0 0;
    border-color: #2185d0 transparent transparent transparent;
    z-index: 2;
  }
  .row-handle.cell {
    width: 1rem;
  }
  
  tbody .row-handle.cell, thead .cell:not(.row-handle) {
    cursor: move;
  }
  
  .data-grid-container table.data-grid tr {
   background: white;
  }
  .data-grid-container table.data-grid .drop-target,  .data-grid-container table.data-grid thead .cell.read-only.drop-target {
    background: #6F86FC;
    transition: none;
    color: white;
  }
  .data-grid-container table.data-grid thead .cell.read-only {
    transition: none;
  }
  .cell {
    text-align: center;
    width: 100px;
  }
  .header {
    pointer-events: none;
  }
  .header > span{
    color: #fff;
    background-color: #ccc;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .rowHeader {
    width: 50px;
    pointer-events: none;
  }
  .rowHeader > span{
    color: #fff;
    background-color: #ccc;
    width: 100%;
    height: 100%;
  }
  .container {
    padding-top: 20px;
    padding-bottom: 20px;
  }
`;
