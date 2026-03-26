import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Pressable,
	ScrollView,
	ActivityIndicator,
	Modal,
	Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import {
	partiesService,
	stripeService,
	uberService,
	userService,
} from "../services/api";
interface PartyMember {
	id: string;
	name: string;
	initial: string;
	status: string;
	isLeader: boolean;
	isSelf?: boolean;
}

type UberRideStatus =
	| "idle"
	| "processing"
	| "accepted"
	| "arriving"
	| "in_progress"
	| "completed";

const STATUS_LABELS: Record<UberRideStatus, string> = {
	idle: "Waiting for your group",
	processing: "Finding your driver...",
	accepted: "Driver on the way",
	arriving: "Driver arriving soon",
	in_progress: "Ride in progress",
	completed: "Ride completed",
};

interface WaitScreenProps {
	rideGroup?: any;
	uberRide?: any;
	onContinue: (updatedRideGroup?: any) => void;
	onExitGroup: () => void;
}

export const WaitScreen: React.FC<WaitScreenProps> = ({
	rideGroup,
	uberRide: initialUberRide,
	onContinue,
	onExitGroup,
}) => {
	const [uberRide, setUberRide] = useState<any>(initialUberRide ?? null);
	const [pricePerPerson, setPricePerPerson] = useState<number | null>(null);
	const [membersState, setMembersState] = useState<any[] | null>(
		rideGroup?.members ? [...rideGroup.members] : null,
	);
	const [isRequestingDriver, setIsRequestingDriver] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [timeLeft, setTimeLeft] = useState(300);
	const [isPaying, setIsPaying] = useState(false);
	const [paidMemberIds, setPaidMemberIds] = useState<string[]>([]);
	const [paymentModalVisible, setPaymentModalVisible] = useState(false);

	const pollRef = useRef<NodeJS.Timeout | null>(null);
	const simRef = useRef<NodeJS.Timeout | null>(null);

	const leaderId =
		rideGroup?.leaderUserId ??
		rideGroup?.creator_user_id ??
		rideGroup?.creatorUserId;

	const isLeader =
		!!currentUserId &&
		!!leaderId &&
		currentUserId.toString() === leaderId.toString();

	useEffect(() => {
		(async () => {
			try {
				const res = await userService.me();
				if (!(res as any)?.success) return;

				const me = (res as any).data;
				const meId =
					me?.id ??
					me?.user?.id ??
					me?.profile?.id ??
					me?.user_id ??
					null;

				const displayName =
					me?.name ?? me?.full_name ?? me?.fullName ?? "Test User";

				setCurrentUserId(meId ? meId.toString() : null);

				setMembersState((prev) => {
					const existing = prev ?? rideGroup?.members ?? [];

					if (existing.length > 0) {
						return existing;
					}

					const hasLeader = existing.some((m: any) => {
						if (!m) return false;
						return m.is_creator === true || m.role === "leader";
					});

					if (hasLeader) return existing;

					const leader = {
						id: meId ? meId.toString() : "me",
						name: displayName,
						is_creator: true,
						status: "At pickup point",
					};

					return [leader, ...existing];
				});
			} catch {
				// ignore
			}
		})();
	}, [rideGroup?.members]);

	useEffect(() => {
		const fetchPrice = async () => {
			if (
				typeof rideGroup?.pricePerPerson === "number" &&
				rideGroup.pricePerPerson > 0
			) {
				setPricePerPerson(rideGroup.pricePerPerson);
				return;
			}

			if (typeof rideGroup?.price === "number" && rideGroup.price > 0) {
				setPricePerPerson(rideGroup.price);
				return;
			}

			const startLat = uberRide?.pickup?.lat ?? rideGroup?.pickup?.lat;
			const startLng = uberRide?.pickup?.lng ?? rideGroup?.pickup?.lng;
			const endLat =
				uberRide?.dropoff?.lat ?? rideGroup?.destination?.lat;
			const endLng =
				uberRide?.dropoff?.lng ?? rideGroup?.destination?.lng;

			if (startLat && startLng && endLat && endLng) {
				try {
					const res = await uberService.getPriceEstimates(
						startLat,
						startLng,
						endLat,
						endLng,
					);

					if (res.success && res.data?.length > 0) {
						const uberX =
							res.data.find(
								(p: any) => p.display_name === "UberX",
							) || res.data[0];

						const totalEst =
							(uberX.low_estimate + uberX.high_estimate) / 2;
						const membersCount =
							membersState?.length ||
							rideGroup?.members?.length ||
							1;

						setPricePerPerson(totalEst / membersCount);
					}
				} catch (err) {
					console.warn("[WaitScreen] price estimate error:", err);
				}
			}
		};

		fetchPrice();
	}, [
		rideGroup?.pricePerPerson,
		rideGroup?.price,
		rideGroup?.pickup?.lat,
		rideGroup?.destination?.lat,
		uberRide?.pickup?.lat,
		uberRide?.dropoff?.lat,
		membersState?.length,
	]);

	useEffect(() => {
		if (uberRide) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [uberRide]);

	useEffect(() => {
		const rideId = uberRide?.rideId;
		if (!rideId) return;

		const poll = async () => {
			try {
				const res = await uberService.getRideStatus(rideId);
				if (res.success) {
					setUberRide((prev: any) => {
						if (prev?.status === "completed") {
							return prev;
						}
						return res.data;
					});

					if (res.data?.status === "cancelled") {
						if (pollRef.current) clearInterval(pollRef.current);
					}
				}
			} catch (err) {
				console.warn("[WaitScreen] poll error:", err);
			}
		};

		poll();
		pollRef.current = setInterval(poll, 5000);

		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, [uberRide?.rideId]);

	useEffect(() => {
		if (!uberRide || uberRide.status !== "accepted") return;

		const timer = setTimeout(() => {
			setUberRide((prev: any) =>
				prev
					? {
							...prev,
							status: "completed",
						}
					: prev,
			);
		}, 5000);

		return () => clearTimeout(timer);
	}, [uberRide?.status]);

	// Demo-only fake joins
	useEffect(() => {
		if (uberRide) return;

		const NAMES = [
			"Alex Johnson",
			"Samantha Patel",
			"Jordan Smith",
			"Taylor Brown",
			"Casey Williams",
			"Morgan Davis",
			"Riley Thompson",
			"Jamie Clark",
			"Cameron Lewis",
			"Avery Martin",
		];

		const maxMembers =
			rideGroup?.maxMembers ?? rideGroup?.members?.length ?? 1;
		const current = membersState ?? rideGroup?.members ?? [];
		const availableSlots = Math.max(0, maxMembers - current.length);
		const targetAdds = Math.min(availableSlots, 3);

		if (targetAdds <= 0) return;

		const shuffled = [...NAMES]
			.sort(() => Math.random() - 0.5)
			.slice(0, targetAdds);

		let added = 0;

		simRef.current = setInterval(
			() => {
				setMembersState((prev) => {
					const now = prev ? [...prev] : [];
					if (added >= shuffled.length || now.length >= maxMembers) {
						if (simRef.current) clearInterval(simRef.current);
						return now;
					}

					now.push({
						id: `sim-${Date.now()}`,
						name: shuffled[added++] ?? `Guest ${now.length + 1}`,
						is_creator: false,
						status: "At pickup point",
					});

					return now;
				});
			},
			1500 + Math.random() * 1500,
		);

		return () => {
			if (simRef.current) clearInterval(simRef.current);
		};
	}, [rideGroup?.maxMembers, membersState?.length, uberRide]);

	const membersSource = membersState ?? rideGroup?.members ?? [];

	const members: PartyMember[] = membersSource.map(
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
			isSelf:
				member.isSelf === true ||
				member.is_self === true ||
				(!!currentUserId &&
					!!member.id &&
					member.id.toString() === currentUserId),
		}),
	);

	useEffect(() => {
		if (!uberRide) return;

		const fakeOtherPaidIds = membersSource
			.filter((member: any) => {
				const isLeaderMember =
					member.isLeader === true ||
					member.is_creator === true ||
					member.role === "leader";

				const isSelfMember =
					member.isSelf === true ||
					member.is_self === true ||
					(!!currentUserId &&
						!!member.id &&
						member.id.toString() === currentUserId);

				return !isLeaderMember && !isSelfMember;
			})
			.map((member: any) => member.id?.toString())
			.filter(Boolean);

		if (fakeOtherPaidIds.length === 0) return;

		setPaidMemberIds((prev) => {
			const alreadyHasAll = fakeOtherPaidIds.every((id) =>
				prev.includes(id),
			);
			if (alreadyHasAll) return prev;

			return [...new Set([...prev, ...fakeOtherPaidIds])];
		});
	}, [uberRide?.rideId, currentUserId]);

	const payableMembers = members.filter((member) => !member.isLeader);
	const currentUserMember = members.find((member) => member.isSelf);
	const currentUserHasPaid = currentUserMember
		? paidMemberIds.includes(currentUserMember.id)
		: false;
	const allPayingMembersPaid =
		payableMembers.length === 0 ||
		payableMembers.every((member) => paidMemberIds.includes(member.id));

	const leader = members.find((member) => member.isLeader) ??
		members[0] ?? { name: "Ride Leader", initial: "R" };

	const pickupLocation =
		rideGroup?.pickup?.label ??
		rideGroup?.pickupLocation ??
		"Pickup location not set";

	const destination =
		rideGroup?.destination?.label ??
		rideGroup?.destination ??
		"Destination not set";

	const vehicleName = uberRide?.vehicle
		? `${uberRide.vehicle.make} ${uberRide.vehicle.model}`
		: "Vehicle assigned after confirmation";

	const licensePlate = uberRide?.vehicle?.license_plate ?? "Pending";

	const distance =
		uberRide?.eta != null ? `${uberRide.eta} min away` : "On the way";

	const uberStatus: UberRideStatus = uberRide?.status ?? "idle";
	const arrivalTime = STATUS_LABELS[uberStatus] ?? "Soon";

	const driverName =
		uberRide?.driver?.name ??
		rideGroup?.leaderName ??
		rideGroup?.driverName ??
		leader.name ??
		"Ride Leader";

	const maxMembers =
		rideGroup?.maxMembers ?? rideGroup?.members?.length ?? members.length;

	const canLeaderConfirm = members.length >= 1;
	const isProcessing = uberRide != null && uberStatus === "processing";
	const canContinueToInsights = uberRide?.status === "completed";

	const handleSearchForDriver = async () => {
		if (!canLeaderConfirm || isRequestingDriver) return;

		const startLat = Number(rideGroup?.pickup?.lat);
		const startLng = Number(rideGroup?.pickup?.lng);
		const endLat = Number(rideGroup?.destination?.lat);
		const endLng = Number(rideGroup?.destination?.lng);

		if (
			Number.isNaN(startLat) ||
			Number.isNaN(startLng) ||
			Number.isNaN(endLat) ||
			Number.isNaN(endLng)
		) {
			Alert.alert(
				"Route error",
				"Pickup or destination coordinates are missing.",
			);
			return;
		}

		setIsRequestingDriver(true);

		try {
			const rideResponse = await uberService.requestRide({
				productId: "a1111c8c-c720-46c3-8534-2fcdd730040d",
				startLat,
				startLng,
				endLat,
				endLng,
			});

			if (rideResponse.success) {
				setUberRide(rideResponse.data);
			} else {
				Alert.alert(
					"Driver Search Failed",
					rideResponse.message || "Could not start driver search",
				);
			}
		} catch (err) {
			console.warn("[WaitScreen] requestRide error", err);
			Alert.alert("Error", "Failed to start driver search");
		} finally {
			setIsRequestingDriver(false);
		}
	};

	useEffect(() => {
		if (uberRide) return;
		if (!rideGroup?.demoAutoStartRide) return;
		if (isLeader) return;

		const timer = setTimeout(() => {
			handleSearchForDriver();
		}, 1800);

		return () => clearTimeout(timer);
	}, [uberRide, rideGroup?.demoAutoStartRide, isLeader]);

	const handleSecondaryAction = async () => {
		if (!rideGroup?.id) return;

		try {
			if (isLeader) {
				const res = await partiesService.cancel(rideGroup.id);
				if (!res.success) {
					Alert.alert(
						"Error",
						res.message || "Could not cancel group",
					);
					return;
				}

				Alert.alert(
					"Group Cancelled",
					"Your ride group has been cancelled.",
				);
				onExitGroup();
				return;
			}

			const res = await partiesService.leave(rideGroup.id);
			if (!res.success) {
				Alert.alert("Error", res.message || "Could not leave group");
				return;
			}

			Alert.alert("Left Group", "You have left the ride group.");
			onExitGroup();
		} catch (err) {
			Alert.alert("Error", "Something went wrong.");
		}
	};

	const handleFakePayment = async (method: "apple_pay" | "card") => {
		if (isPaying) return;

		setIsPaying(true);

		try {
			const amountInPence = Math.round((pricePerPerson ?? 0) * 100);
			const payingUserId =
				currentUserId ?? currentUserMember?.id ?? "demo-user";

			const res = await stripeService.demoPay({
				rideId: rideGroup?.id,
				userId: payingUserId,
				amount: amountInPence,
				method,
			});

			if (!res.success) {
				Alert.alert("Payment Failed", "Could not process payment.");
				return;
			}

			if (isLeader) {
				const allIds = members.map((member) => member.id);
				setPaidMemberIds(allIds);
			} else if (currentUserMember && !currentUserHasPaid) {
				setPaidMemberIds((prev) =>
					prev.includes(currentUserMember.id)
						? prev
						: [...prev, currentUserMember.id],
				);
			}

			Alert.alert("Payment Successful", "Stripe payment completed.");
		} catch {
			Alert.alert("Payment Failed", "Could not process payment.");
		} finally {
			setIsPaying(false);
		}
	};

	const updatedRideGroup = useMemo(
		() => ({
			...rideGroup,
			members: membersSource,
		}),
		[rideGroup, membersSource],
	);

	const minutes = Math.floor(timeLeft / 60);
	const seconds = String(timeLeft % 60).padStart(2, "0");

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.hero}>
				<View style={styles.heroTopRow}>
					<View style={styles.topPill}>
						<Ionicons
							name="people-outline"
							size={14}
							color={COLORS.textLight}
						/>
						<Text style={styles.topPillText}>
							{members.length}/{maxMembers} riders
						</Text>
					</View>

					{!uberRide && (
						<View style={styles.timerPill}>
							<Ionicons
								name="time-outline"
								size={14}
								color={COLORS.textLight}
							/>
							<Text style={styles.topPillText}>
								{minutes}:{seconds}
							</Text>
						</View>
					)}
				</View>

				<Text style={styles.heroTitle}>
					{uberRide
						? arrivalTime
						: isLeader
							? "Ready when you are"
							: "Waiting for leader"}
				</Text>

				<Text style={styles.heroSubtitle}>
					{uberRide
						? "Your driver request is in progress."
						: isLeader
							? "Confirm when you want to start searching for a driver."
							: "The party leader will confirm when ready."}
				</Text>

				<View style={styles.routeCard}>
					<View style={styles.routeRow}>
						<View style={styles.routeIconWrap}>
							<View style={styles.pickupDot} />
						</View>
						<View style={styles.routeTextWrap}>
							<Text style={styles.routeLabel}>Pickup</Text>
							<Text style={styles.routeValue}>
								{pickupLocation}
							</Text>
						</View>
					</View>

					<View style={styles.routeDivider} />

					<View style={styles.routeRow}>
						<View style={styles.routeIconWrap}>
							<Ionicons
								name="flag-outline"
								size={16}
								color={COLORS.text}
							/>
						</View>
						<View style={styles.routeTextWrap}>
							<Text style={styles.routeLabel}>Destination</Text>
							<Text style={styles.routeValue}>{destination}</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.sheet}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.sheetContent}
				>
					{pricePerPerson !== null && (
						<View style={styles.priceCard}>
							<View>
								<Text style={styles.cardLabel}>
									Estimated price
								</Text>
								<Text style={styles.priceValue}>
									£{pricePerPerson.toFixed(2)}
								</Text>
								<Text style={styles.priceSub}>per person</Text>
							</View>
							<View style={styles.priceBadge}>
								<Text style={styles.priceBadgeText}>
									Split fare
								</Text>
							</View>
						</View>
					)}

					{uberRide && (
						<View style={styles.driverCard}>
							<View style={styles.driverAvatar}>
								<Text style={styles.driverAvatarText}>
									{driverName.charAt(0).toUpperCase()}
								</Text>
							</View>

							<View style={styles.driverInfo}>
								<Text style={styles.driverName}>
									{driverName}
								</Text>
								<Text style={styles.driverMeta}>
									{vehicleName}
								</Text>
								<Text style={styles.driverMeta}>
									{licensePlate} • {distance}
								</Text>
							</View>

							<View style={styles.driverStatusPill}>
								<Text style={styles.driverStatusText}>
									{uberStatus.replace("_", " ").toUpperCase()}
								</Text>
							</View>
						</View>
					)}

					<View style={styles.partyCard}>
						<View style={styles.partyHeader}>
							<Text style={styles.sectionTitle}>Your party</Text>
							<Text style={styles.sectionCount}>
								{members.length}/{maxMembers}
							</Text>
						</View>

						<View style={styles.membersList}>
							{members.map((member) => (
								<View key={member.id} style={styles.memberRow}>
									<View style={styles.memberAvatar}>
										<Text style={styles.memberAvatarText}>
											{member.initial}
										</Text>
									</View>

									<View style={styles.memberInfo}>
										<View style={styles.memberNameRow}>
											<Text style={styles.memberName}>
												{member.isSelf
													? member.isLeader
														? "You (Leader)"
														: "You"
													: member.name}
											</Text>

											{member.isLeader && (
												<View style={styles.leaderPill}>
													<Text
														style={
															styles.leaderPillText
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

									{member.isLeader ? (
										<Ionicons
											name="star"
											size={18}
											color={COLORS.primary}
										/>
									) : paidMemberIds.includes(member.id) ? (
										<Ionicons
											name="checkmark-circle"
											size={18}
											color={COLORS.success}
										/>
									) : (
										<View style={styles.unpaidPill}>
											<Text style={styles.unpaidPillText}>
												Unpaid
											</Text>
										</View>
									)}
								</View>
							))}
						</View>
					</View>

					{uberRide && (
						<View style={styles.infoCard}>
							<Ionicons
								name="card-outline"
								size={16}
								color={COLORS.textSecondary}
							/>
							<Text style={styles.infoText}>
								{allPayingMembersPaid
									? "All riders have completed payment."
									: "Each rider must complete payment before the trip continues."}
							</Text>
						</View>
					)}

					{!uberRide && !isLeader && (
						<View style={styles.infoCard}>
							<Ionicons
								name="hourglass-outline"
								size={16}
								color={COLORS.textSecondary}
							/>
							<Text style={styles.infoText}>
								Waiting for party leader to confirm the ride
							</Text>
						</View>
					)}

					{uberRide && (
						<View style={styles.infoCard}>
							<Ionicons
								name="car-outline"
								size={16}
								color={COLORS.textSecondary}
							/>
							<Text style={styles.infoText}>
								Driver request started. You can continue once
								ready.
							</Text>
						</View>
					)}
				</ScrollView>
			</View>

			<View style={styles.footer}>
				{!uberRide && isLeader && canLeaderConfirm && (
					<Pressable
						style={[
							styles.confirmButton,
							isRequestingDriver && styles.primaryButtonDisabled,
						]}
						onPress={handleSearchForDriver}
						disabled={isRequestingDriver}
					>
						{isRequestingDriver ? (
							<ActivityIndicator color={COLORS.textLight} />
						) : (
							<>
								<Text style={styles.confirmTitle}>
									Confirm Ride
								</Text>
								<Text style={styles.confirmSub}>
									Start searching for a driver
								</Text>
							</>
						)}
					</Pressable>
				)}

				{uberRide && !currentUserHasPaid && (
					<Pressable
						style={[
							styles.stripeButton,
							isPaying && styles.primaryButtonDisabled,
						]}
						onPress={() => setPaymentModalVisible(true)}
						disabled={isPaying}
					>
						<Ionicons name="card-outline" size={18} color="#fff" />
						<Text style={styles.stripeButtonText}>Pay here</Text>
					</Pressable>
				)}

				{uberRide && currentUserHasPaid && !isLeader && (
					<View style={styles.paidBanner}>
						<Ionicons
							name="checkmark-circle"
							size={18}
							color={COLORS.success}
						/>
						<Text style={styles.paidBannerText}>
							Payment complete
						</Text>
					</View>
				)}

				{uberRide &&
					isLeader &&
					!allPayingMembersPaid &&
					!currentUserHasPaid && (
						<View style={styles.paidBanner}>
							<Text style={styles.secondaryActionText}>
								Waiting for all riders to complete payment
							</Text>
						</View>
					)}

				<Pressable
					style={styles.secondaryActionButton}
					onPress={handleSecondaryAction}
				>
					<Text style={styles.secondaryActionText}>
						{isLeader ? "Cancel Group" : "Leave Group"}
					</Text>
				</Pressable>

				{uberRide &&
					(isLeader ? allPayingMembersPaid : currentUserHasPaid) && (
						<Pressable
							style={[
								styles.continueButton,
								!canContinueToInsights &&
									styles.continueButtonDisabled,
							]}
							onPress={() => {
								if (!canContinueToInsights) return;

								onContinue({
									...updatedRideGroup,
									paidMemberIds,
								});
							}}
							disabled={!canContinueToInsights}
						>
							<Text
								style={[
									styles.continueButtonText,
									!canContinueToInsights &&
										styles.continueButtonTextDisabled,
								]}
							>
								Continue
							</Text>
						</Pressable>
					)}
			</View>

			<Modal
				visible={paymentModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setPaymentModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.paymentModal}>
						<Text style={styles.paymentModalTitle}>
							Choose payment method
						</Text>
						<Text style={styles.paymentModalSubtitle}>
							Pay £{pricePerPerson?.toFixed(2) ?? "0.00"}
						</Text>

						<Pressable
							style={styles.paymentOption}
							onPress={async () => {
								setPaymentModalVisible(false);
								await handleFakePayment("apple_pay");
							}}
						>
							<Ionicons
								name="logo-apple"
								size={20}
								color={COLORS.text}
							/>
							<Text style={styles.paymentOptionText}>
								Apple Pay
							</Text>
						</Pressable>

						<Pressable
							style={styles.paymentOption}
							onPress={async () => {
								setPaymentModalVisible(false);
								await handleFakePayment("card");
							}}
						>
							<Ionicons
								name="card-outline"
								size={20}
								color={COLORS.text}
							/>
							<Text style={styles.paymentOptionText}>
								Card payment
							</Text>
						</Pressable>

						<Pressable
							style={styles.closeModalButton}
							onPress={() => setPaymentModalVisible(false)}
						>
							<Text style={styles.closeModalButtonText}>
								Cancel
							</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
	},
	hero: {
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xl,
		backgroundColor: "#0F172A",
	},
	heroTopRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	topPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.12)",
	},
	timerPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(239,68,68,0.22)",
	},
	topPillText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
	},
	heroTitle: {
		fontSize: 30,
		fontWeight: "700",
		color: COLORS.textLight,
		marginBottom: 8,
	},
	heroSubtitle: {
		fontSize: FONT_SIZES.sm,
		lineHeight: 20,
		color: "rgba(255,255,255,0.75)",
		marginBottom: SPACING.lg,
	},
	routeCard: {
		backgroundColor: "rgba(255,255,255,0.08)",
		borderRadius: 22,
		padding: SPACING.md,
	},
	routeRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.md,
	},
	routeIconWrap: {
		width: 20,
		alignItems: "center",
		marginTop: 2,
	},
	pickupDot: {
		width: 10,
		height: 10,
		borderRadius: 999,
		backgroundColor: COLORS.success,
		marginTop: 4,
	},
	routeTextWrap: {
		flex: 1,
	},
	routeLabel: {
		fontSize: FONT_SIZES.xs,
		color: "rgba(255,255,255,0.6)",
		marginBottom: 4,
	},
	routeValue: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textLight,
		lineHeight: 20,
	},
	routeDivider: {
		height: 1,
		backgroundColor: "rgba(255,255,255,0.12)",
		marginVertical: SPACING.md,
	},
	sheet: {
		flex: 1,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	sheetContent: {
		padding: SPACING.lg,
		paddingBottom: 180,
		gap: SPACING.md,
	},
	priceCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		padding: SPACING.md,
		borderRadius: 20,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	cardLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		marginBottom: 4,
	},
	priceValue: {
		fontSize: 28,
		fontWeight: "700",
		color: COLORS.primary,
	},
	priceSub: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	priceBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#E5E7EB",
	},
	priceBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: COLORS.textSecondary,
	},
	driverCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		padding: SPACING.md,
		borderRadius: 20,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	driverAvatar: {
		width: 56,
		height: 56,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	driverAvatarText: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	driverInfo: {
		flex: 1,
		gap: 4,
	},
	driverName: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	driverMeta: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	driverStatusPill: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#111827",
	},
	driverStatusText: {
		fontSize: 10,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	partyCard: {
		padding: SPACING.md,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	partyHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	sectionTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	sectionCount: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	membersList: {
		gap: SPACING.sm,
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		paddingVertical: 10,
	},
	memberAvatar: {
		width: 42,
		height: 42,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	memberAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
	},
	memberInfo: {
		flex: 1,
		gap: 4,
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
	memberStatus: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	leaderPill: {
		backgroundColor: "#FEF3C7",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	leaderPillText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#92400E",
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		padding: SPACING.md,
		borderRadius: 18,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	infoText: {
		flex: 1,
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
		lineHeight: 20,
	},
	footer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
		paddingBottom: SPACING.lg,
		backgroundColor: COLORS.background,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	confirmButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	primaryButtonDisabled: {
		opacity: 0.65,
	},
	confirmTitle: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	confirmSub: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.xs,
		opacity: 0.85,
		marginTop: 2,
	},
	secondaryActionButton: {
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 18,
		backgroundColor: "#F3F4F6",
		marginBottom: 10,
	},
	secondaryActionText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	continueButton: {
		paddingVertical: 16,
		borderRadius: 18,
		backgroundColor: COLORS.primary,
		alignItems: "center",
	},
	continueButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	applePayButton: {
		backgroundColor: "#000",
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
		flexDirection: "row",
		gap: 8,
	},
	applePayText: {
		color: "#fff",
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	unpaidPill: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "#FEE2E2",
	},

	unpaidPillText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#B91C1C",
	},

	paidBanner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: 18,
		backgroundColor: "#ECFDF5",
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#A7F3D0",
	},
	paidBannerText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
		color: "#047857",
	},
	continueButtonDisabled: {
		backgroundColor: "#CBD5E1",
	},

	continueButtonTextDisabled: {
		color: "#64748B",
	},
	stripeButton: {
		backgroundColor: "#635BFF",
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
		flexDirection: "row",
		gap: 8,
	},

	stripeButtonText: {
		color: "#fff",
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "flex-end",
	},

	paymentModal: {
		backgroundColor: "#fff",
		padding: 20,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		gap: 12,
	},

	paymentModalTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},

	paymentModalSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
		marginBottom: 8,
	},

	paymentOption: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 16,
		paddingHorizontal: 14,
		borderRadius: 14,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},

	paymentOptionText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.text,
	},

	closeModalButton: {
		marginTop: 8,
		paddingVertical: 14,
		alignItems: "center",
	},

	closeModalButtonText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
});
