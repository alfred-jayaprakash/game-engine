import React from 'react';
import {render, fireEvent, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import GamePanel from './GamePanel';
jest.mock ('../utils/GameEngine');
import GameEngine from '../utils/GameEngine';

describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
  });

  test ('should render correctly without issues', () => {
    onAnswer = () => {};
    const component = shallow (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />
    );

    expect (component).toMatchSnapshot ();
  });
});

let onAnswer;
let container;
const imageUrl = './1.jpg';
let gameStateCallback;

describe ('Functional tests', () => {
  beforeAll (() => {
    GameEngine.registerForGameStateUpdates.mockImplementation (
      callback => (gameStateCallback = callback)
    );

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

  test ('state update with hits for a guess should properly render', () => {
    let stateRef = 1;
    const {rerender, getByPlaceholderText} = render (
      <GamePanel
        currentImage={imageUrl}
        onAnswer={onAnswer}
        currentRef={stateRef}
      />,
      container
    );

    let guessInput = getByPlaceholderText ('Type your word');
    let submitButton = screen.queryByText ('Submit');

    userEvent.type (guessInput, 'one');
    fireEvent.click (submitButton);

    userEvent.type (guessInput, 'two');
    fireEvent.click (submitButton);

    //Now send a mock status update from server
    gameStateCallback ({
      answer: 'one',
      ref: stateRef,
      users: ['A', 'B', 'C'],
    });

    // Hack to force a rerender and thus call useLayoutEffect
    rerender (
      <GamePanel
        currentImage={imageUrl}
        onAnswer={onAnswer}
        currentRef={stateRef}
      />
    );

    // Hits should be reflected in the screen as a badge
    expect (screen.getByText ('3')).toBeInTheDocument ();
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
  });
});
