import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';

/*
tests to write:
1. Given the user is on this frame, when they press the back icon, then they join to the previous frame.
2. Given the user is on this frame, when they press the settings icon, then they join to the settings frame.
3. Given the user is on this frame, when they press "Change Password", then the function calls a change to the database.
4. Given the user is on this frame, when they press "Block List", then the function calls a change to the database.
5. Given the user is on this frame, when they press "Privacy Settings", then the function calls a change to the database.

*/

afterEach(() => {
    jest.clearAllMocks();
});

// snapshot test
test('renders ProfileScreen correctly (snapshot test)', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
  
    const { toJSON } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);
    expect(toJSON()).toMatchSnapshot();
});


// test 1
test('If they press the back icon they go there', () => { 
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
    const { getByText } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);
    
    fireEvent.press(getByText("←"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
});


// test 2
test('If they press the settings icon they go there', () => { 
   const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
    const { getByText } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);
    
    fireEvent.press(getByText("⚙️"));
    expect(mockOnViewSettings).toHaveBeenCalledTimes(1);
});


// test 3
test('If the user presses to change their password, it calls the change password function', () => { 
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
    const { getByText } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);    fireEvent.press(getByText("⚙️"));
    
    fireEvent.press(getByText("Change Password"));
    
    expect(consoleSpy).toHaveBeenCalledWith(
        "Navigate to: change-password",
    );

  consoleSpy.mockRestore();
});


// test 4
test('If the user presses to change their password, it calls the change password function', () => { 
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
    const { getByText } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);    fireEvent.press(getByText("⚙️"));
    
    fireEvent.press(getByText("Block List"));
    
    expect(consoleSpy).toHaveBeenCalledWith(
        "Navigate to: block-list",
    );

  consoleSpy.mockRestore();
});


// test 5
test('If the user presses to change their password, it calls the change password function', () => { 
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUserName = "Ab Ba"
    const mockOnBack = jest.fn();
    const mockOnUpdateProfile = jest.fn();
    const mockOnViewSettings= jest.fn();
    const { getByText } = render(<ProfileScreen userName = {mockUserName} onBack = {mockOnBack} onUpdateProfile = {mockOnUpdateProfile} onViewSettings = {mockOnViewSettings}/>);    fireEvent.press(getByText("⚙️"));
    
    fireEvent.press(getByText("Privacy Settings"));
    
    expect(consoleSpy).toHaveBeenCalledWith(
        "Navigate to: privacy-settings",
    );

  consoleSpy.mockRestore();
});

