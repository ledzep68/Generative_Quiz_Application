//=============================================================================
//問題回答ボタンコンポーネント
//=============================================================================

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface AnswerButtonsProps {
    onAnswerChange: (answer: "A" | "B" | "C" | "D") => void;
    sx: {}
    selectedValue?: "A" | "B" | "C" | "D" | null; //外部から渡される現在の選択値
    selectedSubQuestionIndex?: string
}

const AnswerButtonComponent: React.FC<AnswerButtonsProps> = ({
    onAnswerChange,
    sx,
    selectedValue = null, 
    selectedSubQuestionIndex = "0"
}) => {
    const fixedOptions: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

    const handleClick = (option: "A" | "B" | "C" | "D") => {
        onAnswerChange(option);
    };

    return (
        <Box>
            <Typography variant="body1" gutterBottom>
                {selectedSubQuestionIndex !== undefined && (
                    <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                        (小問 {parseInt(selectedSubQuestionIndex, 10) + 1})
                    </Typography>
                )}
            </Typography>
            <Box sx={sx}>
                {fixedOptions.map((option) => (
                    <Button
                        key={option}
                        variant={selectedValue === option ? 'contained' : 'outlined'}
                        color={selectedValue === option ? 'primary' : 'inherit'}
                        onClick={() => handleClick(option)}
                        sx={{
                            py: 1.5,
                            textTransform: 'none',
                            
                            ...(selectedValue === option && {
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                color: 'white',
                                fontWeight: 700,
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                                }
                            })
                        }}
                        fullWidth
                    >
                        {option}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default AnswerButtonComponent;