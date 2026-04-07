import { Routes, Route } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlayerSearch } from "./components/PlayerSearch";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from './pages/HomePage';

function App() {
    return (
        <Routes>
            {/* Public routes accessible to everyone */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes accessible only to authenticated users */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/search" element={<PlayerSearch />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
