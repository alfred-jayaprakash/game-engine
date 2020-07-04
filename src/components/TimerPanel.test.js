import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import TimerPanel from './TimerPanel';

let container;
let currentImage = '1.jpg';
let duration = 30;
let onTimeOver;

describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
    onTimeOver = () => {};
  });

  it ('should render correctly without issues', () => {
    const component = shallow (
      <TimerPanel
        duration={duration}
        currentImage={currentImage}
        onTimeOver={onTimeOver}
      />
    );

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
    onTimeOver = jest.fn ();
  });

  beforeEach (() => {
    container = document.createElement ('div');
    document.body.appendChild (container);
  });

  afterEach (() => {
    document.body.removeChild (container);
    container = null;
    onTimeOver.mockClear ();
  });

  it ('initial screen should load correctly', () => {
    render (
      <TimerPanel
        duration={duration}
        currentImage={currentImage}
        onTimeOver={onTimeOver}
      />,
      container
    );
  });
});
