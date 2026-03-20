import React, { useMemo, useRef, useState, useCallback } from "react";
import { useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSearchContext } from "../contexts/SearchContexts";
import { partiesService, uberService } from "../services/api";
import type { JSX } from "react";
import {
	View,
	Text,
	TextInput,
	Alert,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	SafeAreaView,
	Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type PlaceSuggestion = {
	placeId: string;
	description: string;
};

type SelectedPlace = {
	label: string;
	lat: number;
	lng: number;
};

interface CreateGroupPageProps {
	onBack?: () => void;
	onCreateGroup: (rideData: any) => void;
	userGender?: string;
}

export const CreateGroupPage = ({
	onBack,
	onCreateGroup,
	userGender,
}: CreateGroupPageProps): JSX.Element => {
	const { colors } = useTheme();
	const [pickupPoint, setPickupPoint] = useState("");
	const [finalDestination, setFinalDestination] = useState("");
	const [maxRiders, setMaxRiders] = useState("4");
	const [minRating, setMinRating] = useState("3");
	const [maxWaitTime, setMaxWaitTime] = useState("30");
	const [isCreating, setIsCreating] = useState(false);

	const [allowCustomStops, setAllowCustomStops] = useState(false);
	const [femaleOnly, setFemaleOnly] = useState(false);
	const [alcoholFree, setAlcoholFree] = useState(false);

	const [pickupSuggestions, setPickupSuggestions] = useState<
		PlaceSuggestion[]
	>([]);
	const [destinationSuggestions, setDestinationSuggestions] = useState<
		PlaceSuggestion[]
	>([]);
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);
	const [activeField, setActiveField] = useState<
		"pickup" | "destination" | null
	>(null);

	const [selectedPickup, setSelectedPickup] = useState<SelectedPlace | null>(
		null,
	);
	const [selectedDestination, setSelectedDestination] =
		useState<SelectedPlace | null>(null);

	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	const route = useRoute();
	const navigation = useNavigation();

	const { startLocation: ctxStart, endLocation: ctxEnd, startCoords: ctxStartCoords, endCoords: ctxEndCoords } = useSearchContext();

	// If navigated with preloaded params, or context has saved search, apply them when screen focuses
	useFocusEffect(
		useCallback(() => {
			const params = (route.params as any) || {};
			if (params?.preloadedRoute && params?.stamp) {
				const data = params.preloadedRoute;

				if (data.startLocation) setPickupPoint(data.startLocation);
				if (data.endLocation) setFinalDestination(data.endLocation);

				if (data.startCoords) {
					setSelectedPickup({
						label: data.startLocation,
						lat: data.startCoords.latitude,
						lng: data.startCoords.longitude,
					});
				}

				if (data.endCoords) {
					setSelectedDestination({
						label: data.endLocation,
						lat: data.endCoords.latitude,
						lng: data.endCoords.longitude,
					});
				}

				// clear params so they don't persist
				navigation.setParams({ preloadedRoute: undefined, stamp: undefined } as any);
				return;
			}

			// fallback to context if available
			if (ctxStart || ctxEnd || ctxStartCoords || ctxEndCoords) {
				if (ctxStart) setPickupPoint(ctxStart);
				if (ctxEnd) setFinalDestination(ctxEnd);

				if (ctxStartCoords) {
					setSelectedPickup({
						label: ctxStart,
						lat: ctxStartCoords.latitude,
						lng: ctxStartCoords.longitude,
					});
				}

				if (ctxEndCoords) {
					setSelectedDestination({
						label: ctxEnd,
						lat: ctxEndCoords.latitude,
						lng: ctxEndCoords.longitude,
					});
				}
			}
		}, [route.params, navigation, ctxStart, ctxEnd, ctxStartCoords, ctxEndCoords])
	);

	const isFemaleUser = useMemo(() => {
		return (userGender || "").trim().toLowerCase() === "female";
	}, [userGender]);

	const clearSuggestions = () => {
		setPickupSuggestions([]);
		setDestinationSuggestions([]);
	};

	const fetchPlaceSuggestions = async (
		query: string,
		field: "pickup" | "destination",
	) => {
		if (!query.trim() || !GOOGLE_MAPS_API_KEY) {
			if (field === "pickup") setPickupSuggestions([]);
			else setDestinationSuggestions([]);
			return;
		}

		setLoadingSuggestions(true);

		try {
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
					query,
				)}&key=${GOOGLE_MAPS_API_KEY}&components=country:gb&location=51.3813,-2.3590&radius=25000`,
			);

			const data = await response.json();

			if (data.status === "OK") {
				const suggestions: PlaceSuggestion[] = data.predictions.map(
					(p: any) => ({
						placeId: p.place_id,
						description: p.description,
					}),
				);

				if (field === "pickup") setPickupSuggestions(suggestions);
				else setDestinationSuggestions(suggestions);
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

	const handleInputChange = (
		text: string,
		field: "pickup" | "destination",
	) => {
		if (field === "pickup") {
			setPickupPoint(text);
			setSelectedPickup(null);
		} else {
			setFinalDestination(text);
			setSelectedDestination(null);
		}

		setActiveField(field);

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			fetchPlaceSuggestions(text, field);
		}, 400);
	};

	const handlePlaceSelection = async (
		suggestion: PlaceSuggestion,
		field: "pickup" | "destination",
	) => {
		try {
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?place_id=${suggestion.placeId}&key=${GOOGLE_MAPS_API_KEY}`,
			);

			const data = await response.json();

			if (data.status !== "OK" || !data.results?.length) {
				Alert.alert("Location Error", "Could not load selected place.");
				return;
			}

			const result = data.results[0];
			const location = result.geometry.location;

			const selectedPlace: SelectedPlace = {
				label: suggestion.description,
				lat: location.lat,
				lng: location.lng,
			};

			if (field === "pickup") {
				setPickupPoint(suggestion.description);
				setSelectedPickup(selectedPlace);
				setPickupSuggestions([]);
			} else {
				setFinalDestination(suggestion.description);
				setSelectedDestination(selectedPlace);
				setDestinationSuggestions([]);
			}

			setActiveField(null);
		} catch (error) {
			console.error("Geocode error:", error);
			Alert.alert("Location Error", "Could not get place coordinates.");
		}
	};

	const handleCreateGroup = async () => {
		if (!selectedPickup || !selectedDestination) {
			Alert.alert(
				"Missing Locations",
				"Please select both pickup and destination from the suggestions.",
			);
			return;
		}

		const parsedMaxRiders = Number(maxRiders || "4");

		if (!Number.isFinite(parsedMaxRiders) || parsedMaxRiders < 2) {
			Alert.alert("Invalid Riders", "Max riders must be at least 2.");
			return;
		}

		if (femaleOnly && !isFemaleUser) {
			Alert.alert(
				"Not Allowed",
				"Only users with female gender can create female-only rides.",
			);
			return;
		}

		const leaveBy = new Date(
			Date.now() + Number(maxWaitTime || "30") * 60 * 1000,
		).toISOString();

		const payload = {
			name: `${selectedPickup.label} → ${selectedDestination.label}`,
			maxMembers: parsedMaxRiders,
			pickup: {
				lat: selectedPickup.lat,
				lng: selectedPickup.lng,
				label: selectedPickup.label,
			},
			destination: {
				lat: selectedDestination.lat,
				lng: selectedDestination.lng,
				label: selectedDestination.label,
			},
			leaveBy,
			preferences: {
				allowCustomStops,
				femaleOnly: isFemaleUser ? femaleOnly : false,
				alcoholFree,
				minRating: minRating ? Number(minRating) : null,
			},
		};

		setIsCreating(true);

		try {
			const response = await partiesService.create(payload);

			if (!response.success) {
				const details = (response as any).raw?.details?.fieldErrors;

				if (details) {
					const msg = Object.entries(details)
						.map(
							([field, errs]) =>
								`${field}: ${(errs as string[]).join(", ")}`,
						)
						.join("\n");
					Alert.alert("Validation Error", msg);
				} else {
					Alert.alert(
						"Create Failed",
						response.message || "Could not create ride group.",
					);
				}
				return;
			}

			// Request an Uber ride immediately after party creation
			const UBERX_PRODUCT_ID = "a1111c8c-c720-46c3-8534-2fcdd730040d";
			let uberRide: any = null;
			try {
				const rideResponse = await uberService.requestRide({
					productId: UBERX_PRODUCT_ID,
					startLat: selectedPickup!.lat,
					startLng: selectedPickup!.lng,
					endLat: selectedDestination!.lat,
					endLng: selectedDestination!.lng,
				});
				if (rideResponse.success) {
					uberRide = rideResponse.data;
				}
			} catch (rideErr) {
				console.warn("[uber] ride request failed, continuing without ride:", rideErr);
			}

			onCreateGroup({ ...response.data, uberRide });
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error
					? error.message
					: "Failed to create ride group",
			);
		} finally {
			setIsCreating(false);
		}
	};

	const renderSuggestions = (field: "pickup" | "destination") => {
		const suggestions =
			field === "pickup" ? pickupSuggestions : destinationSuggestions;

		if (activeField !== field || suggestions.length === 0) return null;

		return (
			<View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
				{suggestions.map((item) => (
					<TouchableOpacity
						key={item.placeId}
						style={styles.suggestionItem}
						onPress={() => handlePlaceSelection(item, field)}
						activeOpacity={0.8}
					>
						<View style={styles.suggestionIcon} />
						<Text style={[styles.suggestionText, { color: colors.text }] }>
							{item.description}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={[styles.header, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
				<TouchableOpacity style={[styles.backButton, { backgroundColor: colors.cardBackground }]} onPress={onBack}>
					<Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: colors.text }]}>Create Ride Group</Text>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<View style={[styles.heroCard, { backgroundColor: colors.primary }]}> 
						<Text style={styles.heroTitle}>Set up your route</Text>
						<Text style={styles.heroSubtitle}>
							Choose exact pickup and destination places so riders can
							find your trip easily.
						</Text>

						{/* Inner white box with inputs to match design */}
						<View style={[styles.innerBox, { backgroundColor: colors.cardBackground }]}> 
							<View style={[styles.searchBox, { backgroundColor: colors.cardBackground }]}> 
								<View style={styles.searchField}>
									<View style={styles.dotOuter}>
										<View style={styles.dotInnerActive} />
									</View>
									<TextInput
										style={[styles.searchInput, { color: colors.text }]}
										placeholder="Start point"
										placeholderTextColor={colors.textSecondary}
										value={pickupPoint}
										onChangeText={(text) =>
											handleInputChange(text, "pickup")
										}
										onFocus={() => setActiveField("pickup")}
									/>
								</View>

								<View style={styles.searchDivider} />

								<View style={styles.searchField}>
									<View style={styles.dotOuter}>
										<View style={styles.dotInner} />
									</View>
									<TextInput
										style={[styles.searchInput, { color: colors.text }]}
										placeholder="Destination"
										placeholderTextColor={colors.textSecondary}
										value={finalDestination}
										onChangeText={(text) =>
											handleInputChange(text, "destination")
										}
										onFocus={() => setActiveField("destination")}
									/>
								</View>

								{renderSuggestions("pickup")}
								{renderSuggestions("destination")}

								{selectedPickup && (
									<Text style={styles.selectedText}>
										Selected: {selectedPickup.label}
									</Text>
								)}

								{selectedDestination && (
									<Text style={styles.selectedText}>
										Selected: {selectedDestination.label}
									</Text>
								)}
							</View>
						</View>
				</View>

				<View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }] }>
					<Text style={styles.cardTitle}>Trip Settings</Text>

					<View style={styles.rowContainer}>
						<View style={[styles.inputGroup, styles.halfWidth]}>
							<Text style={styles.label}>Max Riders *</Text>
							<View style={styles.inputContainer}>
								<Text style={styles.inputIcon}>👥</Text>
								<TextInput
									style={styles.input}
									placeholder="4"
									placeholderTextColor={COLORS.textSecondary}
									value={maxRiders}
									onChangeText={setMaxRiders}
									keyboardType="number-pad"
								/>
							</View>
						</View>

						<View style={[styles.inputGroup, styles.halfWidth]}>
							<Text style={styles.label}>Max Wait Time</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={maxWaitTime}
									onValueChange={setMaxWaitTime}
									style={styles.picker}
								>
									<Picker.Item label="15 min" value="15" />
									<Picker.Item label="30 min" value="30" />
									<Picker.Item label="1 hour" value="60" />
									<Picker.Item label="2 hours" value="120" />
								</Picker>
							</View>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Minimum Rider Rating</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={minRating}
								onValueChange={setMinRating}
								style={styles.picker}
							>
								<Picker.Item label="No Rating" value="" />
								<Picker.Item label="1 Star" value="1" />
								<Picker.Item label="2 Stars" value="2" />
								<Picker.Item label="3 Stars" value="3" />
								<Picker.Item label="4 Stars" value="4" />
								<Picker.Item label="5 Stars" value="5" />
							</Picker>
						</View>
						<Text style={styles.helpText}>
							Only riders with this rating or higher can join
						</Text>
					</View>
				</View>

				<View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }] }>
					<Text style={styles.cardTitle}>Ride Preferences</Text>

					<View style={styles.preferenceItem}>
						<View style={styles.preferenceContent}>
							<Text style={styles.preferenceTitleText}>
								Allow custom stops
							</Text>
							<Text style={styles.preferenceDescriptionText}>
								Let riders request different drop-off points
							</Text>
						</View>
						<Switch
							value={allowCustomStops}
							onValueChange={setAllowCustomStops}
						/>
					</View>

					<View style={styles.preferenceItem}>
						<View style={styles.preferenceContent}>
							<Text style={styles.preferenceTitleText}>
								Female only
							</Text>
							<Text style={styles.preferenceDescriptionText}>
								Only female riders can join
							</Text>
							{!isFemaleUser && (
								<Text style={styles.restrictionText}>
									Only female users can enable this option
								</Text>
							)}
						</View>
						<Switch
							value={femaleOnly}
							onValueChange={(value) => {
								if (isFemaleUser) setFemaleOnly(value);
							}}
							disabled={!isFemaleUser}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primary,
							}}
							thumbColor={
								isFemaleUser ? COLORS.textLight : "#d1d5db"
							}
						/>
					</View>

					<View style={styles.preferenceItem}>
						<View style={styles.preferenceContent}>
							<Text style={styles.preferenceTitleText}>
								Alcohol free
							</Text>
							<Text style={styles.preferenceDescriptionText}>
								No alcohol consumption during ride
							</Text>
						</View>
						<Switch
							value={alcoholFree}
							onValueChange={setAlcoholFree}
						/>
					</View>
				</View>

				<TouchableOpacity
					style={styles.createButton}
					onPress={handleCreateGroup}
					disabled={isCreating}
					activeOpacity={0.85}
				>
					{isCreating ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text style={styles.createButtonText}>
							Create Ride Group
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>

					{/* Bottom tab replica so navigation remains available */}
					<View style={styles.bottomNavBar}>
						<TouchableOpacity
							style={styles.tabButton}
							onPress={() => navigation.navigate("MainTabs", { screen: "Map" })}
							activeOpacity={0.8}
						>
							<Ionicons name="map-outline" size={22} color="#1B5E20" />
							<Text style={styles.tabButtonText}>Map</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.tabButton}
							onPress={() => navigation.navigate("MainTabs", { screen: "RideGroups" })}
							activeOpacity={0.8}
						>
							<Ionicons name="people-outline" size={22} color="#6b7280" />
							<Text style={styles.tabButtonText}>Ride Groups</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.tabButton}
							onPress={() => navigation.navigate("MainTabs", { screen: "Profile" })}
							activeOpacity={0.8}
						>
							<Ionicons name="person-outline" size={22} color="#6b7280" />
							<Text style={styles.tabButtonText}>Profile</Text>
						</TouchableOpacity>
					</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f7f7f7",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f7f7f7",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
		gap: 12,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center",
	},
	backIcon: {
		fontSize: 18,
		color: "#111827",
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		gap: 16,
		paddingBottom: 120,
	},
	heroCard: {
		marginHorizontal: 16,
		marginTop: 8,
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
	card: {
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
		gap: 16,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: COLORS.primary,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.4,
		borderColor: COLORS.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		height: 52,
		gap: 8,
		backgroundColor: "#fff",
	},
	inputIcon: {
		fontSize: 16,
	},
	input: {
		flex: 1,
		fontSize: 14,
		color: COLORS.text,
		paddingVertical: 8,
	},
	helpText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	selectedText: {
		fontSize: 12,
		color: COLORS.primary,
		fontWeight: "500",
	},
	rowContainer: {
		flexDirection: "row",
		gap: 12,
	},
	halfWidth: {
		flex: 1,
	},
	pickerContainer: {
		borderWidth: 1.4,
		borderColor: COLORS.border,
		borderRadius: 12,
		overflow: "hidden",
		height: 52,
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	picker: {
		height: 52,
		color: COLORS.text,
	},
	preferenceItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#f8fafc",
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 14,
	},
	preferenceContent: {
		flex: 1,
		paddingRight: 12,
	},
	preferenceTitleText: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.primary,
		marginBottom: 4,
	},
	preferenceDescriptionText: {
		fontSize: 13,
		color: COLORS.textSecondary,
	},
	restrictionText: {
		fontSize: 12,
		color: "#dc2626",
		marginTop: 6,
		fontWeight: "500",
	},
	createButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 14,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
	suggestionsContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		overflow: "hidden",
	},
	suggestionsBox: {
		backgroundColor: "#ffffff",
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	searchBox: {
		backgroundColor: "#ffffff",
		borderRadius: 18,
		overflow: "hidden",
		marginTop: 8,
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
		marginHorizontal: 0,
	},
	searchIcon: {
		fontSize: 16,
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
	suggestionIcon: {
		width: 10,
		height: 10,
		borderRadius: 6,
		backgroundColor: COLORS.primary,
		marginRight: 8,
	},
	innerBox: {
		backgroundColor: "#fff",
		borderRadius: 14,
		marginTop: 12,
		marginHorizontal: 8,
		overflow: "hidden",
	},
	dotOuter: {
		width: 22,
		height: 22,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: COLORS.border,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	dotInner: {
		width: 8,
		height: 8,
		borderRadius: 6,
		backgroundColor: COLORS.textSecondary,
	},
	dotInnerActive: {
		width: 8,
		height: 8,
		borderRadius: 6,
		backgroundColor: COLORS.primary,
	},
	suggestionText: {
		flex: 1,
		fontSize: 14,
		color: "#374151",
	},
	bottomNavBar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "#fff",
		paddingTop: 8,
		paddingBottom: 18,
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
	},
	tabButton: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 6,
	},
	tabButtonText: {
		fontSize: 12,
		color: "#374151",
		marginTop: 4,
	},
});
