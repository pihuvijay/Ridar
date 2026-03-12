import React, { useState, useRef, useEffect } from "react";
import type { JSX } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	Pressable,
	TextInput,
	ActivityIndicator,
	Alert,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { COLORS } from "../theme/colors";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Helper function to decode Google's encoded polyline string into coordinates
const decodePolyline = (t: string) => {
	let points = [];
	let index = 0,
		len = t.length;
	let lat = 0,
		lng = 0;
	while (index < len) {
		let b,
			shift = 0,
			result = 0;
		do {
			b = t.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		let dlat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += dlat;
		shift = 0;
		result = 0;
		do {
			b = t.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		let dlng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += dlng;
		points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
	}
	return points;
};

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
	const [startCoords, setStartCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [endCoords, setEndCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [routeCoords, setRouteCoords] = useState<
		{ latitude: number; longitude: number }[]
	>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showSearchPanel, setShowSearchPanel] = useState(false);
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
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const mapRef = useRef<MapView>(null);

	// Sample ride group markers
	const rideGroups: Array<{
		id: string;
		latitude: number;
		longitude: number;
		title: string;
		description: string;
	}> = [];

	const defaultRegion = {
		latitude: 37.7749,
		longitude: -122.4194,
		latitudeDelta: 0.5,
		longitudeDelta: 0.5,
	};

	// Fetch directions when both coordinates are set
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

					// Animate the map to show the entire route
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

				if (isStart) {
					setStartCoords(coords);
				} else {
					setEndCoords(coords);
				}

				// Only zoom to single point if we don't have the other coordinate yet
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

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={[styles.header, { zIndex: 10 }]} pointerEvents="auto">
				<View style={styles.headerLeft}>
					<TouchableOpacity
						style={styles.menuButton}
						onPress={() => {
							setIsMenuOpen(!isMenuOpen);
							if (onMenuPress) onMenuPress();
						}}
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
						onPress={() => {
							if (onSettingsPress) onSettingsPress();
						}}
						activeOpacity={0.7}
						hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
					>
						<Text style={styles.settingsIcon}>⚙️</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.profileButton}
						onPress={() => {
							if (onProfilePress) onProfilePress();
						}}
						activeOpacity={0.7}
						hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
					>
						<LinearGradient
							colors={["#1B5E20", "#2E7D32"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.avatarGradient}
						>
							<Text style={styles.avatarText}>
								{userName && userName.length > 0
									? userName[0].toUpperCase()
									: "?"}
							</Text>
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
					<ScrollView
						style={styles.searchPanelContent}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.searchHeader}>
							<Text style={styles.searchHeaderTitle}>
								Search Locations
							</Text>
							<TouchableOpacity
								onPress={() => setShowSearchPanel(false)}
							>
								<Text style={styles.searchCloseButton}>✕</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.searchInputContainer}>
							<Text style={styles.searchLabel}>
								Starting Point
							</Text>
							<TextInput
								style={styles.searchInput}
								placeholder="Enter starting location"
								placeholderTextColor="#999"
								value={startLocation}
								onChangeText={(text) =>
									handleLocationInputChange(text, true)
								}
								onFocus={() => setActiveSearchField("start")}
							/>
							{activeSearchField === "start" &&
								startSuggestions.length > 0 && (
									<View style={styles.suggestionsContainer}>
										{loadingSuggestions ? (
											<ActivityIndicator
												size="small"
												color="#155dfc"
												style={{ padding: 10 }}
											/>
										) : (
											startSuggestions.map(
												(suggestion, index) => (
													<TouchableOpacity
														key={index}
														style={
															styles.suggestionItem
														}
														onPress={() =>
															handlePlaceSelection(
																suggestion.placeId,
																suggestion.description,
																true,
															)
														}
													>
														<Text
															style={
																styles.suggestionText
															}
														>
															📍{" "}
															{
																suggestion.description
															}
														</Text>
													</TouchableOpacity>
												),
											)
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
								onChangeText={(text) =>
									handleLocationInputChange(text, false)
								}
								onFocus={() => setActiveSearchField("end")}
							/>
							{activeSearchField === "end" &&
								endSuggestions.length > 0 && (
									<View style={styles.suggestionsContainer}>
										{loadingSuggestions ? (
											<ActivityIndicator
												size="small"
												color="#155dfc"
												style={{ padding: 10 }}
											/>
										) : (
											endSuggestions.map(
												(suggestion, index) => (
													<TouchableOpacity
														key={index}
														style={
															styles.suggestionItem
														}
														onPress={() =>
															handlePlaceSelection(
																suggestion.placeId,
																suggestion.description,
																false,
															)
														}
													>
														<Text
															style={
																styles.suggestionText
															}
														>
															📍{" "}
															{
																suggestion.description
															}
														</Text>
													</TouchableOpacity>
												),
											)
										)}
									</View>
								)}
						</View>

						<TouchableOpacity
							style={styles.searchButton}
							onPress={() => setShowSearchPanel(false)}
							disabled={isSearching}
						>
							<Text style={styles.searchButtonText}>Apply</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.clearButton}
							onPress={handleClearLocations}
						>
							<Text style={styles.clearButtonText}>Clear</Text>
						</TouchableOpacity>
					</ScrollView>
				</SafeAreaView>
			</Modal>

			{/* Location Search Overlay */}
			{!showSearchPanel && (startLocation || endLocation) && (
				<View style={styles.locationOverlay}>
					<Text style={styles.locationOverlayText}>
						{startLocation && endLocation
							? startLocation + " -> " + endLocation
							: startLocation
								? "From: " + startLocation
								: "To: " + endLocation}
					</Text>
					<View style={styles.locationOverlayButtons}>
						<TouchableOpacity
							style={styles.editLocationButton}
							onPress={() => setShowSearchPanel(true)}
						>
							<Text style={styles.editLocationButtonText}>
								Edit
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.clearLocationButton}
							onPress={handleClearLocations}
						>
							<Text style={styles.clearLocationButtonText}>
								Clear
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Map Area */}
			<MapView
				ref={mapRef}
				style={styles.map}
				pointerEvents="box-only"
				initialRegion={defaultRegion}
				zoomControlEnabled={true}
			>
				{/* Draw the Route Line */}
				{routeCoords.length > 0 && (
					<Polyline
						coordinates={routeCoords}
						strokeWidth={4}
						strokeColor="#155dfc"
					/>
				)}

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
						pinColor="#f44336"
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
					<Text style={styles.searchLocationButtonText}>
						Search Locations
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.primaryButton}
					onPress={() => {
						if (onViewRideGroups) onViewRideGroups();
					}}
					activeOpacity={0.8}
				>
					<Text style={styles.primaryButtonIcon}>👥</Text>
					<Text style={styles.primaryButtonText}>
						View Available Ride Groups
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.secondaryButton}
					onPress={() => {
						if (onCreateRideGroup) onCreateRideGroup();
					}}
					activeOpacity={0.8}
				>
					<Text style={styles.secondaryButtonText}>
						Create New Ride Group
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

// Styles remain completely unchanged
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f9fafb" },
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
	headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
	menuButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		backgroundColor: "#ffffff",
	},
	menuIcon: { fontSize: 24, color: "#1e2939", fontWeight: "600" },
	headerTitle: { fontSize: 16, fontWeight: "600", color: "#1e2939" },
	headerNav: { flexDirection: "row", alignItems: "center", gap: 8 },
	settingsButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
	},
	settingsIcon: { fontSize: 20 },
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
	avatarText: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
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
	menuItemText: { fontSize: 14, color: "#364153", fontWeight: "500" },
	mapContainer: {
		flex: 1,
		backgroundColor: "#e5e7eb",
		justifyContent: "center",
		alignItems: "center",
	},
	map: { flex: 1, width: "100%" },
	mapPlaceholder: { alignItems: "center", gap: 8 },
	mapPlaceholderText: { fontSize: 32 },
	mapSubtext: { fontSize: 14, color: "#6b7280" },
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
	primaryButtonIcon: { fontSize: 20 },
	primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
	secondaryButton: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#1B5E20",
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	secondaryButtonText: { color: "#1B5E20", fontSize: 16, fontWeight: "600" },
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
	searchLocationButtonIcon: { fontSize: 18 },
	searchLocationButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
	},
	searchPanelContainer: { flex: 1, backgroundColor: "#f9fafb" },
	searchPanelContent: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
	searchHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	searchHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#1e2939" },
	searchCloseButton: { fontSize: 24, color: "#999", fontWeight: "600" },
	searchInputContainer: { marginBottom: 20, position: "relative" },
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
	searchButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
	clearButton: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#e5e7eb",
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	clearButtonText: { color: "#999", fontSize: 16, fontWeight: "600" },
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
	locationOverlayButtons: { flexDirection: "row", gap: 8 },
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
	clearLocationButtonText: { color: "#999", fontSize: 12, fontWeight: "600" },
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
	suggestionText: { fontSize: 14, color: "#364153" },
});
