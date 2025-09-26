import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Container, Paper, Typography } from "@mui/material";
import z from "zod";

import * as loginSlice from "../login.slice";
import * as dto from "../dto";
import * as api from "../api";
import * as schema from "../schema";

import ButtonComponent from "../../../../shared/components/Button";
import InputFormComponent from "../../../../shared/components/InputForm";

function LoginForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [invitationCode, setInvitationCode] = useState<string>("");

    //API
    const [fetchLoginAndInitializeSession] = api.useFetchLoginAndInitializeSessionMutation();
    const [fetchRegisterAndInitializeSession] = api.useFetchRegisterAndInitializeSessionMutation();

    const handleLoginClick = async () => {
        //
        dispatch(loginSlice.setRequestStatus('pending'));
        try{
            //ユーザー入力バリデーション
            const loginReqDTO = schema.UserLoginValidationSchema.parse({userName: userName, password: password}) as dto.LoginReqDTO;
            setUserName(loginReqDTO.userName);
            //ログイン・セッション開始リクエスト
            await fetchLoginAndInitializeSession(loginReqDTO).unwrap(); //wnwrap 成功時のみデータ取得
            //ログイン状態をstoreに格納
            dispatch(loginSlice.login(
                {
                    userName: loginReqDTO.userName, 
                    isLoggedIn: true
                }
            ));
            
            dispatch(loginSlice.setRequestStatus('success'));

            navigate('/main-menu');
        } catch (error) {
            dispatch(loginSlice.setRequestStatus('failed'));
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map(issue => issue.message);
                alert(errorMessages.join('\n'));
            } else {
                console.error('Login error:', error);
                alert('ログインに失敗しました');
            }
        }
    };
    const handleRegisterClick = async () => {
        //ユーザー入力バリデーション
        const registerReqDTO = schema.UserRegisterValidationSchema.parse({userName: userName, password: password, invitationCode: invitationCode}) as dto.RegisterReqDTO;
        try{
            //新規登録・セッション開始リクエスト
            await fetchRegisterAndInitializeSession(registerReqDTO).unwrap(); //wnwrap 成功時のみデータ取得
            navigate('/main-menu');
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('validation error:', error.message);
                alert('ユーザー名またはパスワードまたは招待コードが不正です');
            } else {
                console.error('Login error:', error);
                alert('ユーザー登録に失敗しました');
            }
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(135deg, #afc4e9ff 0%, #81a2d7ff 100%)',
                py: 4
                }}
                >
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
                            value={userName}
                            onChange={setUserName}
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
                                disabled={
                                    !userName.trim() || !password.trim()
                                    //
                                }
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
                                disabled={true} //一時的に無効化
                                variant="outlined"
                                label="新規登録"
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
    </Box>
    );
}

export default LoginForm