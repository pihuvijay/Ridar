import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapScreen } from './MapScreen';

/*
tests to write:

*/

test('renders MapScreen correctly (snapshot test)', () => {
  const { toJSON } = render(<MapScreen />);
  expect(toJSON()).toMatchSnapshot(); 
});