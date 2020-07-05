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
    userEvent.type (guessInput, '1');
    let submitButton = screen.queryByText ('Submit');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('Guess is too short', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).not.toHaveBeenCalled (); //onAnswer should not be called
  });

  test ('Super long guesses should not work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    userEvent.type (guessInput, 'abcdefghijklmnopqrstu');
    let submitButton = screen.queryByText ('Submit');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('Guess cannot be longer than 20', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).not.toHaveBeenCalled (); //onAnswer should not be called
  });

  test ('new guess should work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    userEvent.type (guessInput, 'one');
    let submitButton = screen.queryByText ('Submit');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('one', {exact: false}) //Word should appear
    ).toBeInTheDocument ();
    expect (onAnswer).toHaveBeenCalled (); //onAnswer should be called
    expect (onAnswer.mock.calls.length).toEqual (1); //Called exactly once
    expect (onAnswer.mock.calls[0][0]).toBe ('one'); //First time should be 'one'
  });

  test ('duplicate guess should not work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    let submitButton = screen.queryByText ('Submit');

    userEvent.type (guessInput, 'one');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'one');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('Word already guessed', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).toHaveBeenCalled (); //onAnswer should be called
    expect (onAnswer.mock.calls.length).toEqual (1); //Called exactly twice
  });

  test ('duplicate guess in different case should not work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    let submitButton = screen.queryByText ('Submit');

    userEvent.type (guessInput, 'OnE');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'oNe');
    fireEvent.click (submitButton);

    expect (
      screen.getByText ('Word already guessed', {exact: false}) //Error message should appear
    ).toBeInTheDocument ();
    expect (onAnswer).toHaveBeenCalled (); //onAnswer should be called
    expect (onAnswer.mock.calls.length).toEqual (1); //Called exactly twice
  });

  test ('unique second guess should work', () => {
    const {getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    let submitButton = screen.queryByText ('Submit');

    userEvent.type (guessInput, 'one');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'two');
    fireEvent.click (submitButton);

    expect (onAnswer).toHaveBeenCalled (); //onAnswer should be called
    expect (onAnswer.mock.calls.length).toEqual (2); //Called exactly twice
    expect (onAnswer.mock.calls[0][0]).toBe ('one'); //First time should be 'one'
    expect (onAnswer.mock.calls[1][0]).toBe ('two'); //Second time should be 'two'
  });

  test ('new image should clear previous answers', async () => {
    const {queryByText, rerender, getByPlaceholderText} = render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    let submitButton = screen.queryByText ('Submit');

    userEvent.type (guessInput, 'one');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'two');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'three');
    fireEvent.click (submitButton);

    expect (queryByText ('one')).toBeInTheDocument ();
    expect (queryByText ('two')).toBeInTheDocument ();
    expect (queryByText ('three')).toBeInTheDocument ();

    // re-render with different image
    let newImageUrl = './2.jpg';
    rerender (<GamePanel currentImage={newImageUrl} onAnswer={onAnswer} />);
    expect (queryByText ('one')).not.toBeInTheDocument ();

    // guessInput = getByPlaceholderText ('Type your word');
    // submitButton = screen.queryByText ('Submit');

    // userEvent.type (guessInput, 'north');
    // fireEvent.click (submitButton);

    // userEvent.type (guessInput, 'south');
    // fireEvent.click (submitButton);

    // userEvent.type (guessInput, 'west');
    // fireEvent.click (submitButton);
    // // Again render with a different image
    // newImageUrl = './3.jpg';
    // rerender (<GamePanel currentImage={newImageUrl} onAnswer={onAnswer} />);
    // expect (queryByText ('north')).not.toBeInTheDocument ();
  });
});
