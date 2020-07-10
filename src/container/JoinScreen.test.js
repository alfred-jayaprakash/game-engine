import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import JoinScreen from './JoinScreen';

let getFnMock;
let container;
let getPromise;
let axios;

describe ('Snapshot tests', () => {
  it ('should render correctly without issues', () => {
    const component = shallow (<JoinScreen />);

    expect (component).toMatchSnapshot ();
  });
});

describe ('Join Game functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    // tell jest not to mock gameroom
    jest.unmock ('axios');

    // require the actual module so that we can mock exports on the module
    axios = require.requireActual ('axios');
    let mockResponse = {
      data: {
        id: 121212,
      },
    };
    getPromise = Promise.resolve (mockResponse);
    getFnMock = jest.fn ((url, options) => {
      let mockResponse = {data: {}};
      if (url.indexOf ('/rooms/123456') === -1) {
        //Pretend 123456 is the only valid room
        mockResponse = {data: {error: 'Room not found'}};
      } else if (url.indexOf ('/user/Test') !== -1) {
        //Pretend test username is already taken
        mockResponse = {data: {error: 'Username already taken'}};
      }
      getPromise = Promise.resolve (mockResponse);
      return getPromise;
    });
    axios.get = getFnMock;
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
  });

  it ('initial join screen should load correctly', () => {
    render (<JoinScreen />, container);

    //Make sure Next button to be present
    expect (screen.queryByText ('Next')).toBeInTheDocument ();
  });

  it ('should show error when clicking next without providing Room ID', () => {
    render (<JoinScreen />, container);

    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    expect (screen.getByText ('Room ID cannot be empty')).toBeInTheDocument ();
    expect (getFnMock).not.toHaveBeenCalled (); //Server should not be called
  });

  it ('long room number should result in error shown', () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '1234567');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    expect (
      screen.getByText ('Invalid room number', {exact: false})
    ).toBeInTheDocument ();
    expect (getFnMock).not.toHaveBeenCalled (); //Server should not be called
  });

  it ('non 6-digit room should result in error shown', () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '1234567');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    expect (
      screen.getByText ('Invalid room number', {exact: false})
    ).toBeInTheDocument ();
    expect (getFnMock).not.toHaveBeenCalled (); //Server should not be called
  });

  it ('Invalid Room ID should display error', async () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '999999');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Invalid room number error should be present
    expect (screen.getByText ('Room not found')).toBeInTheDocument ();

    //Username fields and Enter button should not be present
    expect (
      screen.queryByPlaceholderText ('Your Name')
    ).not.toBeInTheDocument ();
    expect (screen.queryByText ('Enter')).not.toBeInTheDocument ();
  });

  it ('Valid Room ID should show Username Field and Join button', async () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '123456');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //User name field and Join button should be present
    expect (screen.getByPlaceholderText ('Your Name')).toBeInTheDocument ();
    expect (screen.queryByText ('Enter')).toBeInTheDocument ();
  });

  it ('Valid Room ID but not giving username should show error', async () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '123456');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Dont provide username
    let enterButton = screen.queryByText ('Enter');
    fireEvent.click (enterButton);
    expect (screen.getByText ('Username cannot be empty')).toBeInTheDocument ();
  });

  it ('Valid Room ID and but previously taken username should show error', async () => {
    const historyMock = {push: jest.fn ()};

    render (<JoinScreen history={historyMock} />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '123456');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Provide an username
    userEvent.type (screen.getByPlaceholderText ('Your Name'), 'Test');

    let enterButton = screen.queryByText ('Enter');
    fireEvent.click (enterButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Game screen is loaded
    expect (historyMock.push).not.toHaveBeenCalled ();
    expect (screen.getByText ('Username already taken')).toBeInTheDocument ();
  });

  it ('Valid Room ID and unique username should take to Game screen', async () => {
    const historyMock = {push: jest.fn ()};

    render (<JoinScreen history={historyMock} />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), '123456');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Provide an username
    userEvent.type (screen.getByPlaceholderText ('Your Name'), 'Jest');

    let enterButton = screen.queryByText ('Enter');
    fireEvent.click (enterButton);

    await act (() => getPromise); //Wait until AXIOS GET promise is resolved

    //Game screen is loaded
    expect (historyMock.push).toHaveBeenCalled ();
    expect (historyMock.push.mock.calls[0][0]).toEqual ({
      pathname: '/game',
      state: {
        user: 'Jest',
        room: '123456',
      },
    });
  });
});

