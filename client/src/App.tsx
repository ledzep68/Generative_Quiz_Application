//25/5/18 ReactをimportしないとChromeでエラー発生
import React, { useState } from 'react';
import { Container, Typography, Button, Stack, Paper } from '@mui/material';

const question = {
  text: 'Reactの開発元はどこ？',
  choices: ['Google', 'Facebook', 'Microsoft', 'Apple'],
  correctIndex: 1,
};

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleChoice = (index: number) => {
    setSelected(index);
    setResult(index === question.correctIndex ? '正解！' : '不正解...');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {question.text}
        </Typography>

        <Stack spacing={2}>
          {question.choices.map((choice, index) => (
            <Button
              key={index}
              variant="contained"
              color={selected === index ? 'secondary' : 'primary'}
              onClick={() => handleChoice(index)}
              disabled={selected !== null}
              fullWidth
            >
              {choice}
            </Button>
          ))}
        </Stack>

        {result && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {result}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
