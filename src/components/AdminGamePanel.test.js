import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import AdminGamePanel from './AdminGamePanel';
import GameEngine from '../utils/GameEngine';

let container;
const room = '123456';
const server_url = 'http://localhost:3000/';
let onError;
describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
    GameEngine.connect ();
  });

  it ('should render correctly without issues', () => {
    onError = error => {};
    const component = shallow (
      <AdminGamePanel room={123456} error={onError} server={server_url} />
    );

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    GameEngine.connect ();
    onError = jest.fn ();
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
  });

  it ('initial screen should load correctly', () => {
    render (
      <AdminGamePanel room={123456} error={onError} server={server_url} />,
      container
    );

    //Make sure Submit button to be present
    expect (screen.queryByText ('Join Game ID: ' + room)).toBeInTheDocument ();
  });
});
