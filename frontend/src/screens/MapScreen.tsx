import React, { useState, useRef } from "react";
import React, { useState, useRef } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COLORS } from "../theme/colors";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface MapScreenProps {
  onViewRideGroups?: () => void;
  onCreateRideGroup?: () => void;
  onMenuPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
  userName?: string;
}

export const MapScreen = ({
  onViewRideGroups,
  onCreateRideGroup,
  onMenuPress,
  onSettingsPress,
  onProfilePress,
  userName = "Rhys Leonard",
}: MapScreenProps): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [endSuggestions, setEndSuggestions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [activeSearchField, setActiveSearchField] = useState<"start" | "end" | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);

  // Sample ride group markers - replace with real data from your API
  const rideGroups: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
  }> = [];


  // Default map region (San Francisco Bay Area)
  const defaultRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [endSuggestions, setEndSuggestions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [activeSearchField, setActiveSearchField] = useState<"start" | "end" | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);

  // Sample ride group markers - replace with real data from your API
  const rideGroups: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
  }> = [];


  // Default map region (San Francisco Bay Area)
  const defaultRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuPress) onMenuPress();
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
    if (onSettingsPress) onSettingsPress();
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    if (onProfilePress) onProfilePress();
  };

  const handleViewRideGroups = () => {
    console.log("View Available Ride Groups clicked");
    if (onViewRideGroups) onViewRideGroups();
  };

  const handleCreateRideGroup = () => {
    console.log("Create New Ride Group clicked");
    if (onCreateRideGroup) onCreateRideGroup();
  };

  const geocodeLocation = async (location: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        Alert.alert("Location Not Found", "Could not find '" + location + "'. Try a different search.");
        return null;
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to search location");
      return null;
    }
  };

  const fetchPlacesPredictions = async (input: string, isStartField: boolean) => {
    if (!input || input.length < 2) {
      if (isStartField) {
        setStartSuggestions([]);
      } else {
        setEndSuggestions([]);
      }
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
        "input=" + encodeURIComponent(input) +
        "&key=" + GOOGLE_MAPS_API_KEY
      );

      const data = await response.json();

      const suggestions = data.predictions?.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
      })) || [];

      if (isStartField) {
        setStartSuggestions(suggestions);
      } else {
        setEndSuggestions(suggestions);
      }
    } catch (error) {
      console.log("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePlaceSelection = async (placeId: string, description: string, isStartField: boolean) => {
    try {
      const response = await fetch(
        "https://maps.googleapis.com/maps/api/place/details/json?" +
        "place_id=" + encodeURIComponent(placeId) +
        "&fields=geometry" +
        "&key=" + GOOGLE_MAPS_API_KEY
      );

      const data = await response.json();

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const coords = { latitude: lat, longitude: lng };

        if (isStartField) {
          setStartLocation(description);
          setStartCoords(coords);
          setStartSuggestions([]);
        } else {
          setEndLocation(description);
          setEndCoords(coords);
          setEndSuggestions([]);
        }
      }
    } catch (error) {
      console.log("Error getting place details:", error);
    }
  };

  const handleLocationInputChange = (text: string, isStartField: boolean) => {
    if (isStartField) {
      setStartLocation(text);
    } else {
      setEndLocation(text);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPlacesPredictions(text, isStartField);
    }, 300);
  };

  const handleSearchLocations = async () => {
    if (!startLocation && !endLocation) {
      Alert.alert("Error", "Please enter at least one location");
      return;
    }

    setIsSearching(true);

    try {
      let newStart = startCoords;
      let newEnd = endCoords;

      if (startLocation && !startCoords) {
        const start = await geocodeLocation(startLocation);
        if (start) {
          setStartCoords(start);
          newStart = start;
        }
      }

      if (endLocation && !endCoords) {
        const end = await geocodeLocation(endLocation);
        if (end) {
          setEndCoords(end);
          newEnd = end;
        }
      }

      setShowSearchPanel(false);

      // Fit map to show both markers
      setTimeout(() => {
        if (newStart && newEnd) {
          mapRef.current?.fitToCoordinates(
            [newStart, newEnd],
            { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
          );
        } else if (newStart) {
          mapRef.current?.animateToRegion({
            ...newStart,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);
        } else if (newEnd) {
          mapRef.current?.animateToRegion({
            ...newEnd,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);
        }
      }, 300);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearLocations = () => {
    setStartLocation("");
    setEndLocation("");
    setStartCoords(null);
    setEndCoords(null);
  };

  const geocodeLocation = async (location: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        Alert.alert("Location Not Found", "Could not find '" + location + "'. Try a different search.");
        return null;
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to search location");
      return null;
    }
  };

  const fetchPlacesPredictions = async (input: string, isStartField: boolean) => {
    if (!input || input.length < 2) {
      if (isStartField) {
        setStartSuggestions([]);
      } else {
        setEndSuggestions([]);
      }
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
        "input=" + encodeURIComponent(input) +
        "&key=" + GOOGLE_MAPS_API_KEY
      );

      const data = await response.json();

      const suggestions = data.predictions?.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
      })) || [];

      if (isStartField) {
        setStartSuggestions(suggestions);
      } else {
        setEndSuggestions(suggestions);
      }
    } catch (error) {
      console.log("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePlaceSelection = async (placeId: string, description: string, isStartField: boolean) => {
    try {
      const response = await fetch(
        "https://maps.googleapis.com/maps/api/place/details/json?" +
        "place_id=" + encodeURIComponent(placeId) +
        "&fields=geometry" +
        "&key=" + GOOGLE_MAPS_API_KEY
      );

      const data = await response.json();

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const coords = { latitude: lat, longitude: lng };

        if (isStartField) {
          setStartLocation(description);
          setStartCoords(coords);
          setStartSuggestions([]);
        } else {
          setEndLocation(description);
          setEndCoords(coords);
          setEndSuggestions([]);
        }
      }
    } catch (error) {
      console.log("Error getting place details:", error);
    }
  };

  const handleLocationInputChange = (text: string, isStartField: boolean) => {
    if (isStartField) {
      setStartLocation(text);
    } else {
      setEndLocation(text);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPlacesPredictions(text, isStartField);
    }, 300);
  };

  const handleSearchLocations = async () => {
    if (!startLocation && !endLocation) {
      Alert.alert("Error", "Please enter at least one location");
      return;
    }

    setIsSearching(true);

    try {
      let newStart = startCoords;
      let newEnd = endCoords;

      if (startLocation && !startCoords) {
        const start = await geocodeLocation(startLocation);
        if (start) {
          setStartCoords(start);
          newStart = start;
        }
      }

      if (endLocation && !endCoords) {
        const end = await geocodeLocation(endLocation);
        if (end) {
          setEndCoords(end);
          newEnd = end;
        }
      }

      setShowSearchPanel(false);

      // Fit map to show both markers
      setTimeout(() => {
        if (newStart && newEnd) {
          mapRef.current?.fitToCoordinates(
            [newStart, newEnd],
            { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
          );
        } else if (newStart) {
          mapRef.current?.animateToRegion({
            ...newStart,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);
        } else if (newEnd) {
          mapRef.current?.animateToRegion({
            ...newEnd,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);
        }
      }, 300);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearLocations = () => {
    setStartLocation("");
    setEndLocation("");
    setStartCoords(null);
    setEndCoords(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { zIndex: 10 }]} pointerEvents="auto">
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Ride</Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsClick}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfileClick}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <LinearGradient
              colors={["#1B5E20", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
            </LinearGradient>
            <Text style={styles.userName}>{userName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Panel Modal */}
      <Modal
        visible={showSearchPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchPanel(false)}
      >
        <SafeAreaView style={styles.searchPanelContainer}>
          <ScrollView style={styles.searchPanelContent}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchHeaderTitle}>Search Locations</Text>
              <TouchableOpacity onPress={() => setShowSearchPanel(false)}>
                <Text style={styles.searchCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Starting Point</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter starting location"
                placeholderTextColor="#999"
                value={startLocation}
                onChangeText={(text) => handleLocationInputChange(text, true)}
                onFocus={() => setActiveSearchField("start")}
              />
              {activeSearchField === "start" && startSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {loadingSuggestions ? (
                    <ActivityIndicator size="small" color="#155dfc" />
                  ) : (
                    startSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handlePlaceSelection(suggestion.placeId, suggestion.description, true)}
                      >
                        <Text style={styles.suggestionText}>📍 {suggestion.description}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Destination</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter destination"
                placeholderTextColor="#999"
                value={endLocation}
                onChangeText={(text) => handleLocationInputChange(text, false)}
                onFocus={() => setActiveSearchField("end")}
              />
              {activeSearchField === "end" && endSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {loadingSuggestions ? (
                    <ActivityIndicator size="small" color="#155dfc" />
                  ) : (
                    endSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handlePlaceSelection(suggestion.placeId, suggestion.description, false)}
                      >
                        <Text style={styles.suggestionText}>📍 {suggestion.description}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchLocations}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Apply</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearLocations}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Location Search Overlay */}
      {!showSearchPanel && (startCoords || endCoords) && (
        <View style={styles.locationOverlay}>
          <Text style={styles.locationOverlayText}>
            {startLocation && endLocation
              ? startLocation + " -> " + endLocation
              : startLocation
              ? "From: " + startLocation
              : "To: " + endLocation}
          </Text>
          <View style={styles.locationOverlayButtons}>
            <TouchableOpacity style={styles.editLocationButton} onPress={() => setShowSearchPanel(true)}>
              <Text style={styles.editLocationButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearLocationButton} onPress={handleClearLocations}>
              <Text style={styles.clearLocationButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Search Panel Modal */}
      <Modal
        visible={showSearchPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchPanel(false)}
      >
        <SafeAreaView style={styles.searchPanelContainer}>
          <ScrollView style={styles.searchPanelContent}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchHeaderTitle}>Search Locations</Text>
              <TouchableOpacity onPress={() => setShowSearchPanel(false)}>
                <Text style={styles.searchCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Starting Point</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter starting location"
                placeholderTextColor="#999"
                value={startLocation}
                onChangeText={(text) => handleLocationInputChange(text, true)}
                onFocus={() => setActiveSearchField("start")}
              />
              {activeSearchField === "start" && startSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {loadingSuggestions ? (
                    <ActivityIndicator size="small" color="#155dfc" />
                  ) : (
                    startSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handlePlaceSelection(suggestion.placeId, suggestion.description, true)}
                      >
                        <Text style={styles.suggestionText}>📍 {suggestion.description}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Destination</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter destination"
                placeholderTextColor="#999"
                value={endLocation}
                onChangeText={(text) => handleLocationInputChange(text, false)}
                onFocus={() => setActiveSearchField("end")}
              />
              {activeSearchField === "end" && endSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {loadingSuggestions ? (
                    <ActivityIndicator size="small" color="#155dfc" />
                  ) : (
                    endSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handlePlaceSelection(suggestion.placeId, suggestion.description, false)}
                      >
                        <Text style={styles.suggestionText}>📍 {suggestion.description}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchLocations}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Apply</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearLocations}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Location Search Overlay */}
      {!showSearchPanel && (startCoords || endCoords) && (
        <View style={styles.locationOverlay}>
          <Text style={styles.locationOverlayText}>
            {startLocation && endLocation
              ? startLocation + " -> " + endLocation
              : startLocation
              ? "From: " + startLocation
              : "To: " + endLocation}
          </Text>
          <View style={styles.locationOverlayButtons}>
            <TouchableOpacity style={styles.editLocationButton} onPress={() => setShowSearchPanel(true)}>
              <Text style={styles.editLocationButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearLocationButton} onPress={handleClearLocations}>
              <Text style={styles.clearLocationButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleViewRideGroups();
              }}
            >
              <Text style={styles.menuItemText}>View Ride Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleCreateRideGroup();
              }}
            >
              <Text style={styles.menuItemText}>Create Ride Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleSettingsClick();
              }}
            >
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>Close Menu</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Map Area */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        pointerEvents="box-only"
        initialRegion={defaultRegion}
        zoomControlEnabled={true}
        zoomTapEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
      >
        {/* Markers for ride groups */}
        {rideGroups.map((group) => (
          <Marker
            key={group.id}
            coordinate={{
              latitude: group.latitude,
              longitude: group.longitude,
            }}
            title={group.title}
            description={group.description}
            pinColor="#1B5E20"
          />
        ))}

        {/* Marker for start location */}
        {startCoords && (
          <Marker
            coordinate={startCoords}
            title="Start"
            description={startLocation}
            pinColor="#1B5E20"
          />
        )}

        {/* Marker for end location */}
        {endCoords && (
          <Marker
            coordinate={endCoords}
            title="Destination"
            description={endLocation}
            pinColor="#1B5E20"
          />
        )}
      </MapView>

      {/* Footer with Actions */}
      <View style={styles.footer} pointerEvents="auto">
        <TouchableOpacity
          style={styles.searchLocationButton}
          onPress={() => setShowSearchPanel(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.searchLocationButtonIcon}>🔍</Text>
          <Text style={styles.searchLocationButtonText}>Search Locations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewRideGroups}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonIcon}>👥</Text>
          <Text style={styles.primaryButtonText}>View Available Ride Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCreateRideGroup}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Create New Ride Group</Text>
        </TouchableOpacity>

        <Text style={styles.availabilityText}>Use the search feature to find ride groups near you</Text>
        <Text style={styles.availabilityText}>Use the search feature to find ride groups near you</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
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
    backgroundColor: "#ffffff",
  },
  menuIcon: {
    fontSize: 24,
    color: "#1e2939",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e2939",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  userName: {
    fontSize: 14,
    color: "#364153",
    fontWeight: "500",
    maxWidth: 150,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContent: {
    backgroundColor: "#ffffff",
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuItemText: {
    fontSize: 14,
    color: "#364153",
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  mapPlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 32,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  footer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#0000001a",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#1B5E20",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1B5E20",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1B5E20",
    fontSize: 16,
    fontWeight: "600",
  },
  availabilityText: {
    fontSize: 16,
    color: "#4a5565",
    textAlign: "center",
    fontWeight: "500",
  },
  searchLocationButton: {
    backgroundColor: "#1B5E20",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchLocationButtonIcon: {
    fontSize: 18,
  },
  searchLocationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchPanelContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  searchPanelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  searchHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e2939",
  },
  searchCloseButton: {
    fontSize: 24,
    color: "#999",
    fontWeight: "600",
  },
  searchInputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#364153",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1e2939",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
  locationOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  locationOverlayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e2939",
    marginBottom: 12,
  },
  locationOverlayButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editLocationButton: {
    flex: 1,
    backgroundColor: "#155dfc",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  editLocationButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  clearLocationButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  clearLocationButtonText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 200,
    zIndex: 10,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#364153",
  },
});
