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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

interface SignUpPageProps {
  onSignIn?: () => void;
  onCreateAccount?: () => void;
}

export const SignUpPage = ({
  onSignIn,
  onCreateAccount,
}: SignUpPageProps): JSX.Element => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const genderOptions = [
    "Select",
    "Female",
    "Male",
    "Non-binary",
    "Prefer not to say",
  ];

  const handleScanLibraryCard = () => {
    console.log("Scan library card clicked");
  };

  const handleCreateAccount = () => {
    console.log("Create account clicked", {
      fullName,
      email,
      course,
      age,
      gender,
      agreedToTerms,
    });
    if (onCreateAccount) onCreateAccount();
  };

  const handleSignIn = () => {
    if (onSignIn) onSignIn();
    console.log("Navigate to sign in");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#2B7FFF", "#9810FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Join RideShare</Text>
            <Text style={styles.headerSubtitle}>Student carpooling made easy</Text>
          </View>
        </LinearGradient>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>
            Verify your student status to get started
          </Text>

          {/* Library Card Section */}
          <View style={styles.libraryCardSection}>
            <View style={styles.libraryCardHeader}>
              <Text style={styles.libraryCardIcon}>📚</Text>
              <Text style={styles.libraryCardTitle}>Student Library Card</Text>
            </View>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanLibraryCard}
            >
              <Text style={styles.scanButtonText}>Scan Library Card</Text>
            </TouchableOpacity>
            <Text style={styles.scanHelpText}>
              Optional - Auto-fills your details
            </Text>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="John Smith"
                placeholderTextColor="#0a0a0a80"
                value={fullName}
                onChangeText={setFullName}
                accessibilityLabel="Full name"
              />
            </View>
          </View>

          {/* University Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>University Email *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@university.edu"
                placeholderTextColor="#0a0a0a80"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                accessibilityLabel="University email"
              />
            </View>
            <Text style={styles.helpText}>
              We'll send a verification link to confirm you're a student
            </Text>
          </View>

          {/* Course Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course/Major *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📖</Text>
              <TextInput
                style={styles.input}
                placeholder="Computer Science"
                placeholderTextColor="#0a0a0a80"
                value={course}
                onChangeText={setCourse}
                accessibilityLabel="Course or major"
              />
            </View>
          </View>

          {/* Age and Gender Row */}
          <View style={styles.rowContainer}>
            {/* Age Input */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Age *</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🎂</Text>
                <TextInput
                  style={styles.input}
                  placeholder="21"
                  placeholderTextColor="#0a0a0a80"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  accessibilityLabel="Age"
                />
              </View>
            </View>

            {/* Gender Picker */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={setGender}
                  style={styles.picker}
                >
                  {genderOptions.map((option) => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option === "Select" ? "" : option}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <Text style={styles.checkboxText}>
                {agreedToTerms ? "☑️" : "☐"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy, and confirm I
              am a university student
            </Text>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              !agreedToTerms && styles.createButtonDisabled,
            ]}
            onPress={handleCreateAccount}
            disabled={!agreedToTerms}
            accessibilityLabel="Create account"
          >
            <Text style={styles.createButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInPrompt}>
            <Text style={styles.signInPromptText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 24,
  },
  headerGradient: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#daeafe",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d2838",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#495565",
    marginBottom: 16,
  },
  libraryCardSection: {
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1.66,
    borderColor: "#8dc5ff",
    marginBottom: 8,
    gap: 12,
  },
  libraryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  libraryCardIcon: {
    fontSize: 18,
  },
  libraryCardTitle: {
    fontSize: 16,
    color: "#354152",
    fontWeight: "500",
  },
  scanButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scanHelpText: {
    fontSize: 12,
    color: "#697282",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#354152",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.83,
    borderColor: "#d0d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0a0a0a",
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 12,
    color: "#697282",
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 0.83,
    borderColor: "#d0d5db",
    borderRadius: 10,
    overflow: "hidden",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    height: 50,
    color: "#0a0a0a",
  },
  termsContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#495565",
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#0000001a",
    gap: 4,
  },
  signInPromptText: {
    fontSize: 14,
    color: "#495565",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#155cfb",
    textDecorationLine: "underline",
  },
});
