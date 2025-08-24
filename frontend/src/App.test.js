import { render, screen } from '@testing-library/react';
import App from './App';

test('renders health monitoring app', () => {
  render(<App />);
  // The app should render without crashing
  expect(document.querySelector('.App')).toBeInTheDocument();
});