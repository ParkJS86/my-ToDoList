import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/providers/queryClient';
import { AppRouter } from './app/router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
