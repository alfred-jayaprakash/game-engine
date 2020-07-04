import React from 'react';
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow} from 'enzyme';
import MessagePanel from './MessagePanel';

let container;
let data;

describe ('Snapshot tests', () => {
  beforeAll (() => {
    //ARRANGE
    data = ['one', 'two', 'three'];
  });

  it ('should render correctly without issues', () => {
    const component = shallow (<MessagePanel data={data} />);

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
    data = ['one', 'two', 'three'];
    render (<MessagePanel data={data} />, container);
  });
});
