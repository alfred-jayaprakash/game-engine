import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import ScorePanel from './ScorePanel';

let container;
let score;

describe ('Snapshot tests', () => {
  it ('should render correctly without issues', () => {
    const component = shallow (<ScorePanel score={100} />);

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  beforeAll (() => {
    //ARRANGE
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
    score = 200;
    render (<ScorePanel score={score} />, container);
  });
});
