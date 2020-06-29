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

describe ('Functional tests', () => {
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

  it ('non numeric room should result in error shown', () => {
    render (<JoinScreen />, container);

    userEvent.type (screen.getByPlaceholderText ('Game Room ID'), 'abcdef');
    let nextButton = screen.queryByText ('Next');
    fireEvent.click (nextButton);

    expect (
      screen.getByText ('Invalid room number', {exact: false})
    ).toBeInTheDocument ();
    expect (getFnMock).not.toHaveBeenCalled (); //Server should not be called
  });
});
