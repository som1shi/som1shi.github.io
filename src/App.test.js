import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the desktop site at the root', () => {
  render(<App />);
  expect(screen.getByRole('main', { name: 'macOS desktop layout demo' })).toBeInTheDocument();
});
