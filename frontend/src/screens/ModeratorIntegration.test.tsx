import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ModeratorLoginScreen } from './ModeratorLoginScreen';
import { ModeratorDashboard } from './ModeratorDashboard';

jest.useFakeTimers();

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper components for test; use `any` for navigation since TS inference in tests is tricky
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

describe('Full Moderator Workflow', () => {
  it('logs in, opens Alex P. report, navigates back, and logs out', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginForTest} // no inline typing
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardForTest} // no inline typing
          />
        </Stack.Navigator>
      </NavigationContainer>
    );

    // Step 1: Login
    fireEvent.changeText(getByPlaceholderText('Enter username'), 'admin');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'admin123');
    fireEvent.press(getByText('Sign In'));
    jest.runAllTimers(); // resolve setTimeout

    // Step 2: Dashboard renders
    await waitFor(() => {
      expect(getByText('Moderator Dashboard')).toBeTruthy();
      expect(getByText('All Reports')).toBeTruthy();
      expect(getByText('Pending')).toBeTruthy();
      expect(getByText('Investigating')).toBeTruthy();
      expect(getByText('Resolved')).toBeTruthy();
    });

    // Step 3: Open Alex P. report
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

    // Step 4: Back to dashboard
    fireEvent.press(getByText('←'));
    await waitFor(() => {
      expect(getByText('Moderator Dashboard')).toBeTruthy();
    });

    // Step 5: Logout
    fireEvent.press(getByText('🚪'));
    await waitFor(() => {
      expect(getByText('Sign In')).toBeTruthy();
      expect(queryByText('Moderator Dashboard')).toBeNull();
    });
  });
});