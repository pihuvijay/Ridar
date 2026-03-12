import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Pressable,
	TextInput,
	StyleSheet,
	FlatList,
	SafeAreaView,
} from "react-native";
import { partiesService } from "../services/api";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

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
}

interface RideGroupsScreenProps {
	onBack: () => void;
	userName: string;
	onJoinRide: (rideGroup: RideCard) => void;
	onViewSettings: () => void;
	onViewProfile: () => void;
}

export const RideGroupsScreen: React.FC<RideGroupsScreenProps> = ({
	onBack,
	userName,
	onJoinRide,
	onViewSettings,
	onViewProfile,
}) => {
	const [currentLocation, setCurrentLocation] = useState("");
	const [destination, setDestination] = useState("");
	const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
	const [rides, setRides] = useState<RideCard[]>([]);

	const toggleFilter = (filterId: string) => {
		setActiveFilters((prev) => {
			const newFilters = new Set(prev);
			if (newFilters.has(filterId)) {
				newFilters.delete(filterId);
			} else {
				newFilters.add(filterId);
			}
			return newFilters;
		});
	};

	useEffect(() => {
		const fetchRides = async () => {
			try {
				const response = await partiesService.list();

				if (!response.success) {
					console.log(
						"[rides] failed to load parties:",
						response.message,
					);
					return;
				}

				const mappedRides: RideCard[] = (response.data ?? []).map(
					(party: any) => ({
						id: party.id,
						destination:
							party.destination?.label ?? "Unknown destination",
						pickup: party.pickup?.label ?? "Unknown pickup",
						price: 0,
						leavingIn: Number(party.leaveBy ?? 0),
						currentPassengers: party.currentMembers ?? 1,
						maxPassengers: party.maxMembers ?? 4,
						driverName: party.name ?? "Ride Group",
						driverInitial: (party.name ?? "R")
							.charAt(0)
							.toUpperCase(),
						driverTrips: 0,
						tags: [],
					}),
				);

				setRides(mappedRides);
			} catch (err) {
				console.error("Failed to load rides", err);
			}
		};

		fetchRides();
	}, []);

	const renderRideCard = ({ item }: { item: RideCard }) => (
		<Pressable
			style={styles.rideCard}
			onPress={() => onJoinRide(item)}
			android_ripple={{ color: COLORS.primaryHover }}
		>
			<View style={styles.cardHeader}>
				<View style={styles.cardDetails}>
					<View style={styles.locationItem}>
						<Text style={styles.locationLabel}>Going to</Text>
						<Text style={styles.locationValue}>
							{item.destination}
						</Text>
					</View>
					<View style={styles.locationItem}>
						<Text style={styles.locationLabel}>Pickup</Text>
						<Text style={styles.locationValue}>{item.pickup}</Text>
					</View>
				</View>
				<View style={styles.priceSection}>
					<Text style={styles.priceValue}>£{item.price}</Text>
					<Text style={styles.priceLabel}>per person</Text>
				</View>
			</View>

			<View style={styles.cardDivider} />

			<View style={styles.cardInfo}>
				<View style={styles.infoLeft}>
					<View style={styles.infoChip}>
						<Text style={styles.infoChipText}>
							⏱ Leaving in {item.leavingIn} min
						</Text>
					</View>
					<View style={styles.infoChip}>
						<Text style={styles.infoChipText}>
							👥 {item.currentPassengers}/{item.maxPassengers}
						</Text>
					</View>
				</View>

				{item.tags?.length > 0 && (
					<View style={styles.tagsContainer}>
						{item.tags.map((tag, index) => (
							<View
								key={index}
								style={[
									styles.tag,
									{
										backgroundColor:
											tag === "Female Only"
												? COLORS.primaryLight
												: COLORS.success + "20",
									},
								]}
							>
								<Text
									style={[
										styles.tagText,
										{
											color:
												tag === "Female Only"
													? COLORS.primary
													: COLORS.success,
										},
									]}
								>
									{tag}
								</Text>
							</View>
						))}
					</View>
				)}
			</View>

			<View style={styles.cardDivider} />

			<View style={styles.driverSection}>
				<View style={styles.driverAvatar}>
					<Text style={styles.driverAvatarText}>
						{item.driverInitial}
					</Text>
					<View style={styles.badgeContainer}>
						<Text style={styles.badgeText}>⭐</Text>
					</View>
				</View>
				<View style={styles.driverInfo}>
					<Text style={styles.driverName}>{item.driverName}</Text>
					<Text style={styles.driverTrips}>
						{item.driverTrips} trips
					</Text>
				</View>
			</View>
		</Pressable>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerSection}>
				<Pressable style={styles.headerButton} onPress={onBack}>
					<View style={styles.headerButtonContent}>
						<Text style={styles.headerTitle}>
							Current Ride Groups
						</Text>
						<Text style={styles.headerSubtitle}>Leaving now</Text>
					</View>
				</Pressable>
				<View style={styles.headerNav}>
					<Pressable
						onPress={onViewSettings}
						style={styles.navButton}
					>
						<Text style={styles.navIcon}>⚙️</Text>
					</Pressable>
					<Pressable onPress={onViewProfile} style={styles.navButton}>
						<Text style={styles.navIcon}>👤</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.filtersSection}>
				<View style={styles.inputGroup}>
					<Text style={styles.inputIcon}>📍</Text>
					<TextInput
						style={styles.input}
						placeholder="Where are you?"
						placeholderTextColor={COLORS.textSecondary}
						value={currentLocation}
						onChangeText={setCurrentLocation}
					/>
				</View>
				<View style={styles.inputGroup}>
					<Text style={styles.inputIcon}>🎯</Text>
					<TextInput
						style={styles.input}
						placeholder="Where do you want to go?"
						placeholderTextColor={COLORS.textSecondary}
						value={destination}
						onChangeText={setDestination}
					/>
				</View>
			</View>

			<View style={styles.filterButtonsSection}>
				<Text style={styles.filtersTitle}>Filters</Text>
				<View style={styles.filterButtonsContainer}>
					<Pressable
						style={[
							styles.filterButton,
							activeFilters.has("female-only") &&
								styles.filterButtonActive,
						]}
						onPress={() => toggleFilter("female-only")}
					>
						<Text style={styles.filterButtonText}>Female Only</Text>
					</Pressable>
					<Pressable
						style={[
							styles.filterButton,
							activeFilters.has("alcohol-free") &&
								styles.filterButtonActive,
						]}
						onPress={() => toggleFilter("alcohol-free")}
					>
						<Text style={styles.filterButtonText}>
							Alcohol Free
						</Text>
					</Pressable>
					<Pressable
						style={[
							styles.filterButton,
							activeFilters.has("same-course") &&
								styles.filterButtonActive,
						]}
						onPress={() => toggleFilter("same-course")}
					>
						<Text style={styles.filterButtonText}>
							Same Course as Me
						</Text>
					</Pressable>
				</View>
			</View>

			<FlatList
				data={rides}
				renderItem={renderRideCard}
				keyExtractor={(item) => item.id}
				scrollEnabled={false}
				contentContainerStyle={styles.listContent}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	headerSection: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	headerButton: {
		flex: 1,
	},
	headerButtonContent: {
		gap: SPACING.xs,
	},
	headerTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	headerNav: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	navButton: {
		padding: SPACING.sm,
		borderRadius: BORDER_RADIUS.md,
		backgroundColor: COLORS.primaryLight,
	},
	navIcon: {
		fontSize: FONT_SIZES.lg,
	},
	filtersSection: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		gap: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	inputGroup: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: BORDER_RADIUS.md,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: SPACING.md,
		backgroundColor: COLORS.background,
	},
	inputIcon: {
		fontSize: FONT_SIZES.lg,
		marginRight: SPACING.sm,
	},
	input: {
		flex: 1,
		paddingVertical: SPACING.md,
		fontSize: FONT_SIZES.base,
		color: COLORS.text,
	},
	filterButtonsSection: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	filtersTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SPACING.md,
	},
	filterButtonsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: SPACING.md,
	},
	filterButton: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primaryLight,
	},
	filterButtonActive: {
		backgroundColor: COLORS.primary,
	},
	filterButtonText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "500",
	},
	listContent: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		gap: SPACING.md,
	},
	rideCard: {
		backgroundColor: COLORS.background,
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: SPACING.md,
		marginBottom: SPACING.md,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: SPACING.md,
	},
	cardDetails: {
		flex: 1,
		gap: SPACING.md,
	},
	locationItem: {
		gap: SPACING.xs,
	},
	locationLabel: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	locationValue: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
		marginTop: SPACING.xs,
	},
	priceSection: {
		alignItems: "flex-end",
		gap: SPACING.xs,
	},
	priceValue: {
		fontSize: FONT_SIZES.xxl,
		fontWeight: "700",
		color: COLORS.primary,
	},
	priceLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	cardDivider: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: SPACING.md,
	},
	cardInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: SPACING.md,
	},
	infoLeft: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	infoChip: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
	},
	infoChipText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.success,
		fontWeight: "500",
	},
	tagsContainer: {
		flexDirection: "row",
		gap: SPACING.sm,
	},
	tag: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: BORDER_RADIUS.full,
	},
	tagText: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "500",
	},
	driverSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		paddingTop: SPACING.md,
	},
	driverAvatar: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	driverAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	badgeContainer: {
		position: "absolute",
		top: -8,
		right: -8,
		width: 28,
		height: 28,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.accentYellow,
		justifyContent: "center",
		alignItems: "center",
	},
	badgeText: {
		fontSize: FONT_SIZES.sm,
	},
	driverInfo: {
		flex: 1,
		gap: SPACING.xs,
	},
	driverName: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	driverTrips: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
});
