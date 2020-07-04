import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import ControlPanel from './ControlPanel';

let container;

describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
  });

  it ('should render correctly without issues', () => {
    const component = shallow (<ControlPanel />);

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
    render (<ControlPanel />, container);
  });
});
