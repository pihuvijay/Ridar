import React, { useState } from "react";
import { JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

interface SignUpPageProps {
  onSignIn?: () => void;
  onCreateAccount?: () => void;
}

export const SignUpPage = ({
  onSignIn,
  onCreateAccount,
}: SignUpPageProps): JSX.Element => {
  const [formData, setFormData] = useState({
    fullName: "",
    courseMajor: "",
    age: "",
    gender: "",
    email: "",
    agreedToTerms: false,
  });

  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenderSelect = (selectedGender: string) => {
    handleInputChange("gender", selectedGender);
    setGenderDropdownVisible(false);
  };

  const validateEmail = (email: string): boolean => {
    return email.endsWith(".ac.uk");
  };

  const handleVerifyEmail = () => {
    if (validateEmail(formData.email)) {
      setEmailVerified(true);
      console.log("Email verified:", formData.email);
    } else {
      console.log("Invalid email. Must end in .ac.uk");
      setEmailVerified(false);
    }
  };

  const handleCreateAccount = () => {
    if (isFormValid && emailVerified) {
      console.log("Create account:", formData);
      if (onCreateAccount) onCreateAccount();
    } else {
      console.log("Form is not valid or email not verified");
    }
  };

  const handleSignIn = () => {
    console.log("Navigate to sign in");
    if (onSignIn) onSignIn();
  };

  const isFormValid =
    formData.fullName &&
    formData.courseMajor &&
    formData.age &&
    formData.gender &&
    formData.email &&
    formData.agreedToTerms;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, "#2d7a52"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* Logo placeholder - replace with actual image */}
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>R</Text>
              </View>
            </View>

            <Text style={styles.headerTitle}>Join Ridar</Text>
            <Text style={styles.headerSubtitle}>Student carpooling made easy</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>
              Verify your student email to get started
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name and Course/Major Row */}
              <View style={styles.formRow}>
                {/* Full Name */}
                <View style={styles.formColumn}>
                  <Text style={styles.label}>Full Name *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Smith"
                      placeholderTextColor={COLORS.textSecondary}
                      value={formData.fullName}
                      onChangeText={(value) =>
                        handleInputChange("fullName", value)
                      }
                      accessibilityLabel="Full Name"
                    />
                  </View>
                </View>

                {/* Course/Major */}
                <View style={styles.formColumn}>
                  <Text style={styles.label}>Course/Major *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📚</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Computer Science"
                      placeholderTextColor={COLORS.textSecondary}
                      value={formData.courseMajor}
                      onChangeText={(value) =>
                        handleInputChange("courseMajor", value)
                      }
                      accessibilityLabel="Course/Major"
                    />
                  </View>
                </View>
              </View>

              {/* Age and Gender Row */}
              <View style={styles.formRow}>
                {/* Age */}
                <View style={styles.formColumn}>
                  <Text style={styles.label}>Age *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🎂</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="21"
                      placeholderTextColor={COLORS.textSecondary}
                      value={formData.age}
                      onChangeText={(value) =>
                        handleInputChange("age", value)
                      }
                      keyboardType="number-pad"
                      accessibilityLabel="Age"
                    />
                  </View>
                </View>

                {/* Gender */}
                <View style={styles.formColumn}>
                  <Text style={styles.label}>Gender *</Text>
                  <TouchableOpacity
                    style={styles.genderInputContainer}
                    onPress={() => setGenderDropdownVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.genderInputText}>
                      {formData.gender || "Select Gender"}
                    </Text>
                    <Text style={styles.genderDropdownIcon}>▼</Text>
                  </TouchableOpacity>

                  {/* Gender Dropdown Modal */}
                  <Modal
                    visible={genderDropdownVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setGenderDropdownVisible(false)}
                  >
                    <Pressable
                      style={styles.genderModalOverlay}
                      onPress={() => setGenderDropdownVisible(false)}
                    >
                      <View style={styles.genderModalContent}>
                        <Text style={styles.genderModalTitle}>Select Gender</Text>
                        {genderOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={styles.genderOption}
                            onPress={() => handleGenderSelect(option)}
                          >
                            <Text
                              style={[
                                styles.genderOptionText,
                                formData.gender === option &&
                                  styles.genderOptionSelected,
                              ]}
                            >
                              {option}
                              {formData.gender === option && " ✓"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.genderCloseButton}
                          onPress={() => setGenderDropdownVisible(false)}
                        >
                          <Text style={styles.genderCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  </Modal>
                </View>
              </View>

              {/* Email with Verify Button */}
              <View style={styles.emailSection}>
                <Text style={styles.label}>University Email * (must end in .ac.uk)</Text>
                <View style={styles.emailInputWrapper}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="your.name@university.ac.uk"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => {
                      handleInputChange("email", value);
                      setEmailVerified(false);
                    }}
                    keyboardType="email-address"
                    accessibilityLabel="University Email"
                  />
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      emailVerified && styles.verifyButtonVerified,
                    ]}
                    onPress={handleVerifyEmail}
                    disabled={emailVerified}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.verifyButtonText,
                        emailVerified && styles.verifyButtonTextVerified,
                      ]}
                    >
                      {emailVerified ? "✓ Verified" : "Verify"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {!emailVerified && formData.email && !formData.email.endsWith(".ac.uk") && (
                  <Text style={styles.errorText}>
                    Email must end in .ac.uk
                  </Text>
                )}
                {emailVerified && (
                  <Text style={styles.successText}>
                    Email verified successfully
                  </Text>
                )}
              </View>

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    handleInputChange("agreedToTerms", !formData.agreedToTerms)
                  }
                >
                  <Text style={styles.checkboxText}>
                    {formData.agreedToTerms ? "☑️" : "☐"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I agree to the Terms of Service and Privacy Policy, and
                  confirm I am a university student
                </Text>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid && styles.createButtonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>
                  Create Account & Connect Uber
                </Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account?</Text>
                <TouchableOpacity onPress={handleSignIn}>
                  <Text style={styles.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 8,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 11.99,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.95,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 38,
    paddingHorizontal: 10,
    gap: 8,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
  },
  emailSection: {
    gap: 8,
  },
  emailInputWrapper: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  emailInput: {
    flex: 1,
    borderWidth: 0.95,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 38,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  genderInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.95,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 38,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
  },
  genderInputText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "400",
    flex: 1,
  },
  genderDropdownIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    minWidth: 87,
  },
  verifyButtonVerified: {
    backgroundColor: COLORS.success,
  },
  verifyButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  verifyButtonTextVerified: {
    color: "#ffffff",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: "#0ea574",
    marginTop: 4,
  },
  genderModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  genderModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
    maxWidth: 320,
    gap: 8,
  },
  genderModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginBottom: 4,
  },
  genderOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  genderOptionSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  genderCloseButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  genderCloseButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 18,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: "#d1d5dc",
    opacity: 0.6,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    gap: 4,
  },
  signInText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
