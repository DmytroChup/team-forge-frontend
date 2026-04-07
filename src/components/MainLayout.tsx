import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * A layout component that provides a consistent structure for protected pages.
 * It includes a navigation bar and a content area for nested routes.
 */
export const MainLayout = () => {
    return (
        <div>
            <Navbar />
            <main>
                {/* Child routes will be rendered here */}
                <Outlet />
            </main>
        </div>
    );
};
