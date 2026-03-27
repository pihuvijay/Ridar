import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';


// idk what else to do, maybe add it to the config as a setup file?

/*
npm install --save-dev react-native-maps-mock
"setupFiles": ["react-native-maps-mock"] ?
}
*/
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props: any) => <View {...props} />;
  MockMapView.Marker = (props: any) => <View {...props} />;
  MockMapView. PROVIDER_GOOGLE = 'google';
  return MockMapView;
});

import { MapScreen } from './MapScreen';

/*
tests to write:
1. Given you press "view available ride groups" when on map page, then you redirect to the ride group page. 
2. Given you press "create new ride group" when on map page, then you redirect to the create group page.
3. Given you press "☰" when on map page, then you redirect to the menu page (lowkey wtaf is this for am i slow??/??/?)
  3a. if this is a thing, we need a way to exit... press outside the menu view if its a miniframe on the screen?

4. Given you press "⚙️" when on map page, then you redirect to the settings page
5. Given you press your username when on map page, then you redirect to your profile page

i can't think of anything else :p

*/


afterEach(() => {
  jest.clearAllMocks();
});

// snapshot test
test('renders MapScreen correctly (snapshot test)', () => {
  const { toJSON } = render(<MapScreen />);
  expect(toJSON()).toMatchSnapshot(); 
});

// test 1
test('Pressing "View Available Ride Groups" calls onViewRideGroups', () => {
  const mockViewGroups = jest.fn();
  const { getByText } = render(<MapScreen onViewRideGroups={mockViewGroups} />);

  fireEvent.press(getByText("View Available Ride Groups"));
  expect(mockViewGroups).toHaveBeenCalledTimes(1);
});

// test 2
test('Pressing "Create New Ride Group" calls onCreateRideGroup', () => {
  const mockCreateGroups = jest.fn();
  const { getByText } = render(<MapScreen onCreateRideGroup={mockCreateGroups} />);

  fireEvent.press(getByText("Create New Ride Group"));
  expect(mockCreateGroups).toHaveBeenCalledTimes(1);
});

// test 3
test('Pressing "☰" calls onMenuPress', () => {
  const mockMenu = jest.fn();
  const { getByText } = render(<MapScreen onMenuPress={mockMenu} />);

  fireEvent.press(getByText("☰"));
  expect(mockMenu).toHaveBeenCalledTimes(1);
});

// test 4
test('Pressing "⚙️" calls onSettingsPress', () => {
  const mockSettings = jest.fn();
  const { getByText } = render(<MapScreen onSettingsPress={mockSettings} />);

  fireEvent.press(getByText("⚙️"));
  expect(mockSettings).toHaveBeenCalledTimes(1);
});

// test 5
test('Pressing the username calls onProfilePress', () => {
  const mockProfile = jest.fn();
  const { getByText } = render(
    <MapScreen userName="Test User" onProfilePress={mockProfile} />
  );

  fireEvent.press(getByText("Test User"));
  expect(mockProfile).toHaveBeenCalledTimes(1);
});