//=============================================================================
//問題回答ボタンコンポーネント
//=============================================================================

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface AnswerButtonsProps {
    onAnswerChange: (answer: "A" | "B" | "C" | "D") => void;
    sx: {}
    initialAnswer?: "A" | "B" | "C" | "D" | null; // 初期値（オプション）
}

const AnswerButtonComponent: React.FC<AnswerButtonsProps> = ({
    onAnswerChange,
    sx,
    initialAnswer = null
}) => {
    //コンポーネント内でselectedAnswerをローカル管理
    const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(initialAnswer);
    const fixedOptions: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

    const handleClick = (option: "A" | "B" | "C" | "D") => {
        setSelectedAnswer(option); //内部stateを更新
        onAnswerChange(option);    //親に通知
    };

    return (
        <Box>
            <Typography variant="body1" gutterBottom>
                回答を選択してください
            </Typography>
            <Box sx={sx}>
                {fixedOptions.map((option) => (
                    <Button
                        key={option}
                        variant={selectedAnswer === option ? 'contained' : 'outlined'}
                        color={selectedAnswer === option ? 'primary' : 'inherit'}
                        onClick={() => handleClick(option)}
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