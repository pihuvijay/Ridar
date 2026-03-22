import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { partiesService } from "../services/api";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

interface RideCard {
    id: string;
    destination: string;
    pickup: string;
    price: number;
    leavingIn: number;
    currentPassengers: number;
    maxPassengers: number;
    driverName: string;
    driverInitial: string;
    driverTrips: number;
    tags: string[];
    pickupLat?: number;
    pickupLng?: number;
    destinationLat?: number;
    destinationLng?: number;
}

interface RideGroupsScreenProps {
    onBack: () => void;
    userName: string;
    onJoinRide: (rideGroup: RideCard) => void;
    onViewSettings: () => void;
    onViewProfile: () => void;
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type PlaceSuggestion = {
    placeId: string;
    description: string;
    mainText?: string;
    secondaryText?: string;
};

type SelectedPlace = {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const RideGroupsScreen: React.FC<RideGroupsScreenProps> = ({
    onBack,
    userName,
    onJoinRide,
    onViewSettings,
    onViewProfile,
}) => {
    const { colors } = useTheme();
    const route = useRoute();
    const navigation = useNavigation();

    const [currentLocation, setCurrentLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [rides, setRides] = useState<RideCard[]>([]);
    const [isLoadingRides, setIsLoadingRides] = useState(false);

    const [selectedPickupPlace, setSelectedPickupPlace] = useState<SelectedPlace | null>(null);
    const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<SelectedPlace | null>(null);
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

    const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
    const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<PlaceSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Forces the state to update whenever the screen comes into focus with new params
    useFocusEffect(
        useCallback(() => {
            const params = route.params as any;
            if (params?.preloadedRoute && params?.stamp) {
                const data = params.preloadedRoute;

                setCurrentLocation(data.startLocation || "");
                setDestination(data.endLocation || "");

                if (data.startCoords) {
                    setSelectedPickupPlace({
                        placeId: "preloaded_start",
                        description: data.startLocation,
                        latitude: data.startCoords.latitude,
                        longitude: data.startCoords.longitude,
                    });
                }
                
                if (data.endCoords) {
                    setSelectedDestinationPlace({
                        placeId: "preloaded_end",
                        description: data.endLocation,
                        latitude: data.endCoords.latitude,
                        longitude: data.endCoords.longitude,
                    });
                }

                // Clear the params immediately so they don't get stuck if the user manually changes the text later
                navigation.setParams({ preloadedRoute: undefined, stamp: undefined } as any);
            }
        }, [route.params, navigation])
    );

    useEffect(() => {
        const fetchRides = async () => {
            setIsLoadingRides(true);
            try {
                const response = await partiesService.list();

                if (!response.success) {
                    setRides([]);
                    return;
                }

                const mappedRides: RideCard[] = (response.data ?? []).map(
                    (party: any) => {
                        const pickupLabel = party.pickup?.label ?? "Unknown pickup";
                        const destinationLabel = party.destination?.label ?? "Unknown destination";

                        const leaveBy = party.leaveBy ? new Date(party.leaveBy).getTime() : null;
                        const leavingIn = leaveBy ? Math.max(1, Math.round((leaveBy - Date.now()) / 60000)) : 5;

                        const preferences = party.preferences ?? {};

                        const tags: string[] = [];
                        if (preferences.femaleOnly) tags.push("Female Only");
                        if (preferences.alcoholFree) tags.push("Alcohol Free");

                        return {
                            id: String(party.id),
                            destination: destinationLabel,
                            pickup: pickupLabel,
                            price: Number(party.pricePerPerson ?? 0),
                            leavingIn,
                            currentPassengers: Number(party.currentMembers ?? 1),
                            maxPassengers: Number(party.maxMembers ?? 4),
                            driverName: party.name ?? "Ride Group",
                            driverInitial: (party.name?.charAt(0) ?? "R").toUpperCase(),
                            driverTrips: Number(party.driverTrips ?? 0),
                            tags,
                            pickupLat: party.pickup?.lat,
                            pickupLng: party.pickup?.lng,
                            destinationLat: party.destination?.lat,
                            destinationLng: party.destination?.lng,
                        };
                    },
                );

                setRides(mappedRides);
            } catch (error) {
                console.error("Failed to load rides:", error);
                setRides([]);
            } finally {
                setIsLoadingRides(false);
            }
        };

        fetchRides();
    }, []);

    const toggleFilter = (filterId: string) => {
        setActiveFilters((prev) => {
            const updated = new Set(prev);
            if (updated.has(filterId)) updated.delete(filterId);
            else updated.add(filterId);
            return updated;
        });
    };

    const handleClearSearch = () => {
        setCurrentLocation("");
        setDestination("");
        setSelectedPickupPlace(null);
        setSelectedDestinationPlace(null);
        setPickupSuggestions([]);
        setDestinationSuggestions([]);
        setActiveField(null);
    };

    const fetchSuggestions = async (text: string, field: "pickup" | "destination") => {
        if (!text.trim() || !GOOGLE_MAPS_API_KEY) {
            if (field === "pickup") setPickupSuggestions([]);
            else setDestinationSuggestions([]);
            return;
        }

        setLoadingSuggestions(true);

        try {
            const bathLat = 51.3813;
            const bathLng = -2.359;

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}&language=en&components=country:gb&location=${bathLat},${bathLng}&radius=30000&strictbounds=false`,
            );

            const data = await response.json();

            if (data.status === "OK") {
                const results: PlaceSuggestion[] = data.predictions.map((item: any) => ({
                    placeId: item.place_id,
                    description: item.description,
                    mainText: item.structured_formatting?.main_text,
                    secondaryText: item.structured_formatting?.secondary_text,
                }));

                if (field === "pickup") setPickupSuggestions(results);
                else setDestinationSuggestions(results);
            } else {
                if (field === "pickup") setPickupSuggestions([]);
                else setDestinationSuggestions([]);
            }
        } catch (error) {
            console.error("Autocomplete error:", error);
            if (field === "pickup") setPickupSuggestions([]);
            else setDestinationSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleInputChange = (text: string, field: "pickup" | "destination") => {
        if (field === "pickup") {
            setCurrentLocation(text);
            setSelectedPickupPlace(null);
        } else {
            setDestination(text);
            setSelectedDestinationPlace(null);
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(text, field);
        }, 400);
    };

    const handleSelectSuggestion = async (suggestion: PlaceSuggestion, field: "pickup" | "destination") => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?place_id=${suggestion.placeId}&key=${GOOGLE_MAPS_API_KEY}`,
            );

            const data = await response.json();

            if (data.status !== "OK" || !data.results?.length) return;

            const location = data.results[0].geometry.location;

            const place: SelectedPlace = {
                placeId: suggestion.placeId,
                description: suggestion.description,
                latitude: location.lat,
                longitude: location.lng,
            };

            if (field === "pickup") {
                setCurrentLocation(place.description);
                setSelectedPickupPlace(place);
                setPickupSuggestions([]);
            } else {
                setDestination(place.description);
                setSelectedDestinationPlace(place);
                setDestinationSuggestions([]);
            }

            setActiveField(null);
        } catch (error) {
            console.error("Place selection error:", error);
        }
    };

    const filteredRides = useMemo(() => {
        return rides.filter((ride) => {
            let pickupMatch = true;
            let destinationMatch = true;

            if (selectedPickupPlace) {
                if (typeof ride.pickupLat === "number" && typeof ride.pickupLng === "number") {
                    const distance = getDistanceKm(
                        selectedPickupPlace.latitude,
                        selectedPickupPlace.longitude,
                        ride.pickupLat,
                        ride.pickupLng,
                    );
                    pickupMatch = distance <= 2;
                } else {
                    pickupMatch = ride.pickup.toLowerCase().includes(selectedPickupPlace.description.toLowerCase());
                }
            } else if (currentLocation.trim()) {
                pickupMatch = ride.pickup.toLowerCase().includes(currentLocation.toLowerCase());
            }

            if (selectedDestinationPlace) {
                if (typeof ride.destinationLat === "number" && typeof ride.destinationLng === "number") {
                    const distance = getDistanceKm(
                        selectedDestinationPlace.latitude,
                        selectedDestinationPlace.longitude,
                        ride.destinationLat,
                        ride.destinationLng,
                    );
                    destinationMatch = distance <= 2;
                } else {
                    destinationMatch = ride.destination.toLowerCase().includes(selectedDestinationPlace.description.toLowerCase());
                }
            } else if (destination.trim()) {
                destinationMatch = ride.destination.toLowerCase().includes(destination.toLowerCase());
            }

            const femaleOnlyMatch = !activeFilters.has("female-only") || ride.tags.includes("Female Only");
            const alcoholFreeMatch = !activeFilters.has("alcohol-free") || ride.tags.includes("Alcohol Free");

            return pickupMatch && destinationMatch && femaleOnlyMatch && alcoholFreeMatch;
        });
    }, [rides, currentLocation, destination, selectedPickupPlace, selectedDestinationPlace, activeFilters]);

    const renderRideCard = ({ item }: { item: RideCard }) => (
        <Pressable
            style={[styles.rideCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => onJoinRide(item)}
            android_ripple={{ color: colors.primary + '20' }}
        >
            <View style={styles.cardTopRow}>
                <View style={styles.routeBlock}>
                        <View style={styles.routeRow}>
                        <View style={[styles.routeDotPickup, { backgroundColor: colors.success }]} />
                        <View style={styles.routeTextWrap}>
                            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Pickup</Text>
                            <Text style={[styles.routeValue, { color: colors.text }]}>{item.pickup}</Text>
                        </View>
                    </View>

                    <View style={[styles.routeLine, { backgroundColor: colors.border }]} />

                    <View style={styles.routeRow}>
                        <View style={[styles.routeDotDestination, { backgroundColor: colors.textSecondary }]} />
                        <View style={styles.routeTextWrap}>
                            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Destination</Text>
                            <Text style={[styles.routeValue, { color: colors.text }]}>{item.destination}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.pricePill, { backgroundColor: colors.cardBackground }]}> 
                    <Text style={[styles.priceAmount, { color: colors.text } ]}>£{item.price}</Text>
                    <Text style={[styles.priceCaption, { color: colors.textSecondary }]}>per seat</Text>
                </View>
            </View>

            <View style={styles.cardMetaRow}>
                <View style={[styles.metaBadge, { backgroundColor: colors.primaryLight }]}> 
                    <Ionicons name="time-outline" size={14} color={colors.primary} />
                    <Text style={[styles.metaBadgeText, { color: colors.primary } ]}>Leaving in {item.leavingIn} min</Text>
                </View>

                <View style={[styles.metaBadge, { backgroundColor: colors.primaryLight }]}> 
                    <Ionicons name="people-outline" size={14} color={colors.primary} />
                    <Text style={[styles.metaBadgeText, { color: colors.primary }]}>{item.currentPassengers}/{item.maxPassengers}</Text>
                </View>
            </View>

            {item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

                <View style={styles.cardBottomRow}>
                <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}> 
                    <Text style={[styles.driverAvatarText, { color: colors.textLight }]}>{item.driverInitial}</Text>
                </View>

                <View style={styles.driverInfo}>
                    <Text style={[styles.driverName, { color: colors.text }]}>{item.driverName}</Text>
                    <Text style={[styles.driverTrips, { color: colors.textSecondary }]}>{item.driverTrips} trips completed</Text>
                </View>

                <View style={[styles.joinChip, { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary }]}> 
                    <Text style={[styles.joinChipText, { color: colors.primary }]}>Join</Text>
                </View>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
            <FlatList
                data={filteredRides}
                renderItem={renderRideCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                            <View style={[styles.header, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
                                <Pressable style={[styles.backButton, { backgroundColor: colors.cardBackground }]} onPress={onBack}>
                                    <Ionicons name="chevron-back" size={22} color={colors.primary} />
                                </Pressable>

                                <Text style={[styles.headerTitle, { color: colors.text }]}>Current Ride Groups</Text>

                                <View style={styles.headerActions}>
                                    <Pressable style={[styles.iconButton, { backgroundColor: colors.cardBackground }]} onPress={onViewSettings}>
                                        <Ionicons name="settings-outline" size={20} color={colors.primary} />
                                    </Pressable>
                                    <Pressable style={[styles.iconButton, { backgroundColor: colors.cardBackground }]} onPress={onViewProfile}>
                                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                                    </Pressable>
                                </View>
                            </View>

                        <View style={[styles.heroCard, { backgroundColor: colors.cardBackground }]}> 
                            <Text style={[styles.heroTitle, { color: colors.text }]}>Where are you heading?</Text>
                            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Choose your pickup and destination to find matching rides.</Text>

                            <View style={[styles.searchBox, { backgroundColor: colors.cardBackground }]}> 
                                <View style={styles.searchField}>
                                    <Ionicons name="radio-button-on" size={16} color={colors.primary} />
                                    <TextInput
                                        style={[styles.searchInput, { color: colors.text }]}
                                        placeholder="Start point"
                                        placeholderTextColor={colors.textSecondary}
                                        value={currentLocation}
                                        onFocus={() => setActiveField("pickup")}
                                        onChangeText={(text) => handleInputChange(text, "pickup")}
                                    />
                                </View>

                                {activeField === "pickup" && (pickupSuggestions.length > 0 || loadingSuggestions) && (
                                    <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}> 
                                        {loadingSuggestions ? (
                                            <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
                                        ) : (
                                            pickupSuggestions.map((item) => (
                                                <TouchableOpacity
                                                    key={item.placeId}
                                                    style={styles.suggestionItem}
                                                    onPress={() => handleSelectSuggestion(item, "pickup")}
                                                >
                                                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.suggestionText, { fontWeight: "600", color: colors.text }]}> 
                                                            {item.mainText ?? item.description}
                                                        </Text>
                                                        {!!item.secondaryText && (
                                                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                                                {item.secondaryText}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </View>
                                )}

                                <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />

                                <View style={styles.searchField}>
                                    <Ionicons name="location" size={16} color={colors.text} />
                                    <TextInput
                                        style={[styles.searchInput, { color: colors.text }]}
                                        placeholder="Destination"
                                        placeholderTextColor={colors.textSecondary}
                                        value={destination}
                                        onFocus={() => setActiveField("destination")}
                                        onChangeText={(text) => handleInputChange(text, "destination")}
                                    />
                                </View>

                                {activeField === "destination" && (destinationSuggestions.length > 0 || loadingSuggestions) && (
                                    <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}> 
                                        {loadingSuggestions ? (
                                            <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
                                        ) : (
                                            destinationSuggestions.map((item) => (
                                                <TouchableOpacity
                                                    key={item.placeId}
                                                    style={styles.suggestionItem}
                                                    onPress={() => handleSelectSuggestion(item, "destination")}
                                                >
                                                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.suggestionText, { fontWeight: "600", color: colors.text }]}> 
                                                            {item.mainText ?? item.description}
                                                        </Text>
                                                        {!!item.secondaryText && (
                                                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                                                {item.secondaryText}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.filterRow}>
                                    <Pressable
                                        style={[styles.filterChip, activeFilters.has("female-only") ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                                        onPress={() => toggleFilter("female-only")}
                                    >
                                        <Text style={[styles.filterChipText, activeFilters.has("female-only") ? { color: colors.background } : { color: colors.text }]}>
                                            Female Only
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.filterChip, activeFilters.has("alcohol-free") ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                                        onPress={() => toggleFilter("alcohol-free")}
                                    >
                                        <Text style={[styles.filterChipText, activeFilters.has("alcohol-free") ? { color: colors.background } : { color: colors.text }]}>
                                            Alcohol Free
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.filterChip, activeFilters.has("same-course") ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                                        onPress={() => toggleFilter("same-course")}
                                    >
                                        <Text style={[styles.filterChipText, activeFilters.has("same-course") ? { color: colors.background } : { color: colors.text }]}>
                                            Same Course
                                        </Text>
                                    </Pressable>

                                    {(currentLocation || destination || activeFilters.size > 0) && (
                                        <Pressable style={[styles.clearChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleClearSearch}>
                                            <Text style={[styles.clearChipText, { color: colors.textSecondary }]}>Clear</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.resultsHeader}>
                            <Text style={[styles.resultsTitle, { color: colors.text }]}>Available rides</Text>
                            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredRides.length} found</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    isLoadingRides ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Loading rides...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="car-outline" size={34} color={colors.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No ride groups found</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try a different pickup point, destination, or filter.</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f7f7",
    },
    listContent: {
        paddingBottom: 28,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: "#f7f7f7",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: FONT_SIZES.base,
        fontWeight: "700",
        color: "#111827",
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    heroCard: {
        marginHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        backgroundColor: "#111827",
        borderRadius: 24,
        padding: 18,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: "#d1d5db",
        marginBottom: 16,
    },
    searchBox: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        paddingVertical: 4,
        overflow: "hidden",
    },
    searchField: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
    },
    searchDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginHorizontal: 14,
    },
    suggestionsBox: {
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: "#374151",
    },
    filterSection: {
        marginTop: 16,
    },
    filterRow: {
        flexDirection: "row",
        paddingHorizontal: SPACING.md,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    filterChipActive: {
        backgroundColor: "#1B5E20",
        borderColor: "#1B5E20",
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
    },
    filterChipTextActive: {
        color: "#ffffff",
    },
    clearChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "#fee2e2",
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    clearChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#b91c1c",
    },
    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        marginTop: 18,
        marginBottom: 10,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    resultsCount: {
        fontSize: 13,
        color: "#6b7280",
    },
    rideCard: {
        marginHorizontal: SPACING.md,
        marginBottom: 14,
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 16,
    },
    cardTopRow: {
        flexDirection: "row",
        gap: 12,
    },
    routeBlock: {
        flex: 1,
    },
    routeRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    routeDotPickup: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#1B5E20",
        marginTop: 6,
    },
    routeDotDestination: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#111827",
        marginTop: 6,
    },
    routeLine: {
        width: 2,
        height: 16,
        backgroundColor: "#d1d5db",
        marginLeft: 4,
        marginVertical: 4,
    },
    routeTextWrap: {
        flex: 1,
    },
    routeLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 2,
    },
    routeValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    pricePill: {
        backgroundColor: "#f3f4f6",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 76,
    },
    priceAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    priceCaption: {
        fontSize: 11,
        color: "#6b7280",
    },
    cardMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 14,
        flexWrap: "wrap",
    },
    metaBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#edf7f0",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
    },
    metaBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1B5E20",
    },
    tagsContainer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        flexWrap: "wrap",
    },
    tag: {
        backgroundColor: "#fff7ed",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
    },
    tagText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#9a3412",
    },
    cardBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    driverAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#1B5E20",
        alignItems: "center",
        justifyContent: "center",
    },
    driverAvatarText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
    driverInfo: {
        flex: 1,
        marginLeft: 10,
    },
    driverName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    driverTrips: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    joinChip: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    joinChipText: {
        fontSize: 12,
        fontWeight: "700",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 18,
        color: "#6b7280",
        textAlign: "center",
    },
});