import { Routes, Route } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DotaProfilePage } from './pages/DotaProfilePage.tsx';
import { PlayerSearch } from "./components/PlayerSearch";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from './pages/HomePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<MainLayout />}>
                <Route path="/profile/:nickname" element={<DotaProfilePage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/search" element={<PlayerSearch />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
