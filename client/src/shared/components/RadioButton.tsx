//=============================================================================
//汎用ボタン
//=============================================================================
import { Button, ButtonProps, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { ReactNode } from 'react';

// ラジオボタンの選択肢の型定義
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// コンポーネントのプロパティ定義
interface RadioButtonComponentProps {
  groupLabel: string;                                   //ラジオボタングループのラベル
  name: string;                                         //フォームフィールド名
  value: string;                                        //現在選択されている値
  options: RadioOption[];                               //選択肢の配列
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;  //選択肢の変更を受け取るコールバック
  row?: boolean;                                        //横並び表示するか
  disabled?: boolean;                                   //全体を無効化するか
  required?: boolean;                                   //必須項目か
  size?: 'small' | 'medium';                           //ラジオボタンのサイズ
  color?: 'default' | 'primary' | 'secondary';         //ラジオボタンの色
}

const RadioButtonComponent = (props: RadioButtonComponentProps) => {
  const {
    groupLabel,
    name,
    value,
    options,
    onChange,
    row = false,
    disabled = false,
    required = false,
    size = 'medium',
    color = 'primary'
  } = props;

  return (
    <FormControl component="fieldset" disabled={disabled} required={required}>
      <FormLabel component="legend">{groupLabel}</FormLabel>
      <RadioGroup
        aria-label={groupLabel}
        name={name}
        value={value}
        onChange={onChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size={size} color={color} />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioButtonComponent
