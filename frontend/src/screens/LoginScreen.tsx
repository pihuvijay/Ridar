import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';

import AuthInput from '../components/AuthInput';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';

// TODO: Replace with actual icons
const EmailIcon = () => <View style={commonStyles.inputIcon} />;
const LockIcon = () => <View style={commonStyles.inputIcon} />;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Handle login logic here
      console.log('Login form submitted:', formData);
      // Navigate to home screen or handle authentication
      // navigation.navigate('Home');
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    Alert.alert('Forgot Password', 'Password reset functionality would go here');
  };

  const handleModeratorLogin = () => {
    // Handle moderator login
    navigation.navigate('ModeratorLogin' as never);
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={commonStyles.loginContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={commonStyles.loginLogoContainer}>
          <View style={commonStyles.loginLogoCircle}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </View>
          <Text style={commonStyles.brandName}>RideShare</Text>
          <Text style={commonStyles.brandTagline}>Connect. Share. Arrive.</Text>
        </View>

        <View style={[commonStyles.card, { marginHorizontal: 20 }]}>
          <Text style={[commonStyles.cardTitle, { marginBottom: 24 }]}>
            Welcome Back
          </Text>

          <AuthInput
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            icon={<EmailIcon />}
          />

          <AuthInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            error={errors.password}
            icon={<LockIcon />}
          />

          <View style={commonStyles.formOptions}>
            <View style={commonStyles.rememberMe}>
              <CheckBox
                value={formData.rememberMe}
                onValueChange={(value) =>
                  setFormData({ ...formData, rememberMe: value })
                }
                boxType="square"
                style={{ width: 16, height: 16, marginRight: 8 }}
                tintColor={colors.borderColor}
                onCheckColor={colors.white}
                onFillColor={colors.primary}
                onTintColor={colors.primary}
              />
              <Text style={commonStyles.rememberMeText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={commonStyles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={commonStyles.primaryButton}
            onPress={handleSubmit}
          >
            <Text style={commonStyles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={commonStyles.signupSection}>
            <Text style={commonStyles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
              <Text style={commonStyles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={commonStyles.moderatorSection}>
            <TouchableOpacity
              style={commonStyles.moderatorButton}
              onPress={handleModeratorLogin}
            >
              <View style={{ width: 16, height: 16 }} />
              <Text style={commonStyles.moderatorButtonText}>
                Moderator Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default LoginScreen;
