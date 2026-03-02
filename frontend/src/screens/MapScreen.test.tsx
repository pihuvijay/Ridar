import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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


// snapshot test
test('renders MapScreen correctly (snapshot test)', () => {
  const { toJSON } = render(<MapScreen />);
  expect(toJSON()).toMatchSnapshot(); 
});


// test 1
test('Pressing to view available ride groups takes you to the onViewRideGroups section', () => {
  const mockViewGroups = jest.fn();

  const { getByText } = render(<MapScreen onViewRideGroups = {mockViewGroups} />);

  fireEvent.press(getByText("View Available Ride Groups"));

  expect(mockViewGroups).toHaveBeenCalledTimes(1);
});


// test 2
test('Pressing to create a new ride group takes you to CreateGroupPage.tsx', () => {
  const mockCreateGroups = jest.fn();
  const { getByText } = render(<MapScreen onCreateRideGroup = {mockCreateGroups} />);

  fireEvent.press(getByText("Create New Ride Group"));
  expect(mockCreateGroups).toHaveBeenCalled();
});


// test 3
test('Selecting menu opens the menu view', () => {
  const mockView = jest.fn();
  const { getByText } = render(<MapScreen onMenuPress = {mockView} />);

  fireEvent.press(getByText("☰"));

  expect(mockView).toHaveBeenCalled();
});


// test 4
test('Pressing the settings icon takes you to the settings page', () => {
  const mockSettings = jest.fn();
  const { getByText } = render(<MapScreen onSettingsPress = {mockSettings} />);

  fireEvent.press(getByText("⚙️"));

  expect(mockSettings).toHaveBeenCalled();
});

// test 5
test('Selecting the profile section takes you to your profile page', () => {
  const mockProfile = jest.fn();
  const { getByText } = render( <MapScreen userName = "Test User" onProfilePress = {mockProfile} />);
  fireEvent.press(getByText("Test User"));

  expect(mockProfile).toHaveBeenCalledTimes(1);
});