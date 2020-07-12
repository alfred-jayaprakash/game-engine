import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import AdminGamePanel from './AdminGamePanel';
jest.mock ('../utils/GameEngine');
import GameEngine from '../utils/GameEngine';
import {
  GAME_START,
  GAME_PROGRESS,
  GAME_END,
  GAME_STOP,
} from '../utils/GlobalConfig';

let container;
const validRoom = 123456;
const server_url = 'http://localhost:3000/';
let onError;
describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
  });

  test ('should render correctly without issues', () => {
    onError = error => {};
    const component = shallow (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />
    );

    expect (component).toMatchSnapshot ();
  });
});

let roomNotifyCallback;
let gameStatusCallback;

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    GameEngine.join.mockImplementation ((user, room, callback) => {
      if (room === validRoom) {
        return callback (undefined, [{username: 'AJ', active: true}]);
      } else {
        return callback ('Error joining game', undefined);
      }
    });

    GameEngine.registerForRoomNotifications.mockImplementation (
      callback => (roomNotifyCallback = callback)
    );

    GameEngine.registerForGameStatus.mockImplementation (
      callback => (gameStatusCallback = callback)
    );

    GameEngine.sendGameStatus.mockImplementation (({room, status}, callback) =>
      callback ('Success')
    );

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

  test ('initial screen should load correctly', () => {
    render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );
    //Make sure Game join is called
    expect (GameEngine.join).toHaveBeenCalled ();

    //Make sure Join Game ID button to be present
    expect (
      screen.queryByText ('Join Game ID: ' + validRoom)
    ).toBeInTheDocument ();
    expect (
      screen.getByText ('Waiting for other players to join ...')
    ).toBeInTheDocument ();
    expect (screen.getByText ('Start Game')).toBeInTheDocument ();
    expect (screen.queryByText ('Stop Game')).not.toBeInTheDocument ();
  });

  test ('Room notifications should be processed correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      roomNotifyCallback ({
        users: [
          {username: 'One', active: true},
          {username: 'Two', active: true},
        ],
      });
    });

    // Users should be displayed
    expect (screen.getByText ('One')).toBeInTheDocument ();
    expect (screen.getByText ('Two')).toBeInTheDocument ();

    //Now send another mock status update from server
    act (() => {
      roomNotifyCallback ({
        users: [
          {username: 'One', active: true},
          {username: 'Three', active: true},
          {username: 'Four', active: true},
        ],
      });
    });

    // Users should be displayed
    expect (screen.getByText ('One')).toBeInTheDocument ();
    expect (screen.getByText ('Three')).toBeInTheDocument ();
    expect (screen.getByText ('Four')).toBeInTheDocument ();
    expect (screen.queryByText ('Two')).not.toBeInTheDocument ();
  });

  test ('Active user going inactive should be displayed correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      roomNotifyCallback ({
        users: [
          {username: 'One', active: true},
          {username: 'Two', active: true},
        ],
      });
    });

    // Inspect first user element
    let userElement = screen.getByText ('One');
    expect (userElement).toBeInTheDocument ();
    expect (userElement).toHaveClass ('text-primary');

    //Let's inspect 2nd element
    userElement = screen.getByText ('Two');
    expect (userElement).toBeInTheDocument ();
    expect (userElement).toHaveClass ('text-primary');

    //Now send another mock status update from server
    act (() => {
      roomNotifyCallback ({
        users: [
          {username: 'One', active: true},
          {username: 'Two', active: false},
        ],
      });
    });

    // Inspect first user element
    userElement = screen.getByText ('One');
    expect (userElement).toBeInTheDocument ();
    expect (userElement).toHaveClass ('text-primary');

    //Let's inspect 2nd element
    userElement = screen.getByText ('Two');
    expect (userElement).toBeInTheDocument ();
    expect (userElement).toHaveClass ('text-danger');
  });

  test ('Game start should work correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      roomNotifyCallback ({
        users: [
          {username: 'One', active: true},
          {username: 'Two', active: true},
        ],
      });
    });

    let startGameButton = screen.getByText ('Start Game');
    fireEvent.click (startGameButton);

    expect (GameEngine.sendGameStatus).toHaveBeenCalled ();
  });

  test ('Game start status should be handled correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      gameStatusCallback ({
        status: GAME_START,
        scores: [
          {user: 'Ali', score: 0},
          {user: 'Bob', score: 0},
          {user: 'Carl', score: 0},
        ],
      });
    });

    expect (screen.getByText ('Game started')).toBeInTheDocument ();
    expect (screen.getByText ('Ali')).toBeInTheDocument ();
    expect (screen.getByText ('Bob')).toBeInTheDocument ();
    expect (screen.getByText ('Carl')).toBeInTheDocument ();
    expect (screen.getByText ('Stop Game')).toBeInTheDocument ();
    expect (screen.queryByText ('Start Game')).not.toBeInTheDocument ();
  });

  test ('Game progress status should be handled correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      gameStatusCallback ({
        status: GAME_PROGRESS,
        scores: [{user: 'Ali', score: 100}, {user: 'Bob', score: 200}],
      });
    });

    expect (screen.getByText ('Game in progress')).toBeInTheDocument ();
    expect (screen.getByText ('Stop Game')).toBeInTheDocument ();
    expect (screen.getByText ('Ali')).toBeInTheDocument ();
    expect (screen.getByText ('100')).toBeInTheDocument ();
    expect (screen.getByText ('Bob')).toBeInTheDocument ();
    expect (screen.getByText ('200')).toBeInTheDocument ();

    //Now send another status update from server
    act (() => {
      gameStatusCallback ({
        status: GAME_PROGRESS,
        scores: [{user: 'Ali', score: 300}, {user: 'Bob', score: 600}],
      });
    });

    expect (screen.getByText ('Ali')).toBeInTheDocument ();
    expect (screen.queryByText ('100')).not.toBeInTheDocument ();
    expect (screen.getByText ('300')).toBeInTheDocument ();
    expect (screen.getByText ('Bob')).toBeInTheDocument ();
    expect (screen.queryByText ('200')).not.toBeInTheDocument ();
    expect (screen.getByText ('600')).toBeInTheDocument ();
  });

  test ('Game stop should be handled correctly', () => {
    const {rerender, getByPlaceholderText} = render (
      <AdminGamePanel room={validRoom} error={onError} server={server_url} />,
      container
    );

    //Now send a mock status update from server
    act (() => {
      gameStatusCallback ({
        status: GAME_PROGRESS,
        scores: [
          {user: 'John', score: 1000},
          {user: 'Jill', score: 1100},
          {user: 'Jake', score: 1200},
        ],
      });
    });

    let stopGameButton = screen.getByText ('Stop Game');
    fireEvent.click (stopGameButton);

    expect (GameEngine.sendGameStatus).toHaveBeenCalled ();
    expect (
      GameEngine.sendGameStatus.mock.calls[
        GameEngine.sendGameStatus.mock.calls.length - 1
      ][0]
    ).toEqual ({
      room: validRoom,
      status: GAME_STOP,
    });

    //Now send a mock status update from server
    act (() => {
      gameStatusCallback ({
        status: GAME_STOP,
        scores: [
          {user: 'John', score: 1000},
          {user: 'Jill', score: 1100},
          {user: 'Jake', score: 1200},
        ],
      });
    });

    expect (screen.getByText ('Game ended')).toBeInTheDocument ();
    expect (screen.getByText ('John')).toBeInTheDocument ();
    expect (screen.getByText ('1000')).toBeInTheDocument ();
    expect (screen.getByText ('Jill')).toBeInTheDocument ();
    expect (screen.getByText ('1100')).toBeInTheDocument ();
    expect (screen.getByText ('Jake')).toBeInTheDocument ();
    expect (screen.getByText ('1200')).toBeInTheDocument ();
  });
});
