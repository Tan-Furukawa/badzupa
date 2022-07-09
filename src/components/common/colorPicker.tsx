import React, { useCallback } from 'react';
import { ColorResult, SwatchesPicker } from 'react-color';
import styled from 'styled-components';

interface IProps {
  displayColorPicker: boolean;
  color: string;
  handleClick: (displayColorPicker: boolean) => void;
  handleColorChange: (color: string) => void;
}
const Swatch = styled.div`
  padding: 5px;
  background-color: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: inline-block;
  cursor: pointer;
  vertical-align: middle;
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

const ColorRect = styled.div`
  width: 36px;
  height: 14px;
  border-radius: 2px;
`;

export const ColorPicker: React.FC<IProps> = props => {
  const handleClick = useCallback(() => {
    props.handleClick(!props.displayColorPicker);
  }, [props.displayColorPicker]);

  const handleClose = useCallback(() => {
    props.handleClick(false);
  }, []);

  const handleChange = useCallback(
    (color: ColorResult) => {
      const resColor = color.hex;
      props.handleColorChange(resColor);
    },
    [props.color],
  );

  return (
    <>
      <Swatch onClick={handleClick}>
        <ColorRect style={{ backgroundColor: props.color }} />
      </Swatch>
      {props.displayColorPicker ? (
        <Popover>
          <Cover onClick={handleClose} />
          <SwatchesPicker color={props.color} onChange={handleChange} />
        </Popover>
      ) : null}
    </>
  );
};

export default ColorPicker;
