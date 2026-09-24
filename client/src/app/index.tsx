import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../services/api";

const COMPETITION_ID = "6ab40cac6a7fcdf6f1a72790";

export default function HomeScreen() {
  const router = useRouter();

  const [competition, setCompetition] = useState<any>(null);
  const [remainingSpots, setRemainingSpots] = useState(0);

  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [timeLeft, setTimeLeft] = useState("");

  const [submission, setSubmission] = useState<any>(null);
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionDescription, setSubmissionDescription] =
    useState("");
  const [submissionVideoUrl, setSubmissionVideoUrl] =
    useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPhase, setCurrentPhase] = useState("");

  // -----------------------------
  // AUTH CHECK
  // -----------------------------

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setCheckingAuth(false);
          router.replace("/login");
          return;
        }

        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setCheckingAuth(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  // -----------------------------
  // FETCH COMPETITION DATA
  // -----------------------------

  const fetchCompetition = async () => {
    try {
      const response = await api.get(
        `/competitions/${COMPETITION_ID}`
      );

      setCompetition(response.data.competition);
      setRemainingSpots(response.data.remainingSpots);
      setCurrentPhase(response.data.currentPhase);

      const registrationResponse = await api.get(
        `/competitions/${COMPETITION_ID}/registration-status`
      );

      setIsRegistered(
        registrationResponse.data.isRegistered
      );

      const submissionResponse = await api.get(
        `/competitions/${COMPETITION_ID}/submission`
      );

      setSubmission(
        submissionResponse.data.submission
      );
    } catch (error: any) {
      console.error(
        "Failed to fetch competition:",
        error
      );

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        router.replace("/login");
      }
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      fetchCompetition();
    }
  }, [checkingAuth]);

  // -----------------------------
  // PHASE-BASED COUNTDOWN
  // -----------------------------

  useEffect(() => {
    if (!competition?.dates || !currentPhase) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();

      let targetDate: string | null = null;
      let expiredMessage = "Competition Completed";

      if (currentPhase === "REGISTRATION_OPEN") {
        targetDate =
          competition.dates.registrationDeadline;

        expiredMessage = "Registration closed";
      } else if (
        currentPhase === "REGISTRATION_CLOSED"
      ) {
        targetDate =
          competition.dates.submissionStart;

        expiredMessage = "Submission starting";
      } else if (
        currentPhase === "SUBMISSION_OPEN"
      ) {
        targetDate =
          competition.dates.submissionDeadline;

        expiredMessage = "Submission closed";
      } else if (currentPhase === "JUDGING") {
        targetDate =
          competition.dates.resultDate;

        expiredMessage = "Results coming soon";
      }

      if (!targetDate) {
        setTimeLeft("Competition Completed");
        return;
      }

      const difference =
        new Date(targetDate).getTime() - now;

      if (difference <= 0) {
        setTimeLeft(expiredMessage);
        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      );

      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, [competition, currentPhase]);

  // -----------------------------
  // REGISTER
  // -----------------------------

  const handleRegister = async () => {
    try {
      setRegistering(true);

      const response = await api.post(
        `/competitions/${COMPETITION_ID}/register`
      );

      if (response.data.success) {
        setIsRegistered(true);

        setRemainingSpots((prev) =>
          Math.max(0, prev - 1)
        );

        Alert.alert(
          "Success",
          "Successfully registered!"
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setRegistering(false);
    }
  };

  // -----------------------------
  // SUBMISSION
  // -----------------------------

  const handleSubmission = async () => {
    if (
      !submissionTitle.trim() ||
      !submissionDescription.trim() ||
      !submissionVideoUrl.trim()
    ) {
      Alert.alert(
        "Incomplete Submission",
        "Please fill all submission fields."
      );

      return;
    }

    // Validate video URL before sending request
      try {
        const parsedUrl = new URL(
          submissionVideoUrl.trim()
        );
      
        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        Alert.alert(
          "Invalid Video URL",
          "Please enter a valid video URL, such as https://youtube.com/..."
        );
        return;
      }

    try {

      setSubmitting(true);

      const response = await api.post(
        `/competitions/${COMPETITION_ID}/submit`,
        {
          title: submissionTitle.trim(),
          description:
            submissionDescription.trim(),
          videoUrl: submissionVideoUrl.trim(),
        }
      );

      if (response.data.success) {
        setSubmission(
          response.data.submission
        );

        setSubmissionTitle("");
        setSubmissionDescription("");
        setSubmissionVideoUrl("");

        Alert.alert(
          "Success",
          "Submission successful!"
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Submission Failed",
        error.response?.data?.message ||
          "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  if (!competition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading competition...
        </Text>
      </View>
    );
  }

  // -----------------------------
  // MAIN SCREEN
  // -----------------------------

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.brand}>
          FEEDANTS
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {currentPhase.replaceAll(
              "_",
              " "
            )}
          </Text>
        </View>
      </View>

      {/* HERO */}

      <View style={styles.heroCard}>
        <Text style={styles.title}>
          {competition.title}
        </Text>

        <Text style={styles.description}>
          {competition.description}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              PRIZE POOL
            </Text>

            <Text style={styles.statValue}>
              ₹{competition.prizePool}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              ENTRY FEE
            </Text>

            <Text style={styles.statValue}>
              ₹{competition.entryFee}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              SPOTS LEFT
            </Text>

            <Text style={styles.statValue}>
              {remainingSpots}
            </Text>
          </View>
        </View>
      </View>

      {/* COUNTDOWN */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {currentPhase === "REGISTRATION_OPEN"
            ? "Registration Ends In"
            : currentPhase ===
              "REGISTRATION_CLOSED"
            ? "Submission Starts In"
            : currentPhase ===
              "SUBMISSION_OPEN"
            ? "Submission Ends In"
            : currentPhase === "JUDGING"
            ? "Results Coming In"
            : currentPhase === "CANCELLED"
            ? "Competition Cancelled"
            : "Competition Completed"}
        </Text>

        <View style={styles.countdownCard}>
          <Text style={styles.countdown}>
            {timeLeft}
          </Text>

          <Text style={styles.deadline}>
            {currentPhase ===
            "REGISTRATION_OPEN"
              ? `Deadline: ${new Date(
                  competition.dates
                    .registrationDeadline
                ).toLocaleDateString()}`
              : currentPhase ===
                "REGISTRATION_CLOSED"
              ? `Submission starts: ${new Date(
                  competition.dates
                    .submissionStart
                ).toLocaleDateString()}`
              : currentPhase ===
                "SUBMISSION_OPEN"
              ? `Deadline: ${new Date(
                  competition.dates
                    .submissionDeadline
                ).toLocaleDateString()}`
              : currentPhase === "JUDGING"
              ? `Results: ${new Date(
                  competition.dates
                    .resultDate
                ).toLocaleDateString()}`
              : currentPhase ===
                "CANCELLED"
              ? "This competition has been cancelled."
              : "This competition has ended."}
          </Text>
        </View>
      </View>

      {/* TIMELINE */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Competition Timeline
        </Text>

        <View style={styles.timelineCard}>
          <TimelineItem
            title="Registration Deadline"
            date={
              competition.dates
                .registrationDeadline
            }
          />

          <TimelineItem
            title="Submission Starts"
            date={
              competition.dates.submissionStart
            }
          />

          <TimelineItem
            title="Submission Deadline"
            date={
              competition.dates
                .submissionDeadline
            }
          />

          <TimelineItem
            title="Results"
            date={
              competition.dates.resultDate
            }
          />
        </View>
      </View>

      {/* JUDGE */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Judge
        </Text>

        <View style={styles.judgeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {competition.judge.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.judgeInfo}>
            <Text style={styles.judgeName}>
              {competition.judge.name}
            </Text>

            <Text style={styles.judgeTitle}>
              {competition.judge.title}
            </Text>

            <Text
              style={styles.judgeExperience}
            >
              {competition.judge.experience}
            </Text>
          </View>
        </View>
      </View>

      {/* REWARDS */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Rewards
        </Text>

        <View style={styles.rewardsCard}>
          {competition.rewards.map(
            (reward: any) => (
              <View
                key={reward.position}
                style={styles.rewardRow}
              >
                <Text style={styles.position}>
                  #{reward.position}
                </Text>

                <Text
                  style={styles.rewardAmount}
                >
                  ₹{reward.amount}
                </Text>
              </View>
            )
          )}
        </View>
      </View>

      {/* ABOUT */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          About Competition
        </Text>

        <Text style={styles.aboutText}>
          {competition.description}
        </Text>
      </View>

      {/* SUBMISSION */}

      {isRegistered &&
          (currentPhase === "SUBMISSION_OPEN" ||
            showSubmissionForm ||
            submission) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                My Submission
              </Text>

          {submission ? (
            <View
              style={styles.submissionCard}
            >
              <Text
                style={styles.submissionTitle}
              >
                {submission.title}
              </Text>

              <Text
                style={
                  styles.submissionDescription
                }
              >
                {submission.description}
              </Text>

              <View
                style={
                  styles.submissionStatusBadge
                }
              >
                <Text
                  style={
                    styles.submissionStatus
                  }
                >
                  {submission.status}
                </Text>
              </View>

              <Text
                style={styles.videoUrl}
                numberOfLines={2}
              >
                {submission.videoUrl}
              </Text>
            </View>
          ) : (
            <View
              style={styles.submissionCard}
            >
              <TextInput
                style={styles.input}
                placeholder="Submission title"
                value={submissionTitle}
                onChangeText={
                  setSubmissionTitle
                }
              />

              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                placeholder="Describe your submission"
                value={
                  submissionDescription
                }
                onChangeText={
                  setSubmissionDescription
                }
                multiline
              />

              <TextInput
                style={styles.input}
                placeholder="Video URL"
                value={submissionVideoUrl}
                onChangeText={
                  setSubmissionVideoUrl
                }
                autoCapitalize="none"
                keyboardType="url"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={handleSubmission}
                disabled={submitting}
              >
                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Entry"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* REGISTRATION */}

      <View style={styles.registerSection}>
        {currentPhase ===
          "REGISTRATION_OPEN" &&
          (isRegistered ? (
            <View>
              <View style={styles.registeredButton}>
                <Text style={styles.registeredText}>
                  ✓ You are Registered
                </Text>
              </View>

              {!submission && (
                <Pressable
                  style={({ pressed }) => [
                    styles.registerButton,
                    styles.submitNowButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setShowSubmissionForm(true)}
                >
                  <Text style={styles.registerButtonText}>
                    Submit Entry
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={handleRegister}
              disabled={
                registering ||
                remainingSpots === 0
              }
            >
              <Text
                style={
                  styles.registerButtonText
                }
              >
                {registering
                  ? "Registering..."
                  : remainingSpots === 0
                  ? "Competition Full"
                  : `Register Now • ₹${competition.entryFee}`}
              </Text>
            </Pressable>
          ))}

        {currentPhase ===
          "REGISTRATION_CLOSED" && (
          <View style={styles.phaseMessage}>
            <Text
              style={styles.phaseMessageTitle}
            >
              Registration Closed
            </Text>

            <Text
              style={styles.phaseMessageText}
            >
              Registration for this competition
              has ended.
            </Text>
          </View>
        )}

        {currentPhase === "JUDGING" && (
          <View style={styles.phaseMessage}>
            <Text
              style={styles.phaseMessageTitle}
            >
              Judging in Progress
            </Text>

            <Text
              style={styles.phaseMessageText}
            >
              Submissions are currently being
              reviewed by the judges.
            </Text>
          </View>
        )}

        {currentPhase === "COMPLETED" && (
          <View style={styles.phaseMessage}>
            <Text
              style={styles.phaseMessageTitle}
            >
              Competition Completed
            </Text>

            <Text
              style={styles.phaseMessageText}
            >
              The competition has ended.
            </Text>
          </View>
        )}

        {currentPhase === "CANCELLED" && (
          <View style={styles.phaseMessage}>
            <Text
              style={styles.phaseMessageTitle}
            >
              Competition Cancelled
            </Text>

            <Text
              style={styles.phaseMessageText}
            >
              This competition has been
              cancelled.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function TimelineItem({
  title,
  date,
}: {
  title: string;
  date: string;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDot} />

      <View>
        <Text style={styles.timelineTitle}>
          {title}
        </Text>

        <Text style={styles.timelineDate}>
          {new Date(
            date
          ).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#f7f7f7",
  },

  phaseMessage: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    marginTop: 12,
  },

  phaseMessageTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  phaseMessageText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  brand: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },

  statusBadge: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  heroCard: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 22,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
  },

  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 25,
    alignItems: "center",
    justifyContent: "space-between",
  },

  stat: {
    flex: 1,
  },

  statLabel: {
    color: "#999",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 5,
  },

  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#444",
    marginHorizontal: 8,
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  countdownCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  countdown: {
    fontSize: 25,
    fontWeight: "900",
  },

  deadline: {
    marginTop: 7,
    color: "#777",
  },

  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111",
    marginRight: 14,
  },

  timelineTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  timelineDate: {
    color: "#777",
    marginTop: 3,
  },

  judgeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },

  judgeInfo: {
    marginLeft: 15,
    flex: 1,
  },

  judgeName: {
    fontSize: 18,
    fontWeight: "800",
  },

  judgeTitle: {
    marginTop: 4,
    color: "#555",
  },

  judgeExperience: {
    marginTop: 4,
    color: "#888",
  },

  rewardsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  position: {
    fontWeight: "700",
  },

  rewardAmount: {
    fontWeight: "800",
  },

  aboutText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#555",
  },

  submissionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  submitButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  submissionTitle: {
    fontSize: 19,
    fontWeight: "800",
  },

  submissionDescription: {
    marginTop: 8,
    color: "#555",
    lineHeight: 21,
  },

  submissionStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
  },

  submissionStatus: {
    fontSize: 12,
    fontWeight: "800",
  },

  videoUrl: {
    marginTop: 12,
    color: "#666",
    lineHeight: 20,
  },

  registerSection: {
    marginTop: 30,
  },

  registerButton: {
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  registeredButton: {
    backgroundColor: "#ddd",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  submitNowButton: {
    marginTop: 12,
  },

  registeredText: {
    fontSize: 16,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});