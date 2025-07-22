//=============================================================================
//問題回答ボタンコンポーネント
//=============================================================================

import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface AnswerButtonsProps {
    //options: Array<"A" | "B" | "C" | "D">; // シンプルな選択肢配列
    selectedAnswer: string;
    onAnswerChange: (answer: string) => void;
}

const AnswerButtonComponent: React.FC<AnswerButtonsProps> = ({
    //options,
    selectedAnswer,
    onAnswerChange
}) => {
    const fixedOptions: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                回答を選択してください
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {fixedOptions.map((option) => (
                    <Button
                        key={option}
                        variant={selectedAnswer === option ? 'contained' : 'outlined'}
                        color={selectedAnswer === option ? 'primary' : 'inherit'}
                        onClick={() => onAnswerChange(option)}
                        sx={{
                            py: 1.5,
                            textTransform: 'none'
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