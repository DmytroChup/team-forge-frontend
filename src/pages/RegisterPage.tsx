import { Container } from '@mantine/core';
import { RegisterForm } from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
    const navigate = useNavigate();

    return (
        <Container size="md" py="xl">
            <RegisterForm onSuccess={(player) => {
                navigate(`/profile/${player.id}`);
            }} />
        </Container>
    );
}