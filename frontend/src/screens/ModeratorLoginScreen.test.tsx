import React from "react";
import { Alert } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ModeratorLoginScreen } from "./ModeratorLoginScreen";


/*
1. Given the user is on this frame, when they press "Back to User Login", then they go back to the SignInPage screen
2. Given the user is on this frame, when they input valid user login details, then they go to the moderator dashboard
3. Given the user is on this frame, when they input invalid credentials, then they get an alert message of failure
4. Given the user is on this frame, when they input an invalid password, then they get an alert message of failure
5. Given the user is on this frame, when they toggle password visibility, then the password appropriately changes its visiblity
6. Given the user is on this frame, when they press login on a valid input, then there is visible loading feedback to the user.


test("Checks if the frame shows the loading state when logging in
*/


afterEach(() => {
  jest.clearAllMocks();
});

jest.useFakeTimers();

// snapshot
test("renders ModeratorLoginScreen correctly (snapshot)", () => {
  const mockOnLogin = jest.fn();
  const mockOnBackToLogin = jest.fn();
  
  const { toJSON } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);
  expect(toJSON()).toMatchSnapshot();
});


// test 1
test("Can go back to the main user login", () => {
    const mockOnLogin = jest.fn();
    const mockOnBackToLogin = jest.fn();
    const { getByText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);
    
    const rideCard = getByText('← Back to User Login');
    fireEvent.press(rideCard);
    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1);
});


// test 2
test("calls onLogin when valid credentials entered", () => {
  const mockOnLogin = jest.fn();
  const mockOnBackToLogin = jest.fn();
  const { getByText, getByPlaceholderText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);

  // valid login credentials for this version
  fireEvent.changeText(getByPlaceholderText("Enter username"), "admin");
  fireEvent.changeText(getByPlaceholderText("Enter password"), "admin123");

  fireEvent.press(getByText('Sign In'));
  
  jest.runAllTimers(); // instantly executes the setTimeout
  
  expect(mockOnLogin).toHaveBeenCalledTimes(1);
});



// test 3
test("fails onLogin if invalid credentials entered", () => {
    const mockOnLogin = jest.fn();
    const mockOnBackToLogin = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);

    fireEvent.changeText(getByPlaceholderText("Enter username"), "moderator@ridar.ac.uk");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "abc123");

    fireEvent.press(getByText('Sign In'));
    jest.runAllTimers();
    
    expect(alertSpy).toHaveBeenCalledWith(
      "Login Failed",
      "Invalid username or password"
    );

    expect(mockOnLogin).not.toHaveBeenCalled();
});


// test 4
test("fails onLogin if only invalid password entered", () => {
    const mockOnLogin = jest.fn();
    const mockOnBackToLogin = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);

    fireEvent.changeText(getByPlaceholderText("Enter username"), "admin");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "abc123");

    fireEvent.press(getByText('Sign In'));
    jest.runAllTimers();
    
    expect(alertSpy).toHaveBeenCalledWith(
      "Login Failed",
      "Invalid username or password"
    );

    expect(mockOnLogin).not.toHaveBeenCalled();
});

// test 5
test("Checks if toggle password works on visibility", () => {
  const mockOnLogin = jest.fn();
  const mockOnBackToLogin = jest.fn();
  const { getByText, getByPlaceholderText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);
  const passwordInput = getByPlaceholderText("Enter password");


  expect(passwordInput.props.secureTextEntry).toBe(true);
  
  fireEvent.press(getByText("👁️‍🗨️"));
  expect(passwordInput.props.secureTextEntry).toBe(false);
  
  fireEvent.press(getByText("👁️"));
  expect(passwordInput.props.secureTextEntry).toBe(true);
});


// test 6
test("Checks if the frame shows the loading state when logging in", () => {
  const mockOnLogin = jest.fn();
  const mockOnBackToLogin = jest.fn();    
  const { getByText, getByPlaceholderText } = render(<ModeratorLoginScreen onLogin = {mockOnLogin} onBackToLogin = {mockOnBackToLogin} />);
  
  fireEvent.changeText(getByPlaceholderText("Enter username"), "admin");
  fireEvent.changeText(getByPlaceholderText("Enter password"), "admin123");

  fireEvent.press(getByText("Sign In"));

  expect(getByText("Signing in...")).toBeTruthy();
});