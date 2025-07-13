import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Paper } from "@mui/material";
import { Settings } from "@mui/icons-material";
import ButtonComponent from "../../../shared/components/Button";

function MainMenu() {
    const navigate = useNavigate();

    const handleQuizClick = () => {
        navigate('/listening-quiz');
    };

    const handleReviewClick = () => {
        navigate('/review');
    };

    const handleRankingClick = () => {
        navigate('/ranking');
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    return (
        <Box
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                overflowY: 'auto',
                backgroundColor: 'pastel.main'
            }}
        >
        <Container maxWidth="md">
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
                    elevation={10}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 600
                    }}
                >

                <Box sx={{ 
                    maxWidth: 600, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5
                }}>
                    <ButtonComponent 
                        variant="contained" 
                        label="TOEICリスニングクイズを始める" 
                        onClick={handleQuizClick} 
                        color="primary" 
                        size="large"
                        sx={{ 
                            width: '100%', 
                            py: 2, 
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    />
                    
                    <ButtonComponent 
                        variant="outlined" 
                        label="復習する" 
                        onClick={handleReviewClick} 
                        color="primary" 
                        size="large"
                        sx={{ width: '100%', py: 1.5 }}
                    />
                    
                    <ButtonComponent 
                        variant="outlined" 
                        label="ランキング" 
                        onClick={handleRankingClick} 
                        color="primary" 
                        size="large"
                        sx={{ width: '100%', py: 1.5 }}
                    />

                    <ButtonComponent 
                        variant="text" 
                        label="設定" 
                        onClick={handleSettingsClick} 
                        color="primary" 
                        size="medium"
                        sx={{ width: '100%', py: 1 }}
                        startIcon={<Settings />}
                    />
                </Box>
                </Paper>
            </Box>
        </Container>
        </Box>
    );
}

export default MainMenu;