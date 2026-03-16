import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { SettingsScreen } from "./SettingsScreen";

/*
tests to write:
1. Given the user is on the page, when a button is toggled then the button slides over
    a. for "Push Notifications", "Ride Reminders", "Chat Messages"
2. lowkey thats it no? i dont think we have or plan to add functionality here from the lab discussion today
*/



// snapshot
test("renders SettingsScreen correctly (snapshot)", () => {
    const mockOnBack = jest.fn();
    const { toJSON } = render(<SettingsScreen onBack = {mockOnBack} />);
    expect(toJSON()).toMatchSnapshot();
});