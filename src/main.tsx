import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core';
import App from './App.tsx'

import '@mantine/core/styles.css';
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </BrowserRouter>
        </MantineProvider>
    </StrictMode>,
)