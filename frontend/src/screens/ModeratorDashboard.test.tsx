import React from "react";
import { Alert } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ModeratorDashboard } from "./ModeratorDashboard";


/*
1. Given the user is on this frame, when they press the logout button, then they logout
2. Given the user is on this frame, when they press the back button, then they close the report details
3. Given the user is on this frame, when they press the approve button, then the report is registered as approved by the moderator
4. Given the user is on this frame, when they press the reject button, then the report is registered as rejected by the moderator
5. Given the user is on this frame, when they press the investigate button, then the report is registered as investigating by the moderator
6. Given the user is on this frame, when they edit the status of a report, then it gets reflected in the stats section.
*/


afterEach(() => {
  jest.clearAllMocks();
});


// snapshot
test("renders ModeratorDashboard correctly (snapshot)", () => {
  const mockOnLogout = jest.fn();
  
  const { toJSON } = render(<ModeratorDashboard onLogout = {mockOnLogout}/>);
  expect(toJSON()).toMatchSnapshot();
});

// test 1
test('calls onLogout when logout button is pressed', () => {
  const mockOnLogout = jest.fn();
  const { getByText } = render(<ModeratorDashboard onLogout = {mockOnLogout} />);
  
  fireEvent.press(getByText('🚪'));
  expect(mockOnLogout).toHaveBeenCalledTimes(1);
});


// test 2
test('back button closes report details', () => {
  const mockOnLogout = jest.fn();
  const { getByText, queryByText} = render(<ModeratorDashboard onLogout = {mockOnLogout} />);
  
  fireEvent.press(getByText('Alex P.'));
  fireEvent.press(getByText('←')); // Back button
  
  expect(queryByText('Report Details')).toBeNull();
  expect(getByText('Moderator Dashboard')).toBeTruthy();
});


// test 3
test('approve button updates report status', () => {
  const mockOnLogout = jest.fn();
  const { getByText, getAllByText} = render(<ModeratorDashboard onLogout = {mockOnLogout} />);
  

  const approvedReports = getAllByText(/Approved/i);
  fireEvent.press(getByText('Alex P.'));
  fireEvent.press(getByText('✓ Approve Report'));
  
  const updatedApprovedReports = getAllByText(/Approved/i);
  expect(updatedApprovedReports.length).toBeGreaterThan(approvedReports.length);
  expect(approvedReports[0]).toBeTruthy();
});


// test 4
test('reject button updates report status', () => {
  const mockOnLogout = jest.fn();
  const { getByText } = render(<ModeratorDashboard onLogout = {mockOnLogout} />);
  
  fireEvent.press(getByText('Alex P.'));
  fireEvent.press(getByText('✕ Reject Report'));
  
  expect(getByText(/Rejected/i)).toBeTruthy();
});


// test 5
test('investigate button updates report status', () => {
  const mockOnLogout = jest.fn();
  const { getByText, getAllByText } = render(<ModeratorDashboard onLogout = {mockOnLogout} />);
  
  const investigatingReports = getAllByText(/Investigating/i);
  fireEvent.press(getByText('Alex P.'));
  fireEvent.press(getByText('🔍 Investigate Further'));
  
  const updatedInvestigatingReports = getAllByText(/Investigating/i);
  expect(updatedInvestigatingReports.length).toBeGreaterThan(investigatingReports.length);
  expect(investigatingReports[0]).toBeTruthy();
});


// test 6
test('updates report card statuses correctly when approving a report', () => {
  const mockOnLogout = jest.fn();
  const { getByText, queryByText, queryAllByText } = render(<ModeratorDashboard onLogout={mockOnLogout} />);

  const approvedStatuses = queryAllByText(/Approved/i);
  const pendingStatuses = queryAllByText(/Pending/i);


  expect(getByText('Alex P.')).toBeTruthy();
  fireEvent.press(getByText('Alex P.')); // open a fake report from the frame
  expect(getByText(/Pending/i)).toBeTruthy();

  fireEvent.press(getByText('✓ Approve Report'));
  expect(queryByText('Report Details')).toBeNull(); // double check you went back to the base frame/closed the report
  
  const updatedApprovedStatuses = queryAllByText(/Approved/i);  
  const updatedPendingStatuses = queryAllByText(/Pending/i);

  expect(updatedApprovedStatuses.length).toBeGreaterThan(approvedStatuses.length); // now there's at least 1 approved report on the frame
  expect(updatedPendingStatuses.length).toBeLessThan(pendingStatuses.length); 
});


// test 7
test('updates report card statuses correctly when investigating a report', () => {
  const mockOnLogout = jest.fn();
  const { getByText, queryAllByText } = render(
    <ModeratorDashboard onLogout={mockOnLogout} />
  );

  fireEvent.press(getByText('Alex P.'));
  fireEvent.press(getByText('🔍 Investigate Further'));

  const investigatingStatuses = queryAllByText(/Investigating/i);
  expect(investigatingStatuses.length).toBeGreaterThan(0); // proves the report is being investigated because the text appears
});