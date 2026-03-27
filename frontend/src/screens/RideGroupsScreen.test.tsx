import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RideGroupsScreen } from './RideGroupsScreen';

/*
tests to write:
1. Given the user is on this frame, when they press a ride group, then they join that Ride group.
2. Given the user is on this frame, when they input text in "Where are you?", then only ride groups starting from there appear
3. Given the user is on this frame, when they input text in "Where do you want to go?", then only ride groups to that destination appear
4. Given the user is on this frame, when they input text in "Where are you?" and "Where do you want to go?", then only ride groups to and from those places appear
5. Given the user is on this frame, when they press "Female Only" filter, then only "Female only" ride groups appear.
6. Given the user is on this frame, when they press "Alcohol Free" filter, then only "Alcohol Free" ride groups appear.
7. Given the user is on this frame, when they press "Same Course as Me" filter, then only "Same Course as Me" ride groups appear.
8. Given the user is on this frame, when they press multiple filters, then only ride groups of those filters appear.
9. Given the user is on this frame, when they are aren't a woman in their profile, then they cannot join a Female Only ride group.
10. Given the user is on this frame, when they press the back button, then they go back
11. Given the user is on this frame, when they press the settings button, then they go to the settings page
12. Given the user is on this frame, when they press the profile button, then they go to the profile page

*/

afterEach(() => {
    jest.clearAllMocks();
});

// snapshot test
test('renders CreateGroupPage correctly (snapshot test)', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
  
    const { toJSON } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    expect(toJSON()).toMatchSnapshot();
});

// test 1
test('If the user presses a ride card, they join it', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
  
    const { getByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    
    const rideCard = getByText('Downtown Financial District');
    fireEvent.press(rideCard);
    expect(mockOnJoinRide).toHaveBeenCalledTimes(1);
});

// test 2
test('Filter ride groups by pickup', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByPlaceholderText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    const input = getByPlaceholderText('Where are you?');

    fireEvent.changeText(input, 'North Station - Main Entrance');
    expect(queryByText('Central Square - Starbucks')).toBeNull();
    expect(queryByText('Downtown Financial District')).not.toBeNull();
});

// test 3
test('Filter ride groups by destination', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByPlaceholderText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    const input = getByPlaceholderText('Where do you want to go?');

    fireEvent.changeText(input, 'Tech Campus - Bay Area');
    expect(queryByText('North Station - Main Entrance')).toBeNull();
    expect(queryByText('Central Square - Starbucks')).not.toBeNull();
});


// test 4
test('Filter ride groups by pickup AND destination', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByPlaceholderText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    
    const pickupInput = getByPlaceholderText('Where are you?');
    const destinationInput = getByPlaceholderText('Where do you want to go?');
    
    fireEvent.changeText(pickupInput, 'Central Square - Starbucks');
    fireEvent.changeText(destinationInput, 'Tech Campus - Bay Area');
    
    expect(queryByText('North Station - Main Entrance')).toBeNull();
});

// test 5
test('Filtering by gender works', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);

    fireEvent.press(getByText('Female Only'));
    expect(queryByText('Tech Campus - Bay Area')).toBeNull();
});

// test 6
test('Filtering by alcohol works', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
  
    fireEvent.press(getByText('Alcohol Free'));
    expect(queryByText('Tech Campus - Bay Area')).toBeNull();
});


// test 7
test('Filtering by course', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);

    fireEvent.press(getByText('Same Course as Me'));
    expect(queryByText('Shopping Mall - Westfield')).toBeNull();
});


// test 8
test('Filtering by multiple filters works', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByText, queryByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);

    fireEvent.press(getByText('Female Only'));
    fireEvent.press(getByText('Alcohol Free'));
    expect(queryByText('Tech Campus - Bay Area')).toBeNull();
});


// test 9
test('Non-women cannot join the women ride groups', () => {
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
    
    const { getByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);

    const femaleRide = getByText('Downtown Financial District');
    fireEvent.press(femaleRide);
    expect(mockOnJoinRide).not.toHaveBeenCalled();
});


// test 10
test('If they press the back icon they go there', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
  
    const { getByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    const headerText = getByText('Current Ride Groups');

    fireEvent.press(headerText.parent!); 
    expect(mockOnBack).toHaveBeenCalledTimes(1);
});


// test 11
test('If they press the settings icon they go there', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
  
    const { getByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    fireEvent.press(getByText("⚙️"));
    expect(mockOnViewSettings).toHaveBeenCalledTimes(1);
});

// test 12
test('If they press the profile icon they go there', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnJoinRide = jest.fn();
    const mockOnViewSettings= jest.fn();
    const mockOnViewProfile= jest.fn();
  
    const { getByText } = render(<RideGroupsScreen userName = {mockUserName} onBack = {mockOnBack} onJoinRide = {mockOnJoinRide} onViewProfile = {mockOnViewProfile} onViewSettings = {mockOnViewSettings}/>);
    fireEvent.press(getByText("👤"));
    expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
});
