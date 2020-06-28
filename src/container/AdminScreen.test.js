import React from 'react';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import {shallow} from 'enzyme';
import AdminScreen from './AdminScreen';

describe ('Snapshot tests', () => {
  it ('should render correctly without issues', () => {
    const component = shallow (<AdminScreen />);

    expect (component).toMatchSnapshot ();
  });
});

describe ('Functional tests', () => {
  it ('initial screen should load correct', () => {
    render (<AdminScreen />);
    expect (
      screen.getByLabelText ('Choose picture category:')
    ).toBeInTheDocument ();
    expect (screen.getByLabelText ('Number of pictures:')).toBeInTheDocument ();
    expect (
      screen.getByLabelText ('Time for each picture:')
    ).toBeInTheDocument ();
  });
});
