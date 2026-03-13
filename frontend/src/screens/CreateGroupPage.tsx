import React, { useState } from "react";
import { partiesService } from "../services/api";
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
import { COLORS } from "../theme/colors";

interface CreateGroupPageProps {
	onBack?: () => void;
	onCreateGroup: (rideData: any) => void; // <-- Update this line
}

export const CreateGroupPage = ({
	onBack,
	onCreateGroup,
}: CreateGroupPageProps): JSX.Element => {
	const [pickupPoint, setPickupPoint] = useState("");
	const [optionalStops, setOptionalStops] = useState("");
	const [finalDestination, setFinalDestination] = useState("");
	const [departureTime, setDepartureTime] = useState("");
	const [maxRiders, setMaxRiders] = useState("");
	const [pricePerPerson, setPricePerPerson] = useState("10");
	const [minRating, setMinRating] = useState("3");
	const [maxWaitTime, setMaxWaitTime] = useState("30");
	const [isCreating, setIsCreating] = useState(false);

	const [allowCustomStops, setAllowCustomStops] = useState(false);
	const [femaleOnly, setFemaleOnly] = useState(false);
	const [alcoholFree, setAlcoholFree] = useState(false);

	const handleCreateGroup = async () => {
		if (!pickupPoint.trim() || !finalDestination.trim()) {
			Alert.alert(
				"Missing Fields",
				"Please enter pickup point and destination.",
			);
			return;
		}

		const payload = {
			name: `${pickupPoint.trim()} → ${finalDestination.trim()}`,
			maxMembers: Number(maxRiders || "4"),
			pickup: {
				lat: 0,
				lng: 0,
				label: pickupPoint.trim(),
			},
			destination: {
				lat: 0,
				lng: 0,
				label: finalDestination.trim(),
			},
			leaveBy: departureTime.trim() || null,
		};

		if (!Number.isFinite(payload.maxMembers) || payload.maxMembers < 2) {
			Alert.alert("Invalid Riders", "Max riders must be at least 2.");
			return;
		}

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

	const handleBack = () => {
		if (onBack) onBack();
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleBack}
					accessibilityLabel="Go back"
				>
					<Text style={styles.backIcon}>←</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Create Ride Group</Text>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Route Details Section */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Route Details</Text>

					{/* Pickup Point */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Pickup Point *</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>📍</Text>
							<TextInput
								style={styles.input}
								placeholder="Where will you pick up riders?"
								placeholderTextColor={COLORS.textSecondary}
								value={pickupPoint}
								onChangeText={setPickupPoint}
								accessibilityLabel="Pickup point"
							/>
						</View>
					</View>

					{/* Optional Stops */}
					<View style={styles.inputGroup}>
						<View style={styles.labelRow}>
							<Text style={styles.label}>
								Optional Stops Along the Way
							</Text>
							<TouchableOpacity>
								<Text style={styles.addStopButton}>
									+ Add Stop
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>🛑</Text>
							<TextInput
								style={styles.input}
								placeholder="Add intermediate stops"
								placeholderTextColor={COLORS.textSecondary}
								value={optionalStops}
								onChangeText={setOptionalStops}
								accessibilityLabel="Optional stops"
							/>
						</View>
						<Text style={styles.helpText}>
							Riders can request to be dropped off at these stops
						</Text>
					</View>

					{/* Final Destination */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Final Destination *</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>📌</Text>
							<TextInput
								style={styles.input}
								placeholder="Where are you heading?"
								placeholderTextColor={COLORS.textSecondary}
								value={finalDestination}
								onChangeText={setFinalDestination}
								accessibilityLabel="Final destination"
							/>
						</View>
					</View>
				</View>

				{/* Trip Details Section */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Trip Details</Text>

					{/* Departure Time */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Departure Time *</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>🕐</Text>
							<TextInput
								style={styles.input}
								placeholder="Select departure time"
								placeholderTextColor={COLORS.textSecondary}
								value={departureTime}
								onChangeText={setDepartureTime}
								accessibilityLabel="Departure time"
							/>
						</View>
					</View>

					{/* Max Riders and Price Row */}
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
									accessibilityLabel="Maximum riders"
								/>
							</View>
						</View>

						<View style={[styles.inputGroup, styles.halfWidth]}>
							<Text style={styles.label}>Price/Person *</Text>
							<View style={styles.inputContainer}>
								<Text style={styles.inputIcon}>💵</Text>
								<TextInput
									style={styles.input}
									placeholder="10"
									placeholderTextColor={COLORS.textSecondary}
									value={pricePerPerson}
									onChangeText={setPricePerPerson}
									keyboardType="decimal-pad"
									accessibilityLabel="Price per person"
								/>
							</View>
						</View>
					</View>

					{/* Minimum Rating and Max Wait Time Row */}
					<View style={styles.rowContainer}>
						<View style={[styles.inputGroup, styles.halfWidth]}>
							<Text style={styles.label}>
								Minimum Rider Rating
							</Text>
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
							<Text style={styles.helpText}>
								How long to advertise before departure
							</Text>
						</View>
					</View>
				</View>

				{/* Ride Preferences Section */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Ride Preferences</Text>

					{/* Allow Custom Stops */}
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
							accessibilityLabel="Allow custom stops toggle"
						/>
					</View>

					{/* Female Only */}
					<View style={styles.preferenceItem}>
						<View style={styles.preferenceContent}>
							<Text style={styles.preferenceTitleText}>
								Female only
							</Text>
							<Text style={styles.preferenceDescriptionText}>
								Only female riders can join
							</Text>
						</View>
						<Switch
							value={femaleOnly}
							onValueChange={setFemaleOnly}
							accessibilityLabel="Female only toggle"
						/>
					</View>

					{/* Alcohol Free */}
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
							accessibilityLabel="Alcohol free toggle"
						/>
					</View>
				</View>

				{/* Create Group Button */}
				<TouchableOpacity
					style={styles.createButton}
					onPress={handleCreateGroup}
					accessibilityLabel="Create ride group"
					disabled={isCreating}
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
		alignItems: "center",
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingVertical: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		gap: 12,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
	},
	backIcon: {
		fontSize: 24,
		color: COLORS.primary,
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.primary,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		gap: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		gap: 16,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.primary,
	},
	inputGroup: {
		gap: 8,
		marginBottom: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.primary,
	},
	labelRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	addStopButton: {
		fontSize: 14,
		color: COLORS.primary,
		fontWeight: "600",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.4,
		borderColor: COLORS.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		height: 48,
		gap: 8,
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
		marginTop: 4,
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
		borderRadius: 10,
		overflow: "hidden",
		height: 48,
		justifyContent: "center",
	},
	picker: {
		height: 48,
		color: COLORS.text,
	},
	preferenceItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#f3f4f6",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 12,
		marginBottom: 12,
	},
	preferenceContent: {
		flex: 1,
	},
	preferenceTitleText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: 4,
	},
	preferenceDescriptionText: {
		fontSize: 13,
		color: COLORS.textSecondary,
	},
	createButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 10,
		paddingVertical: 14,
		alignItems: "center",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
