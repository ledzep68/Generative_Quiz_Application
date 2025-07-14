//=============================================================================
//汎用ボタン
//=============================================================================
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, ButtonProps } from '@mui/material';
import { useState, ReactNode } from 'react';

//ボタンの外見、押下時動作の定義
interface ButtonComponentProps extends ButtonProps  {
    variant: 'text' | 'outlined' | 'contained';
    label: string;
    onClick: () => void;
    color: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    size: 'small' | 'medium' | 'large';
    disabled?: boolean;
    startIcon?: ReactNode;
};

export function DropdownDomponent() {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const options = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' },
    { value: 'option4', label: 'オプション4' },
  ];

  return (
    <Box sx={{ minWidth: 120, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        基本的なプルダウン
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel id="basic-dropdown-label">選択してください</InputLabel>
        <Select
          labelId="basic-dropdown-label"
          id="basic-dropdown"
          value={selectedValue}
          label="選択してください"
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedValue && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          選択された値: {selectedValue}
        </Typography>
      )}
    </Box>
  );
}

export default DropdownDomponent
