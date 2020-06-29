import React from 'react';
import {render, fireEvent, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import AdminScreen from './AdminScreen';

let postFnMock = null;
let container = null;
let postPromise = null;

describe ('Snapshot tests', () => {
  it ('should render correctly without issues', () => {
    const component = shallow (<AdminScreen />);

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    // tell jest not to mock gameroom
    jest.unmock ('axios');

    // require the actual module so that we can mock exports on the module
    const axios = require.requireActual ('axios');
    let mockResponse = {
      data: {
        id: 121212,
      },
    };
    postPromise = new Promise ((resolve, reject) => resolve (mockResponse));
    postFnMock = jest.fn ((url, options) => postPromise);
    axios.post = postFnMock;
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
    postFnMock.mockClear ();
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
  });

  it ('initial screen should load correctly', () => {
    render (<AdminScreen />);
    //Make sure Pictopia options are shown
    expect (
      screen.getByLabelText ('Choose picture category:')
    ).toBeInTheDocument ();
    expect (screen.getByLabelText ('Number of pictures:')).toBeInTheDocument ();
    expect (
      screen.getByLabelText ('Time for each picture:')
    ).toBeInTheDocument ();
    expect (screen.getByText ('Create Room')).toBeInTheDocument ();
    //Make sure AdminGamePanel is not showing
    expect (screen.queryByText ('Start Game')).not.toBeInTheDocument ();
  });

  it ('should create room without changing options', async () => {
    //ACT
    render (<AdminScreen />);
    fireEvent.click (screen.getByText ('Create Room'));
    await act (() => postPromise); //Wait until AXIOS POST promise is resolved

    //ASSERT
    expect (postFnMock).toHaveBeenCalled (); //Submit to server should have happened once
    //Check the data that is passed to the server
    expect (postFnMock.mock.calls[0][1]).toEqual ({
      room: 'New Room',
      config: {
        time: '30',
        questions: '5',
        category: 'office',
      },
    });
    //Make sure AdminGamePanel is showing
    expect (screen.getByText ('Start Game')).toBeInTheDocument ();
  });

  it ('should create room by changing game options', async () => {
    //ACT
    render (<AdminScreen />);
    userEvent.selectOptions (
      screen.getByLabelText ('Choose picture category:'),
      ['gn-modern']
    );
    userEvent.selectOptions (screen.getByLabelText ('Number of pictures:'), [
      '3',
    ]);
    userEvent.selectOptions (screen.getByLabelText ('Time for each picture:'), [
      '60',
    ]);
    fireEvent.click (screen.getByText ('Create Room'));
    await act (() => postPromise); //Wait until AXIOS POST promise is resolved

    //ASSERT
    expect (postFnMock).toHaveBeenCalled (); //Submit to server should have happened once
    //Check the data that is passed to the server
    expect (postFnMock.mock.calls[0][1]).toEqual ({
      room: 'New Room',
      config: {
        time: '60',
        questions: '3',
        category: 'gn-modern',
      },
    });
    //Make sure AdminGamePanel is showing
    expect (screen.getByText ('Start Game')).toBeInTheDocument ();
  });
});
