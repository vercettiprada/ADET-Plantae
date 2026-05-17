import { render, screen } from '@testing-library/react';
import App from './App';

test('renders plantae auth screen', () => {
  render(<App />);
  expect(screen.getByText(/sign in to your sanctuary/i)).toBeInTheDocument();
});
