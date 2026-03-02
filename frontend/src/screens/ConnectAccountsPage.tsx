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
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { uberService, paymentService } from "../services/api";

interface ConnectAccountsPageProps {
  userName?: string;
  onNavigateHome?: () => void;
}

const AccountCard = ({
  icon,
  title,
  description,
  buttonText,
  onConnect,
  isConnected = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onConnect: () => void;
  isConnected?: boolean;
}) => {
  return (
    <View style={styles.accountCard}>
      <View style={styles.cardContent}>
        {icon}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          <TouchableOpacity
            style={[styles.connectButton, isConnected && styles.connectedButton]}
            onPress={onConnect}
            disabled={isConnected}
            activeOpacity={0.8}
          >
            <Text style={styles.connectButtonIcon}>✓</Text>
            <Text style={styles.connectButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const ConnectAccountsPage = ({
  userName = "User",
  onNavigateHome,
}: ConnectAccountsPageProps): JSX.Element => {
  const { createToken } = useStripe();
  const [uberConnected, setUberConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const handleUberConnect = async () => {
    console.log("Connecting Uber...");
    // In a real app, this would open Uber's OAuth flow
    // For now, we'll simulate it and call the backend
    try {
      // TODO: Implement proper OAuth flow with Uber
      // Get auth URL from backend
      // const authUrlResponse = await uberService.initiateUberAuth();
      
      // For demonstration, simulating the connection
      setTimeout(() => {
        setUberConnected(true);
        Alert.alert("Success", "Uber account connected successfully");
      }, 500);
    } catch (error) {
      Alert.alert("Error", "Failed to connect Uber account");
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!uberConnected) {
      Alert.alert("Error", "Please connect Uber first");
      return;
    }

    if (!cardholderName.trim()) {
      Alert.alert("Error", "Please enter cardholder name");
      return;
    }

    setIsProcessing(true);
    try {
      // Tokenize the card using Stripe SDK
      const { token, error } = await createToken({
        type: "Card",
      });

      if (error) {
        Alert.alert("Card Error", error.message);
        setIsProcessing(false);
        return;
      }

      if (!token) {
        Alert.alert("Error", "Failed to create card token");
        setIsProcessing(false);
        return;
      }

      // Send token to your backend
      // TODO: Replace with actual user ID from auth context
      const userId = "user_123"; // Placeholder - should come from auth context
      const response = await paymentService.addPaymentMethod(
        token.id,
        cardholderName,
        userId
      );

      if (response.success) {
        console.log("Payment method created successfully");
        Alert.alert("Success", "Payment method added successfully");
        if (onNavigateHome) onNavigateHome();
      } else {
        Alert.alert("Error", response.message || "Failed to add payment method. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isPaymentComplete =
    uberConnected &&
    cardholderName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#2B7FFF", "#9810FA"]}
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
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.headerTitle}>Welcome to Ridar, {userName}!</Text>
            <Text style={styles.headerSubtitle}>
              Connect your accounts to get started
            </Text>
          </View>

          {/* Account Cards */}
          <View style={styles.accountsSection}>
            <AccountCard
              icon={
                <View style={styles.iconContainer}>
                  <Text style={styles.uberIcon}>🚗</Text>
                </View>
              }
              title="Uber Account"
              description="Required to book rides for your group"
              buttonText="Connect Uber"
              onConnect={handleUberConnect}
              isConnected={uberConnected}
            />
          </View>

          {/* Payment Method Card */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentIcon}>💳</Text>
              <Text style={styles.paymentTitle}>Add Payment Method</Text>
            </View>
            <Text style={styles.paymentDescription}>
              Enter your card details securely. Your information will be sent to your backend and processed by Stripe.
            </Text>

            {/* Cardholder Name */}
            <View style={styles.paymentInputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name *</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="John Smith"
                placeholderTextColor="#0a0a0a80"
                value={cardholderName}
                onChangeText={setCardholderName}
              />
            </View>

            {/* Stripe Card Field */}
            <View style={styles.paymentInputGroup}>
              <Text style={styles.inputLabel}>Card Details *</Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: "4242 4242 4242 4242",
                }}
                cardStyle={styles.cardField}
                style={styles.cardFieldContainer}
              />
            </View>

            <Text style={styles.securityNote}>
              🔒 Your card data is securely processed by Stripe
            </Text>
          </View>

          {/* Footer Info */}
          <Text style={styles.footerText}>
            Complete all fields to continue
          </Text>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, !isPaymentComplete && styles.continueButtonDisabled]}
            onPress={handleAddPaymentMethod}
            disabled={!isPaymentComplete || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.continueButtonText}>
                {isPaymentComplete ? "Complete Setup" : "Add Payment Method"}
              </Text>
            )}
          </TouchableOpacity>
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
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#daeafe",
    textAlign: "center",
  },
  accountsSection: {
    gap: 16,
    marginBottom: 24,
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#101828",
    justifyContent: "center",
    alignItems: "center",
  },
  uberIcon: {
    fontSize: 24,
  },
  stripeIcon: {
    backgroundColor: "#4f39f6",
  },
  stripeIconText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardTextContainer: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e2939",
  },
  cardDescription: {
    fontSize: 14,
    color: "#4a5565",
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  connectedButton: {
    backgroundColor: "#d1d5dc",
    opacity: 0.6,
  },
  connectButtonIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerText: {
    fontSize: 14,
    color: "#daeafe",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: "#d1d5dc",
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  paymentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 8,
    gap: 16,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  paymentIcon: {
    fontSize: 32,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e2939",
  },
  paymentDescription: {
    fontSize: 14,
    color: "#4a5565",
    lineHeight: 20,
    marginBottom: 8,
  },
  paymentInputGroup: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: "row",
    gap: 12,
  },
  paymentColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#364153",
  },
  paymentInput: {
    borderWidth: 0.95,
    borderColor: "#d1d5dc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0a0a0a",
    height: 44,
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 8,
  },
  cardField: {
    borderColor: "#d1d5dc",
    borderWidth: 0.95,
    borderRadius: 10,
    fontSize: 14,
    placeholderColor: "#0a0a0a80",
    textColor: "#0a0a0a",
    cursorColor: "#155dfc",
  },
  securityNote: {
    fontSize: 12,
    color: "#0ea574",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 8,
  },
});
