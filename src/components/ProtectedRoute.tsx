import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * A component that protects routes from unauthenticated access.
 * If the user is authenticated, it renders the nested routes.
 * Otherwise, it redirects the user to the login page.
 */
export const ProtectedRoute = () => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
