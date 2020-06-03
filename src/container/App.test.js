import React from 'react';
import {render, getByText} from '@testing-library/react';
import App from './App';

test ('Join Screen is rendered by default', () => {
  const {getByLabelText} = render (<App />);
  const gameRoomLabel = getByLabelText (/Enter Game Room/i);
  expect (gameRoomLabel).toBeInTheDocument ();
});
