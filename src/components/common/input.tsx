import React, { useCallback } from 'react';
import { styled } from '../style/FoundationStyles';

interface INumberInputBox {
  type: 'text';
  onChangeVal: (value: number) => void;
}

const Input = styled.input`
  width: 50px;
`;

export const NumberInputBox: React.FC<INumberInputBox> = props => {
  const onValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let res: number;
      if (e.currentTarget.value === '') {
        res = NaN;
      } else {
        res = Number(e.currentTarget.value);
      }
      props.onChangeVal(res);
    },
    [props.onChangeVal],
  );

  return (
    <>
      <Input type={props.type} onChange={onValueChange} />
    </>
  );
};

// radioButton
// ===========================================================================
interface IRadioButton {
  ids: Array<string>;
  names: Array<string>;
  label: string;
  selectedId: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ToggleInputFormat: React.FC<IRadioButton> = props => {
  const { ids, names } = props;
  // onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  return (
    <>
      <p>
        {names.map((item, i) => (
          <label key={i}>
            <input
              type="radio"
              name={ids[i]}
              value={item}
              checked={props.selectedId == ids[i]}
              onChange={props.onChange}
            />
            {item}
          </label>
        ))}
      </p>
    </>
  );
};
