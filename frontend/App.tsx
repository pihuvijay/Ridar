import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/contexts';
import { COLORS } from './src/theme/colors';

// Screen Imports
import { SignInPage } from './src/screens/SignInPage';
import { SignUpPage } from './src/screens/SignUpPage';
import { CreateGroupPage } from './src/screens/CreateGroupPage';
import { ConnectAccountsPage } from './src/screens/ConnectAccountsPage';
import { MapScreen } from './src/screens/MapScreen';
import { RideGroupsScreen } from './src/screens/RideGroupsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ModeratorLoginScreen } from './src/screens/ModeratorLoginScreen';
import { ModeratorDashboard } from './src/screens/ModeratorDashboard';
import { RideJoiningScreen } from './src/screens/RideJoiningScreen';
import { WaitScreen } from './src/screens/WaitScreen';

type Screen =
  | 'signin'
  | 'signup'
  | 'connectaccounts'
  | 'map'
  | 'ride-groups'
  | 'create-ride'
  | 'profile'
  | 'settings'
  | 'moderator-login'
  | 'moderator-dashboard'
  | 'ride-joining'
  | 'wait-screen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('signin');
  const [userName, setUserName] = useState('');
  const [selectedRideGroup, setSelectedRideGroup] = useState<any>(null);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Sign In/Up Handlers
  const handleLogin = (name: string) => {
    setUserName(name);
    setCurrentScreen('connectaccounts');
  };

  const handleSignup = (name: string) => {
    setUserName(name);
    setCurrentScreen('connectaccounts');
  };

  const handleBackToSignIn = () => {
    setCurrentScreen('signin');
  };

  const handleShowSignup = () => {
    setCurrentScreen('signup');
  };

  // Moderator Handlers
  const handleShowModeratorLogin = () => {
    setCurrentScreen('moderator-login');
  };

  const handleModeratorLogin = () => {
    setCurrentScreen('moderator-dashboard');
  };

  // Main Navigation Handlers
  const handleAccountsConnected = () => {
    setCurrentScreen('map');
  };

  const handleViewRideGroups = () => {
    setCurrentScreen('ride-groups');
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
  };

  const handleCreateRideGroup = () => {
    setCurrentScreen('create-ride');
  };

  const handleRideCreated = (rideData: any) => {
    setCurrentScreen('map');
  };

  const handleJoinRide = (rideGroup: any) => {
    setSelectedRideGroup(rideGroup);
    setCurrentScreen('ride-joining');
  };

  const handleBackToRideGroups = () => {
    setCurrentScreen('ride-groups');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleUpdateProfile = (profile: any) => {
    setUserName(profile.name);
  };

  const handleViewSettings = () => {
    setCurrentScreen('settings');
  };

  const handleAllPaid = () => {
    setCurrentScreen('map');
  };

  const handlePartyFull = (rideGroup: any) => {
    setSelectedRideGroup(rideGroup);
    setCurrentScreen('map');
  };

  const handleBookRide = () => {
    setCurrentScreen('map');
  };

  const handleTripComplete = () => {
    setCurrentScreen('map');
  };


  const handleSignOut = () => {
    setCurrentScreen('signin');
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey="pk_test_51T3m9820nWP9392CIyappOL7YyxWfjKQBzUAPE0HLFrzNvp3IXz1sQZ5h7RkOEYRCTjFIpOcTKTaI1sFgFHmwT0700XzYWajot">
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
        {currentScreen === 'signin' && (
        <SignInPage
          onSignUp={handleShowSignup}
          onModeratorLogin={handleShowModeratorLogin}
          onLogin={handleLogin}
        />
      )}
      {currentScreen === 'signup' && (
        <SignUpPage onSignIn={handleBackToSignIn} onCreateAccount={() => handleSignup('')} />
      )}
      {currentScreen === 'connectaccounts' && (
        <ConnectAccountsPage onNavigateHome={handleAccountsConnected} />
      )}
      {currentScreen === 'map' && (
        <MapScreen
          userName={userName}
          onViewRideGroups={handleViewRideGroups}
          onCreateRideGroup={handleCreateRideGroup}
          onProfilePress={handleViewProfile}
          onSettingsPress={handleViewSettings}
          onMenuPress={handleSignOut}
        />
      )}
      {currentScreen === 'ride-groups' && (
        <RideGroupsScreen
          onBack={handleBackToMap}
          userName={userName}
          onJoinRide={handleJoinRide}
          onViewSettings={handleViewSettings}
          onViewProfile={handleViewProfile}
        />
      )}
      {currentScreen === 'ride-joining' && selectedRideGroup && (
        <RideJoiningScreen
          userName={userName}
          rideGroup={selectedRideGroup}
          onBack={handleBackToRideGroups}
          onViewSettings={handleViewSettings}
          onPartyFull={handlePartyFull}
        />
      )}
      {currentScreen === 'wait-screen' && (
        <WaitScreen onContinue={handleAllPaid} />
      )}
      {currentScreen === 'create-ride' && (
        <CreateGroupPage
          onBack={handleBackToMap}
          onCreateGroup={(rideData) => handleRideCreated(rideData)}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen
          userName={userName}
          onBack={handleBackToMap}
          onUpdateProfile={handleUpdateProfile}
          onViewSettings={handleViewSettings}
        />
      )}
      {currentScreen === 'settings' && <SettingsScreen onBack={handleBackToMap} />}
      {currentScreen === 'moderator-login' && (
        <ModeratorLoginScreen
          onLogin={handleModeratorLogin}
          onBackToLogin={handleBackToSignIn}
        />
      )}
      {currentScreen === 'moderator-dashboard' && (
        <ModeratorDashboard onLogout={handleBackToSignIn} />
      )}
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  </StripeProvider>
    </SafeAreaProvider>
  );
}

