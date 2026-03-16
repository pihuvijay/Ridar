import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Pressable,
	ScrollView,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

interface PartyMember {
	id: string;
	name: string;
	initial: string;
	status: string;
	isLeader: boolean;
}

interface WaitScreenProps {
	rideGroup?: any;
	onContinue: () => void;
}

export const WaitScreen: React.FC<WaitScreenProps> = ({
	rideGroup,
	onContinue,
}) => {
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
		rideGroup?.pickup?.label ??
		rideGroup?.pickupLocation ??
		"Pickup location not set";

	const destination =
		rideGroup?.destination?.label ??
		rideGroup?.destination ??
		"Destination not set";

	const vehicleName =
		rideGroup?.driver?.vehicle ??
		rideGroup?.vehicle ??
		"Vehicle details unavailable";

	const licensePlate =
		rideGroup?.driver?.licensePlate ?? rideGroup?.licensePlate ?? "Pending";

	const distance =
		rideGroup?.driver?.distance ?? rideGroup?.distance ?? "On the way";

	const arrivalTime =
		rideGroup?.arrivalTime ??
		(rideGroup?.leavingIn ? `${rideGroup.leavingIn} min` : "Soon");

	const driverName =
		rideGroup?.driver?.name ??
		rideGroup?.driverName ??
		leader.name ??
		"Driver assigned";

	const allMembersPresent = members.length > 0;
	const waitingForLeader = !rideGroup?.driver && !!leader;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topSection}>
				<View style={styles.pickupMarker}>
					<Text style={styles.pickupMarkerIcon}>📍</Text>
				</View>

				<View style={styles.arrivalCard}>
					<Text style={styles.arrivalLabel}>Ride status</Text>
					<Text style={styles.arrivalTime}>{arrivalTime}</Text>
				</View>

				<View style={styles.vehicleIcon}>
					<Text style={styles.vehicleEmoji}>🚗</Text>
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
								<Text style={styles.distanceIcon}>📍</Text>
								<Text style={styles.distanceText}>
									{distance}
								</Text>
							</View>
						</View>

						<Pressable style={styles.contactButton}>
							<Text style={styles.contactIcon}>📞</Text>
						</Pressable>
					</View>

					<View style={styles.divider} />

					<View style={styles.pickupSection}>
						<View style={styles.locationRow}>
							<Text style={styles.locationIcon}>📍</Text>
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
							<Text style={styles.locationIcon}>🎯</Text>
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

					<View style={styles.divider} />

					<View style={styles.partySection}>
						<View style={styles.partyHeader}>
							<Text style={styles.partyIcon}>👥</Text>
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
												<Text
													style={
														styles.leaderBadgeText
													}
												>
													👑
												</Text>
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

									<Text style={styles.checkmark}>✓</Text>
								</View>
							))}
						</View>

						<View style={styles.statusMessages}>
							{allMembersPresent && (
								<View style={styles.successMessage}>
									<Text style={styles.successIcon}>✓</Text>
									<Text style={styles.successText}>
										Party details loaded
									</Text>
								</View>
							)}

							{waitingForLeader && (
								<View style={styles.infoMessage}>
									<Text style={styles.infoIcon}>⏳</Text>
									<Text style={styles.infoText}>
										Waiting for ride confirmation...
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
