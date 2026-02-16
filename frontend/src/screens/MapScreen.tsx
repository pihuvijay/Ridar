import React, { useState } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";

interface MapScreenProps {
  onViewRideGroups?: () => void;
  onCreateRideGroup?: () => void;
  onCenterMap?: () => void;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export const MapScreen = ({
  onViewRideGroups,
  onCreateRideGroup,
  onCenterMap,
  onMenuPress,
  onProfilePress,
}: MapScreenProps): JSX.Element => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Ride</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          accessibilityLabel="User profile: sofiaijaz05"
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>sofiaijaz05</Text>
        </TouchableOpacity>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Map View</Text>
        </View>

        {/* Center Location Button */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={onCenterMap}
          accessibilityLabel="Center map on current location"
        >
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>

        {/* Location Input Card */}
        <View style={styles.locationCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you?"
              placeholderTextColor="#0a0a0a80"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              accessibilityLabel="Pickup location"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>🎯</Text>
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor="#0a0a0a80"
              value={dropoffLocation}
              onChangeText={setDropoffLocation}
              accessibilityLabel="Dropoff location"
            />
          </View>
        </View>
      </View>

      {/* Action Panel */}
      <View style={styles.actionPanel}>
        <TouchableOpacity
          style={styles.viewGroupsButton}
          onPress={onViewRideGroups}
          accessibilityLabel="View Available Ride Groups"
        >
          <Text style={styles.viewGroupsIcon}>👥</Text>
          <Text style={styles.viewGroupsText}>View Available Ride Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={onCreateRideGroup}
          accessibilityLabel="Create New Ride Group"
        >
          <Text style={styles.createGroupText}>Create New Ride Group</Text>
        </TouchableOpacity>

        <Text style={styles.availabilityText}>
          3 ride groups available near you
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: "#1d2838",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d2838",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#155dfc",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 16,
    color: "#354152",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#d1d5db",
    position: "relative",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d1d5db",
  },
  mapPlaceholderText: {
    fontSize: 24,
    color: "#6b7280",
  },
  centerButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerButtonText: {
    fontSize: 20,
  },
  locationCard: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 297,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    gap: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0a0a0a",
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#0000001a",
  },
  actionPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#0000001a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  viewGroupsButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewGroupsIcon: {
    fontSize: 18,
  },
  viewGroupsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createGroupButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.64,
    borderColor: "#155cfb",
    alignItems: "center",
    justifyContent: "center",
  },
  createGroupText: {
    color: "#155cfb",
    fontSize: 16,
    fontWeight: "600",
  },
  availabilityText: {
    fontSize: 16,
    color: "#495565",
    textAlign: "center",
    marginTop: 4,
  },
});
