import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import CheckBox from '@react-native-community/checkbox';

import AuthInput from '../components/AuthInput';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';

// TODO: Replace with actual icons
const UserIcon = () => <View style={commonStyles.inputIcon} />;
const EmailIcon = () => <View style={commonStyles.inputIcon} />;
const HatIcon = () => <View style={commonStyles.inputIcon} />;
const CalendarIcon = () => <View style={commonStyles.inputIcon} />;
const GenderIcon = () => <View style={commonStyles.inputIcon} />;

const SignUpScreen: React.FC = () => {
  type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: '',
    age: '',
    gender: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course/Major is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 16) {
      newErrors.age = 'Please enter a valid age (16+)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!acceptedTerms) {
      Alert.alert('Terms Not Accepted', 'You must accept the terms to continue');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Handle form submission
      console.log('Form submitted:', formData);
      // Navigate to verification screen or home screen
      // navigation.navigate('Verification');
    }
  };

  const handleScanCard = () => {
    // Handle library card scanning
    Alert.alert('Scan Card', 'Library card scanning functionality would go here');
  };

  const showGenderPicker = () => {
    Alert.alert(
      'Select Gender',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Female', 
          onPress: () => setFormData({ ...formData, gender: 'female' }) 
        },
        { 
          text: 'Male', 
          onPress: () => setFormData({ ...formData, gender: 'male' }) 
        },
        { 
          text: 'Non-binary', 
          onPress: () => setFormData({ ...formData, gender: 'non-binary' }) 
        },
        { 
          text: 'Prefer not to say', 
          onPress: () => setFormData({ ...formData, gender: 'prefer-not-to-say' }) 
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={commonStyles.header}>
          <View style={commonStyles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={commonStyles.logoIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={commonStyles.appTitle}>Join RideShare</Text>
          <Text style={commonStyles.appSubtitle}>Student carpooling made easy</Text>
        </View>

        <View style={[commonStyles.card, { marginHorizontal: 20 }]}>
          <View style={{ marginBottom: 24 }}>
            <Text style={commonStyles.cardTitle}>Create Account</Text>
            <Text style={commonStyles.cardSubtitle}>
              Verify your student status to get started
            </Text>
          </View>

          <View style={commonStyles.scanBox}>
            <View style={commonStyles.scanHeader}>
              <View style={commonStyles.scanIcon} />
              <Text style={commonStyles.scanTitle}>Student Library Card</Text>
            </View>
            <TouchableOpacity
              style={commonStyles.scanButton}
              onPress={handleScanCard}
            >
              <Text style={commonStyles.scanButtonText}>Scan Library Card</Text>
            </TouchableOpacity>
            <Text style={commonStyles.scanHint}>Optional - Auto-fills your details</Text>
          </View>

          <AuthInput
            label="Full Name *"
            placeholder="John Smith"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            error={errors.fullName}
            icon={<UserIcon />}
          />

          <AuthInput
            label="University Email *"
            placeholder="you@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            icon={<EmailIcon />}
          />
          <Text style={{ fontSize: 12, color: colors.textLight, marginTop: -12, marginBottom: 8 }}>
            We'll send a verification link to confirm you're a student
          </Text>

          <AuthInput
            label="Course/Major *"
            placeholder="Computer Science"
            value={formData.course}
            onChangeText={(text) => setFormData({ ...formData, course: text })}
            error={errors.course}
            icon={<HatIcon />}
          />

          <View style={commonStyles.row}>
            <View style={commonStyles.halfWidth}>
              <AuthInput
                label="Age *"
                placeholder="21"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                error={errors.age}
                containerStyle={{ marginRight: 8 }}
                icon={<CalendarIcon />}
              />
            </View>

            <View style={commonStyles.halfWidth}>
              <AuthInput
                label="Gender *"
                value={formData.gender}
                onFocus={showGenderPicker}
                showSoftInputOnFocus={false}
                error={errors.gender}
                icon={<GenderIcon />}
              />
            </View>
          </View>

          <View style={commonStyles.checkboxContainer}>
            <CheckBox
              value={acceptedTerms}
              onValueChange={setAcceptedTerms}
              boxType="square"
              style={commonStyles.checkbox}
              tintColor={colors.borderColor}
              onCheckColor={colors.white}
              onFillColor={colors.primary}
              onTintColor={colors.primary}
            />
            <Text style={commonStyles.checkboxLabel}>
              I agree to the{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>, and
              confirm I am a university student
            </Text>
          </View>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              { opacity: acceptedTerms ? 1 : 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={!acceptedTerms}
          >
            <Text style={commonStyles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={commonStyles.footer}>
            <Text style={commonStyles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={commonStyles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SignUpScreen;
