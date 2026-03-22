import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import { uberService } from "../services/api";

interface PartyMember {
	id: string;
	name: string;
	initial: string;
	status: string;
	isLeader: boolean;
}

type UberRideStatus = 'processing' | 'accepted' | 'arriving' | 'in_progress' | 'cancelled';

const STATUS_LABELS: Record<UberRideStatus, string> = {
	processing: 'Finding your driver...',
	accepted: 'Driver on the way',
	arriving: 'Almost here!',
	in_progress: 'Ride in progress',
	cancelled: 'Ride cancelled',
};

interface WaitScreenProps {
	rideGroup?: any;
	uberRide?: any;  // initial ride data from POST /uber/request
	onContinue: () => void;
}

export const WaitScreen: React.FC<WaitScreenProps> = ({
	rideGroup,
	uberRide: initialUberRide,
	onContinue,
}) => {
	const [uberRide, setUberRide] = useState<any>(initialUberRide ?? null);
	const [pricePerPerson, setPricePerPerson] = useState<number | null>(null);
	const pollRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const fetchPrice = async () => {
			const startLat = uberRide?.pickup?.lat ?? rideGroup?.pickup?.lat;
			const startLng = uberRide?.pickup?.lng ?? rideGroup?.pickup?.lng;
			const endLat = uberRide?.dropoff?.lat ?? rideGroup?.destination?.lat;
			const endLng = uberRide?.dropoff?.lng ?? rideGroup?.destination?.lng;

			if (startLat && startLng && endLat && endLng) {
				try {
					const res = await uberService.getPriceEstimates(startLat, startLng, endLat, endLng);
					if (res.success && res.data?.length > 0) {
						const uberX = res.data.find((p: any) => p.display_name === 'UberX') || res.data[0];
						const totalEst = (uberX.low_estimate + uberX.high_estimate) / 2;
						const membersCount = rideGroup?.members?.length || 1;
						setPricePerPerson(totalEst / membersCount);
					}
				} catch (err) {
					console.warn('[WaitScreen] price estimate error:', err);
				}
			}
		};
		fetchPrice();
	}, [uberRide?.pickup?.lat, rideGroup?.pickup?.lat]);

	useEffect(() => {
		const rideId = uberRide?.rideId;
		if (!rideId) return;

		const poll = async () => {
			try {
				const res = await uberService.getRideStatus(rideId);
				if (res.success) {
					setUberRide(res.data);
					// Stop polling once ride is terminal
					if (res.data?.status === 'in_progress' || res.data?.status === 'cancelled') {
						if (pollRef.current) clearInterval(pollRef.current);
					}
				}
			} catch (err) {
				console.warn('[WaitScreen] poll error:', err);
			}
		};

		poll(); // immediate first fetch
		pollRef.current = setInterval(poll, 5000);

		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, [uberRide?.rideId]);
	const members: PartyMember[] = rideGroup?.members?.map(
		(member: any, index: number) => ({
			id: member.id?.toString() ?? `${index}`,
			name: member.name ?? member.full_name ?? "Unknown Rider",
			initial: (member.name ?? member.full_name ?? "U")
				.charAt(0)
				.toUpperCase(),
			status: member.status ?? "At pickup point",
			isLeader:
				member.isLeader === true ||
				member.is_creator === true ||
				member.role === "leader" ||
				index === 0,
		}),
	) ?? [
		{
			id: "1",
			name: rideGroup?.name ?? "Ride Group",
			initial: (rideGroup?.name ?? "R").charAt(0).toUpperCase(),
			status: "Waiting at pickup point",
			isLeader: true,
		},
	];

	const leader = members.find((member) => member.isLeader) ??
		members[0] ?? {
			name: "Ride Leader",
			initial: "R",
		};

	const pickupLocation =
		uberRide?.pickup?.label ??
		rideGroup?.pickup?.label ??
		rideGroup?.pickupLocation ??
		"Pickup location not set";

	const destination =
		uberRide?.dropoff?.label ??
		rideGroup?.destination?.label ??
		rideGroup?.destination ??
		"Destination not set";

	const vehicleName = uberRide?.vehicle
		? `${uberRide.vehicle.make} ${uberRide.vehicle.model}`
		: rideGroup?.vehicle ?? "Vehicle details pending";

	const licensePlate =
		uberRide?.vehicle?.license_plate ?? rideGroup?.licensePlate ?? "Pending";

	const distance =
		uberRide?.eta != null ? `${uberRide.eta} min away` : "On the way";

	const uberStatus: UberRideStatus = uberRide?.status ?? 'processing';
	const arrivalTime = STATUS_LABELS[uberStatus] ?? "Soon";

	const driverName =
		uberRide?.driver?.name ??
		rideGroup?.driver?.name ??
		rideGroup?.driverName ??
		leader.name ??
		"Awaiting driver";

	const allMembersPresent = members.length > 0;
	const isProcessing = uberStatus === 'processing';

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topSection}>
				<View style={styles.pickupMarker}>
					<Ionicons name="location-outline" size={FONT_SIZES.xxl} color={COLORS.primary} />
				</View>

				<View style={styles.arrivalCard}>
					{isProcessing
						? <ActivityIndicator size="small" color={COLORS.primary} />
						: <Text style={styles.arrivalLabel}>ETA</Text>
					}
					<Text style={styles.arrivalTime}>{arrivalTime}</Text>
					<View style={[styles.statusBadge, styles[`status_${uberStatus}` as keyof typeof styles] as any]}>
						<Text style={styles.statusBadgeText}>{uberStatus.replace('_', ' ').toUpperCase()}</Text>
					</View>
				</View>

				<View style={styles.vehicleIcon}>
					<Ionicons name="car-outline" size={FONT_SIZES.xxl} color={COLORS.text} />
				</View>
			</View>

			<View style={styles.bottomSection}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.driverSection}>
						<View style={styles.driverAvatar}>
							<Text style={styles.driverAvatarText}>
								{driverName.charAt(0).toUpperCase()}
							</Text>
						</View>

						<View style={styles.driverInfo}>
							<Text style={styles.driverName}>{driverName}</Text>

							<View style={styles.vehicleDetails}>
								<Text style={styles.vehicleModel}>
									{vehicleName}
								</Text>
								<View style={styles.licensePlate}>
									<Text style={styles.licensePlateText}>
										{licensePlate}
									</Text>
								</View>
							</View>

							<View style={styles.distanceRow}>
								<Ionicons name="location-outline" size={14} color={COLORS.textSecondary} style={styles.distanceIcon} />
								<Text style={styles.distanceText}>
									{distance}
								</Text>
							</View>
						</View>

						<Pressable style={styles.contactButton}>
							<Ionicons name="call-outline" size={18} color={COLORS.primary} style={styles.contactIcon} />
						</Pressable>
					</View>

					<View style={styles.divider} />

					<View style={styles.pickupSection}>
						<View style={styles.locationRow}>
							<Ionicons name="location-outline" size={18} color={COLORS.primary} style={styles.locationIcon} />
							<View style={styles.locationContent}>
								<Text style={styles.locationLabel}>
									Pickup Location
								</Text>
								<Text style={styles.locationName}>
									{pickupLocation}
								</Text>
							</View>
						</View>

						<View style={{ height: SPACING.md }} />

						<View style={styles.locationRow}>
							<Ionicons name="navigate-outline" size={18} color={COLORS.primary} style={styles.locationIcon} />
							<View style={styles.locationContent}>
								<Text style={styles.locationLabel}>
									Destination
								</Text>
								<Text style={styles.locationName}>
									{destination}
								</Text>
							</View>
						</View>
					</View>

					{pricePerPerson !== null && (
						<View style={[styles.locationRow, { marginTop: SPACING.md }]}>
							<Text style={styles.locationIcon}>💷</Text>
							<View style={styles.locationContent}>
								<Text style={styles.locationLabel}>
									Estimated Price
								</Text>
								<Text style={styles.locationName}>
									£{pricePerPerson.toFixed(2)} / person
								</Text>
							</View>
						</View>
					)}

					<View style={styles.divider} />

					<View style={styles.partySection}>
						<View style={styles.partyHeader}>
							<Ionicons name="people-outline" size={18} color={COLORS.text} style={styles.partyIcon} />
							<Text style={styles.partyTitle}>
								Your Party ({members.length})
							</Text>
						</View>

						<View style={styles.membersList}>
							{members.map((member) => (
								<View key={member.id} style={styles.memberCard}>
									<View style={styles.memberAvatar}>
										<Text style={styles.memberAvatarText}>
											{member.initial}
										</Text>
										{member.isLeader && (
											<View style={styles.leaderBadge}>
												<Ionicons name="star" size={12} color={COLORS.primary} />
											</View>
										)}
									</View>

									<View style={styles.memberInfo}>
										<View style={styles.memberNameRow}>
											<Text style={styles.memberName}>
												{member.name}
											</Text>
											{member.isLeader && (
												<View
													style={styles.leaderLabel}
												>
													<Text
														style={
															styles.leaderLabelText
														}
													>
														Leader
													</Text>
												</View>
											)}
										</View>
										<Text style={styles.memberStatus}>
											{member.status}
										</Text>
									</View>

									<Ionicons name="checkmark" size={16} color={COLORS.primary} style={styles.checkmark} />
								</View>
							))}
						</View>

						<View style={styles.statusMessages}>
							{allMembersPresent && (
								<View style={styles.successMessage}>
									<Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={styles.successIcon} />
									<Text style={styles.successText}>
										Party details loaded
									</Text>
								</View>
							)}

							{isProcessing && (
								<View style={styles.infoMessage}>
									<Ionicons name="hourglass-outline" size={16} color={COLORS.textSecondary} style={styles.infoIcon} />
									<Text style={styles.infoText}>
										Finding your driver...
									</Text>
								</View>
							)}
						</View>
					</View>
				</ScrollView>

				<Pressable style={styles.continueButton} onPress={onContinue}>
					<Text style={styles.continueButtonText}>Continue</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.primaryLight,
	},
	topSection: {
		flex: 0.3,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	pickupMarker: {
		position: "absolute",
		left: 30,
	},
	pickupMarkerIcon: {
		fontSize: FONT_SIZES.xxl,
		color: COLORS.primary,
	},
	arrivalCard: {
		backgroundColor: COLORS.background,
		borderRadius: BORDER_RADIUS.full,
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.md,
		alignItems: "center",
		gap: SPACING.sm,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	arrivalLabel: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	arrivalTime: {
		fontSize: FONT_SIZES.xxl,
		fontWeight: "700",
		color: COLORS.primary,
	},
	vehicleIcon: {
		position: "absolute",
		right: 30,
	},
	vehicleEmoji: {
		fontSize: FONT_SIZES.xxl,
	},
	bottomSection: {
		flex: 0.7,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: BORDER_RADIUS.xl,
		borderTopRightRadius: BORDER_RADIUS.xl,
		paddingTop: SPACING.lg,
		paddingHorizontal: SPACING.md,
		paddingBottom: SPACING.lg,
	},
	driverSection: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.md,
		paddingBottom: SPACING.md,
	},
	driverAvatar: {
		width: 60,
		height: 60,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	driverAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.xxl,
		fontWeight: "700",
	},
	driverInfo: {
		flex: 1,
		gap: SPACING.sm,
	},
	driverName: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	vehicleDetails: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		flexWrap: "wrap",
	},
	vehicleModel: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	licensePlate: {
		backgroundColor: COLORS.primaryLight,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: BORDER_RADIUS.md,
	},
	licensePlateText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		fontFamily: "Courier New",
	},
	distanceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
	},
	distanceIcon: {
		fontSize: FONT_SIZES.base,
	},
	distanceText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	contactButton: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	contactIcon: {
		fontSize: FONT_SIZES.lg,
	},
	divider: {
		height: 1,
		backgroundColor: COLORS.border,
	},
	pickupSection: {
		paddingVertical: SPACING.md,
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.md,
	},
	locationIcon: {
		fontSize: FONT_SIZES.lg,
		marginTop: SPACING.xs,
	},
	locationContent: {
		flex: 1,
		gap: SPACING.xs,
	},
	locationLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	locationName: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	partySection: {
		gap: SPACING.md,
		paddingVertical: SPACING.md,
	},
	partyHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
	},
	partyIcon: {
		fontSize: FONT_SIZES.lg,
	},
	partyTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	membersList: {
		gap: SPACING.sm,
	},
	memberCard: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.success + "15",
		borderWidth: 1,
		borderColor: COLORS.success + "40",
		gap: SPACING.md,
	},
	memberAvatar: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	memberAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	leaderBadge: {
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
	leaderBadgeText: {
		fontSize: FONT_SIZES.sm,
	},
	memberInfo: {
		flex: 1,
		gap: SPACING.xs,
	},
	memberNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		flexWrap: "wrap",
	},
	memberName: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	leaderLabel: {
		backgroundColor: COLORS.accentYellow,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: BORDER_RADIUS.full,
	},
	leaderLabelText: {
		fontSize: FONT_SIZES.xs,
		color: "#a65f00",
		fontWeight: "500",
	},
	memberStatus: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	checkmark: {
		fontSize: FONT_SIZES.lg,
		color: COLORS.success,
	},
	statusMessages: {
		gap: SPACING.md,
		marginTop: SPACING.md,
	},
	successMessage: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.success + "15",
		borderWidth: 1,
		borderColor: COLORS.success + "40",
		gap: SPACING.md,
	},
	successIcon: {
		fontSize: FONT_SIZES.lg,
		color: COLORS.success,
	},
	successText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.success,
		fontWeight: "600",
	},
	infoMessage: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primaryLight,
		borderWidth: 1,
		borderColor: COLORS.border,
		gap: SPACING.md,
	},
	infoIcon: {
		fontSize: FONT_SIZES.lg,
	},
	infoText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	statusBadge: {
		paddingHorizontal: SPACING.sm,
		paddingVertical: 3,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primaryLight,
	},
	statusBadgeText: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700" as const,
		color: COLORS.primary,
	},
	status_processing: { backgroundColor: '#fef3c7' },
	status_accepted:   { backgroundColor: '#d1fae5' },
	status_arriving:   { backgroundColor: '#dbeafe' },
	status_in_progress: { backgroundColor: '#ede9fe' },
	status_cancelled:  { backgroundColor: '#fee2e2' },
	continueButton: {
		paddingVertical: SPACING.lg,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		marginTop: SPACING.md,
	},
	continueButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
});