//
//==================================================================================
//==================================================================================
//
describe ('Host Game functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    // tell jest not to mock gameroom
    jest.unmock ('axios');

    // require the actual module so that we can mock exports on the module
    axios = require.requireActual ('axios');
    let mockResponse = {
      data: {
        id: 121212,
      },
    };
    getPromise = Promise.resolve (mockResponse);
    getFnMock = jest.fn ((url, options) => getPromise);
    axios.get = getFnMock;
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
  });

  it ('Clicking the Host tab should reveal User ID and Password fields', () => {
    render (<JoinScreen />, container);

    userEvent.click (screen.queryByText ('Host'));

    expect (
      screen.getByPlaceholderText ('email@domain.com')
    ).toBeInTheDocument ();
    expect (screen.getByPlaceholderText ('Your Password')).toBeInTheDocument ();
  });

  it ('Pressing Login without both User ID or Password should result in error', () => {
    render (<JoinScreen />, container);

    userEvent.click (screen.queryByText ('Host'));

    // userEvent.type (screen.getByPlaceholderText ('email@domain.com'), '1234567');
    // userEvent.type (screen.getByPlaceholderText ('Your Password'), '1234567');
    let loginButton = screen.queryByText ('Login');
    fireEvent.click (loginButton);

    expect (
      screen.getByText ('User ID and Password cannot be empty')
    ).toBeInTheDocument ();
  });

  it ('Pressing Login without password should result in error', () => {
    render (<JoinScreen />, container);

    userEvent.click (screen.queryByText ('Host'));
    let loginButton = screen.queryByText ('Login');
    userEvent.type (
      screen.getByPlaceholderText ('email@domain.com'),
      'a@b.com'
    );
    // userEvent.type (screen.getByPlaceholderText ('Your Password'), '1234567');
    fireEvent.click (loginButton);

    expect (
      screen.getByText ('User ID and Password cannot be empty')
    ).toBeInTheDocument ();
  });

  it ('Pressing Login without User ID should result in error', () => {
    render (<JoinScreen />, container);

    userEvent.click (screen.queryByText ('Host'));
    let loginButton = screen.queryByText ('Login');
    // userEvent.type (
    //   screen.getByPlaceholderText ('email@domain.com'),
    //   'a@b.com'
    // );
    userEvent.type (screen.getByPlaceholderText ('Your Password'), '1234567');
    fireEvent.click (loginButton);

    expect (
      screen.getByText ('User ID and Password cannot be empty')
    ).toBeInTheDocument ();
  });

  it ('Invalid credentials should show invalid logon', () => {
    render (<JoinScreen />, container);

    userEvent.click (screen.queryByText ('Host'));

    userEvent.type (
      screen.getByPlaceholderText ('email@domain.com'),
      'nullpointersg@icloud.com'
    );
    userEvent.type (screen.getByPlaceholderText ('Your Password'), '1234567');
    let loginButton = screen.queryByText ('Login');
    fireEvent.click (loginButton);

    expect (screen.getByText ('Invalid logon')).toBeInTheDocument ();
  });

  it ('Valid credentials should show home screen', () => {
    const historyMock = {push: jest.fn ()};

    render (<JoinScreen history={historyMock} />, container);

    userEvent.click (screen.queryByText ('Host'));

    userEvent.type (
      screen.getByPlaceholderText ('email@domain.com'),
      'phantomsg@icloud.com'
    );
    userEvent.type (screen.getByPlaceholderText ('Your Password'), 'gameninja');
    let loginButton = screen.queryByText ('Login');
    fireEvent.click (loginButton);

    expect (historyMock.push).toHaveBeenCalled ();
    expect (historyMock.push.mock.calls[0][0]).toBe ('/admin');
  });
});
