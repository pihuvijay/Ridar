import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { RideJoiningScreen } from "./RideJoiningScreen";

/*
tests to write:
1. Given the user is on this frame, when the back button icon is pressed, then the user goes to the RideGroupsScreen.tsx frame
2. Given the user is on this frame, when the settings icon is pressed, then the user goes to the SettingsScreen.tsx frame
3. Given the user is on this frame, when the "Join This Ride" is pressed, then go to the next screen since the ridegroup is full

it that really it? i cant think of any more unit tests
*/

afterEach(() => {
  jest.clearAllMocks();
});


// snapshot
test("renders RideJoiningScreen correctly (snapshot)", () => {
    
    const mockUserName = "Ab Ba"
    const mockRideGroup = {
        destination: "Downtown Financial District",
        pickup: "North Station - Main Entrance",
        leavingIn: 5,
        price: 8,
    };
    const mockOnBack = jest.fn();
    const mockOnViewSettings = jest.fn();
    const mockOnPartyFull= jest.fn();
    

  const { toJSON } = render(<RideJoiningScreen userName = {mockUserName} rideGroup = {mockRideGroup} onBack = {mockOnBack} onViewSettings = {mockOnViewSettings} onPartyFull = {mockOnPartyFull}/>);
  expect(toJSON()).toMatchSnapshot();
});

// test 1
test('If the user presses the back button, they go the RideGroupsScreen.tsx', () => {
    const mockUserName = "Ab Ba"
    const mockRideGroup = {
        destination: "Downtown Financial District",
        pickup: "North Station - Main Entrance",
        leavingIn: 5,
        price: 8,
    };
    const mockOnBack = jest.fn();
    const mockOnViewSettings = jest.fn();
    const mockOnPartyFull= jest.fn();

    const { getByText } = render(<RideJoiningScreen userName = {mockUserName} rideGroup = {mockRideGroup} onBack = {mockOnBack} onViewSettings = {mockOnViewSettings} onPartyFull = {mockOnPartyFull}/>);

  
    fireEvent.press(getByText("←"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
});

// test 2
test('If the user presses the settings button, they go the SettingsScreen.tsx', () => {
    const mockUserName = "Ab Ba"
    const mockRideGroup = {
        destination: "Downtown Financial District",
        pickup: "North Station - Main Entrance",
        leavingIn: 5,
        price: 8,
    };
    const mockOnBack = jest.fn();
    const mockOnViewSettings = jest.fn();
    const mockOnPartyFull= jest.fn();

    const { getByText } = render(<RideJoiningScreen userName = {mockUserName} rideGroup = {mockRideGroup} onBack = {mockOnBack} onViewSettings = {mockOnViewSettings} onPartyFull = {mockOnPartyFull}/>);

  
    fireEvent.press(getByText("⚙️"));
    expect(mockOnViewSettings).toHaveBeenCalledTimes(1);
});

// test 3
test('If the user presses the "Join This Ride" button, they go to the next screen since the ridegroup is full', () => {
    const mockUserName = "Ab Ba"
    const mockRideGroup = {
        destination: "Downtown Financial District",
        pickup: "North Station - Main Entrance",
        leavingIn: 5,
        price: 8,
    };
    const mockOnBack = jest.fn();
    const mockOnViewSettings = jest.fn();
    const mockOnPartyFull= jest.fn();

    const { getByText } = render(<RideJoiningScreen userName = {mockUserName} rideGroup = {mockRideGroup} onBack = {mockOnBack} onViewSettings = {mockOnViewSettings} onPartyFull = {mockOnPartyFull}/>);

    fireEvent.press(getByText(/Join This Ride/i));// why is our text format so weird now
    expect(mockOnPartyFull).toHaveBeenCalledTimes(1);
});