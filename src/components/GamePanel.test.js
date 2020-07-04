import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import GamePanel from './GamePanel';
import GameEngine from '../utils/GameEngine';

let onAnswer;
let container;
const imageUrl = './1.jpg';
describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
    GameEngine.connect ();
  });

  test ('should render correctly without issues', () => {
    onAnswer = () => {};
    const component = shallow (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />
    );

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    GameEngine.connect ();
    onAnswer = jest.fn ();
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
    onAnswer.mockClear ();
  });

  test ('initial screen should load correctly', () => {
    render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    //Make sure Submit button to be present
    expect (screen.queryByText ('Submit')).toBeInTheDocument ();
  });

  test ('Empty guess should not work', () => {
    render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    //Make sure Submit button to be present
    act (() => {
      let guessInput = screen.queryByPlaceholderText ('Type your word');
      let submitButton = screen.queryByText ('Submit');
      fireEvent.click (submitButton);
    });

    expect (
      screen.getByText ('Guess cannot be empty', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).not.toHaveBeenCalled (); //onAnswer should not be called
  });

  test ('1-letter guess should not work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    // fireEvent.change (guessInput, {
    //   target: {value: '1'},
    // });
    userEvent.type (guessInput, '1');
    let submitButton = screen.queryByText ('Submit');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('Guess is too short', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).not.toHaveBeenCalled (); //onAnswer should not be called
  });
});
