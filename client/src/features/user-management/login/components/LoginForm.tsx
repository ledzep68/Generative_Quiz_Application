import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography } from "@mui/material";
import ButtonComponent from "../../../../shared/components/Button";
import InputFormComponent from "../../../../shared/components/InputForm";

function LoginForm() {
    const [userId, setUserId] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/main-menu');
    };
    const handleRegisterClick = () => {
        navigate('/register');
    };

    
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <Paper 
                    elevation={5}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 400
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
                        ログイン
                    </Typography>
                    
                    <Box component="form" sx={{ width: '100%' }}>
                        <InputFormComponent 
                            label="ユーザー名"
                            value={userId}
                            onChange={setUserId}
                            fullWidth
                            margin="normal"
                            variant="filled"
                        />

                        <InputFormComponent 
                            label="パスワード"
                            value={password}
                            onChange={setPassword}
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="filled"
                        />
                        
                        {/* ログインボタン */}
                        <Box sx={{ mt: 4, mb: 2 }}>
                            <ButtonComponent 
                                variant="contained"
                                label="ログイン"
                                onClick={handleLoginClick}
                                color="primary"
                                size="large"
                                disabled={!userId.trim() || !password.trim()}
                                sx={{ width: '100%', py: 1.5, display: 'flex' }}
                            />
                        </Box>

                        {/* 区切り線 */}
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            align="center" 
                            sx={{ my: 2 }}
                        >
                            または
                        </Typography>

                        {/* 新規登録ボタン*/}
                        <Box sx={{ mb: 2 }}>
                            <ButtonComponent 
                                variant="outlined"
                                label="新規登録に進む"
                                onClick={handleRegisterClick}
                                color="primary"
                                size="large"
                                sx={{ width: '100%', py: 1.5, display: 'flex' }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default LoginForm