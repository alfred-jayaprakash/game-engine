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

  it ('should render correctly without issues', () => {
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

  it ('initial screen should load correctly', () => {
    render (
      <GamePanel currentImage={imageUrl} onAnswer={onAnswer} />,
      container
    );

    //Make sure Submit button to be present
    expect (screen.queryByText ('Submit')).toBeInTheDocument ();
  });
});
