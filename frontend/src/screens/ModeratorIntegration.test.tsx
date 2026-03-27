import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ModeratorLoginScreen } from './ModeratorLoginScreen';
import { ModeratorDashboard } from './ModeratorDashboard';

/*
FLOW STEPS:
1. login as a moderator
2. reach the dashboard
3. click on a report
4. return to the main dashboard (either by approving, rejecting, or ignoring the report)
5. logout back to signin page for moderators.
*/

// because otherwise the login tests fail due to time constraints vs the jest test
jest.useFakeTimers();

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// to help with the null cases for navigation across the frame and calling different functions. 'navigation' is weird like that
const LoginForTest: React.FC<{ navigation: any }> = ({ navigation }) => (
  <ModeratorLoginScreen
    onLogin={() => navigation.navigate('Dashboard')}
    onBackToLogin={() => {}}
  />
);

const DashboardForTest: React.FC<{ navigation: any }> = ({ navigation }) => (
  <ModeratorDashboard
    onLogout={() => navigation.navigate('Login')}
  />
);

test('Full integration test of a fundamental use case for moderators', async () => {
  const { getByText, getByPlaceholderText, queryByText, getAllByText } = render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name = "Login"
          component={LoginForTest}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardForTest} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  
  fireEvent.changeText(getByPlaceholderText('Enter username'), 'admin');
  fireEvent.changeText(getByPlaceholderText('Enter password'), 'admin123');
  fireEvent.press(getByText('Sign In'));
  jest.runAllTimers(); 

  await waitFor(() => {
    expect(getByText('Moderator Dashboard')).toBeTruthy();
    expect(getByText('All Reports')).toBeTruthy();

    // have to do like this to combat the 'getByText' and multiple found matches error
    const pendingStat = getAllByText('Pending')[0];
    const investigatingStat = getAllByText('Investigating')[0];
    const resolvedStat = getAllByText('Resolved')[0];
    
    expect(pendingStat).toBeTruthy();
    expect(investigatingStat).toBeTruthy();
    expect(resolvedStat).toBeTruthy();
  });

  // open a report and check all elements are appropriately rendered in
  fireEvent.press(getByText('Alex P.'));

  await waitFor(() => {
    expect(getByText('Report Details')).toBeTruthy();
    expect(getByText('Reported User:')).toBeTruthy();
    expect(getByText('Alex P.')).toBeTruthy();
    expect(getByText('Reporter:')).toBeTruthy();
    expect(getByText('John D.')).toBeTruthy();
    expect(getByText('Reason:')).toBeTruthy();
    expect(getByText('Inappropriate Behavior')).toBeTruthy();
    expect(getByText('Current Status:')).toBeTruthy();
    expect(getByText('Pending')).toBeTruthy();
  });

  // go back to the main dashboard
  fireEvent.press(getByText('←'));
  await waitFor(() => {
    expect(getByText('Moderator Dashboard')).toBeTruthy();
  });

  // logout as a moderator
  fireEvent.press(getByText('🚪'));
  await waitFor(() => {
    expect(getByText('Sign In')).toBeTruthy();
    expect(queryByText('Moderator Dashboard')).toBeNull();
  });
});