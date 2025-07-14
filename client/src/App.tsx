import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import RegisterForm from './features/user-management/register/components/RegisterForm';
import LoginForm from './features/user-management/login/components/LoginForm';
import MainMenu from './features/main-menu/components/MainMenu';
import LQuiz from './features/listening-quiz-management/transaaction/components/LQuiz';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/listening-quiz" element={<div><LQuiz /></div>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;