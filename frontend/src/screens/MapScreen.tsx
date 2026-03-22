import React, { useState, useRef, useEffect } from "react";
import type { JSX } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSearchContext } from "../contexts/SearchContexts";
import { useTheme } from "../contexts/ThemeContext";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const decodePolyline = (t: string) => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < t.length) {
        let b: number;
        let shift = 0;
        let result = 0;

        do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
};

interface MapScreenProps {
    onViewRideGroups?: (params?: any) => void;
    onCreateRideGroup?: () => void;
    onSettingsPress?: () => void;
    userName?: string;
}

export const MapScreen = ({
    onViewRideGroups,
    onCreateRideGroup,
    onSettingsPress,
}: MapScreenProps): JSX.Element => {
    const { colors } = useTheme();
    const {
        startLocation: ctxStart,
        endLocation: ctxEnd,
        startCoords: ctxStartCoords,
        endCoords: ctxEndCoords,
        setSearch,
    } = useSearchContext();
    const [startLocation, setStartLocation] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [startCoords, setStartCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [endCoords, setEndCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeCoords, setRouteCoords] = useState<
        { latitude: number; longitude: number }[]
    >([]);
    const [showSearchPanel, setShowSearchPanel] = useState(false);

    // Preload from context when opening search panel
    useEffect(() => {
        if (showSearchPanel) {
            if (ctxStart) setStartLocation(ctxStart);
            if (ctxEnd) setEndLocation(ctxEnd);
            if (ctxStartCoords) setStartCoords(ctxStartCoords);
            if (ctxEndCoords) setEndCoords(ctxEndCoords);
        }
    }, [showSearchPanel, ctxStart, ctxEnd, ctxStartCoords, ctxEndCoords]);

    const [startSuggestions, setStartSuggestions] = useState<
        Array<{ placeId: string; description: string }>
    >([]);
    const [endSuggestions, setEndSuggestions] = useState<
        Array<{ placeId: string; description: string }>
    >([]);
    const [activeSearchField, setActiveSearchField] = useState<
        "start" | "end" | null
    >(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mapRef = useRef<MapView>(null);

    const defaultRegion = {
        latitude: 51.3813,
        longitude: -2.359,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
    };

    useEffect(() => {
        const fetchDirections = async () => {
            if (!startCoords || !endCoords || !GOOGLE_MAPS_API_KEY) return;

            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
                );
                const data = await response.json();

                if (data.status === "OK" && data.routes.length > 0) {
                    const points = decodePolyline(
                        data.routes[0].overview_polyline.points,
                    );
                    setRouteCoords(points);

                    mapRef.current?.fitToCoordinates(points, {
                        edgePadding: {
                            top: 50,
                            right: 50,
                            bottom: 50,
                            left: 50,
                        },
                        animated: true,
                    });
                }
            } catch (error) {
                console.error("Error fetching directions:", error);
            }
        };

        fetchDirections();
    }, [startCoords, endCoords]);

    const handleClearLocations = () => {
        setStartLocation("");
        setEndLocation("");
        setStartCoords(null);
        setEndCoords(null);
        setRouteCoords([]);
        setStartSuggestions([]);
        setEndSuggestions([]);
        setActiveSearchField(null);
    };

    const handleLocationInputChange = (text: string, isStart: boolean) => {
        if (isStart) setStartLocation(text);
        else setEndLocation(text);

        if (!text.trim() || !GOOGLE_MAPS_API_KEY) {
            if (isStart) setStartSuggestions([]);
            else setEndSuggestions([]);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setLoadingSuggestions(true);

            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}`,
                );
                const data = await response.json();

                if (data.status === "OK") {
                    const suggestions = data.predictions.map((p: any) => ({
                        placeId: p.place_id,
                        description: p.description,
                    }));

                    if (isStart) setStartSuggestions(suggestions);
                    else setEndSuggestions(suggestions);
                }
            } catch (error) {
                console.error("Error fetching places:", error);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 500);
    };

    const handlePlaceSelection = async (
        placeId: string,
        description: string,
        isStart: boolean,
    ) => {
        if (isStart) {
            setStartLocation(description);
            setStartSuggestions([]);
        } else {
            setEndLocation(description);
            setEndSuggestions([]);
        }
        setActiveSearchField(null);

        if (!GOOGLE_MAPS_API_KEY) return;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`,
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                const coords = {
                    latitude: location.lat,
                    longitude: location.lng,
                };

                if (isStart) setStartCoords(coords);
                else setEndCoords(coords);

                if ((isStart && !endCoords) || (!isStart && !startCoords)) {
                    mapRef.current?.animateToRegion(
                        {
                            ...coords,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        },
                        1000,
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            Alert.alert("Error", "Could not get location coordinates.");
        }
    };

    const navigateToRideGroupsWithPreload = () => {
        // save into context
        setSearch(startLocation, endLocation, startCoords, endCoords);

        const params = {
            preloadedRoute: {
                startLocation,
                endLocation,
                startCoords,
                endCoords,
            },
            stamp: Date.now(),
        };

        onViewRideGroups?.(params);
    };

    if (showSearchPanel) {
        return (
            <SafeAreaView style={[styles.searchScreenContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchHeader, { backgroundColor: colors.background }]}> 
                    <Text style={[styles.searchHeaderTitle, { color: colors.text }]}>Search Locations</Text>
                    <TouchableOpacity onPress={() => setShowSearchPanel(false)}>
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.searchPanelContent}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.searchInputContainer}>
                        <Text style={[styles.searchLabel, { color: colors.text }]}>Starting Point</Text>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
                            placeholder="Enter starting location"
                            placeholderTextColor={colors.textSecondary}
                            value={startLocation}
                            onChangeText={(text) =>
                                handleLocationInputChange(text, true)
                            }
                            onFocus={() => setActiveSearchField("start")}
                        />
                        {activeSearchField === "start" &&
                            startSuggestions.length > 0 && (
                                <View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
                                    {loadingSuggestions ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                            style={{ padding: 10 }}
                                        />
                                    ) : (
                                        startSuggestions.map(
                                            (suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionItem}
                                                    onPress={() =>
                                                        handlePlaceSelection(
                                                            suggestion.placeId,
                                                            suggestion.description,
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                                                        {suggestion.description}
                                                    </Text>
                                                </TouchableOpacity>
                                            ),
                                        )
                                    )}
                                </View>
                            )}
                    </View>

                    <View style={styles.searchInputContainer}>
                        <Text style={[styles.searchLabel, { color: colors.text }]}>Destination</Text>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
                            placeholder="Enter destination"
                            placeholderTextColor={colors.textSecondary}
                            value={endLocation}
                            onChangeText={(text) =>
                                handleLocationInputChange(text, false)
                            }
                            onFocus={() => setActiveSearchField("end")}
                        />
                        {activeSearchField === "end" &&
                            endSuggestions.length > 0 && (
                                <View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
                                    {loadingSuggestions ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                            style={{ padding: 10 }}
                                        />
                                    ) : (
                                        endSuggestions.map(
                                            (suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionItem}
                                                    onPress={() =>
                                                        handlePlaceSelection(
                                                            suggestion.placeId,
                                                            suggestion.description,
                                                            false,
                                                        )
                                                    }
                                                >
                                                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                                                        {suggestion.description}
                                                    </Text>
                                                </TouchableOpacity>
                                            ),
                                        )
                                    )}
                                </View>
                            )}
                    </View>

                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            setSearch(startLocation, endLocation, startCoords, endCoords);
                            setShowSearchPanel(false);
                        }}
                    >
                        <Text style={[styles.searchButtonText, { color: colors.background }]}>Apply</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.clearButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                        onPress={handleClearLocations}
                    >
                        <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.cardBackground }]}> 
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Find a Ride</Text>
                </View>

                <View style={styles.headerNav}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => onSettingsPress?.()}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.mapSection, { backgroundColor: colors.background }]}> 
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={defaultRegion}
                    zoomControlEnabled={true}
                >
                    {routeCoords.length > 0 && (
                        <Polyline
                            coordinates={routeCoords}
                            strokeWidth={4}
                            strokeColor="#155dfc"
                        />
                    )}

                    {startCoords && (
                        <Marker
                            coordinate={startCoords}
                            title="Start"
                            description={startLocation}
                            pinColor="#1B5E20"
                        />
                    )}

                    {endCoords && (
                        <Marker
                            coordinate={endCoords}
                            title="Destination"
                            description={endLocation}
                            pinColor="#f44336"
                        />
                    )}
                </MapView>

                {!showSearchPanel && (startLocation || endLocation) && (
                    <View style={styles.routeCardOverlay}>
                        <View style={[styles.routeCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
                            <View style={styles.routeCardTop}>
                                <View style={styles.routeTextBlock}>
                                    <Text style={styles.routeLabel}>Route</Text>
                                    <Text style={styles.routeMainText} numberOfLines={2}>
                                        {startLocation && endLocation
                                            ? `${startLocation} → ${endLocation}`
                                            : startLocation
                                                ? `From: ${startLocation}`
                                                : `To: ${endLocation}`}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.routeIconButton, { backgroundColor: colors.primaryLight }]}
                                    onPress={() => setShowSearchPanel(true)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.routeCardActions}>
                                <TouchableOpacity
                                    style={[styles.routePrimaryButton, { backgroundColor: '#1B5E20' }]}
                                    onPress={() => {
                                        // Save current search to context and navigate with params
                                        setSearch(startLocation, endLocation, startCoords, endCoords);
                                        navigateToRideGroupsWithPreload();
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={[styles.routePrimaryButtonText, { color: '#fff' }]}>Find Ride</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.routePrimaryButton, { backgroundColor: '#1B5E20' }]}
                                    onPress={() => {
                                        // Save current search to context then open create group flow
                                        setSearch(startLocation, endLocation, startCoords, endCoords);
                                        if (typeof onCreateRideGroup === 'function') {
                                            onCreateRideGroup();
                                        }
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={[styles.routePrimaryButtonText, { color: '#fff' }]}>Create Group</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                    <View style={styles.floatingActions}>
                    <TouchableOpacity
                        style={[styles.searchLocationButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowSearchPanel(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.searchLocationButtonText, { color: colors.background }]}>Search Locations</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomActionRow}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
                            onPress={navigateToRideGroupsWithPreload}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ride Groups</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
                            onPress={() => onCreateRideGroup?.()}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Create Ride</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    searchScreenContainer: {
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
    headerTitle: {
        fontSize: 20,
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
    mapSection: {
        flex: 1,
        position: "relative",
        backgroundColor: "ffffff",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: "#f9fafb",
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
        backgroundColor: "#1B5E20",
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
    routeCardOverlay: {
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 20,
    },
    routeCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    routeCardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    routeTextBlock: {
        flex: 1,
    },
    routeLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    routeMainText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e2939",
        lineHeight: 21,
    },
    routeIconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
    },
    routeCardActions: {
        flexDirection: "row",
        gap: 10,
    },
    routePrimaryButton: {
        flex: 1,
        backgroundColor: "#155dfc",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    routePrimaryButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
    },
    routeSecondaryButton: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    routeSecondaryButtonText: {
        color: "#4b5563",
        fontSize: 13,
        fontWeight: "600",
    },
    floatingActions: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 8,
        zIndex: 20,
        gap: 12,
    },
    searchLocationButton: {
        backgroundColor: "#1B5E20",
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchLocationButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    bottomActionRow: {
        flexDirection: "row",
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#1B5E20",
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    secondaryButtonText: {
        color: "#1B5E20",
        fontSize: 16,
        fontWeight: "600",
    },
});