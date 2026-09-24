import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setMessage("");
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password,
    });
    
    await AsyncStorage.setItem(
      "token",
      response.data.token
    );
    
    await AsyncStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
    
    router.replace("/");
    } catch (error: any) {
      console.error("Registration error:", error);

      const serverMessage =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Join the Feedants competition
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        {message ? (
          <Text style={styles.successText}>
            {message}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  container: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 10,
  },

  successText: {
    color: "#2e7d32",
    fontSize: 14,
    marginBottom: 10,
  },

  loginButton: {
    alignItems: "center",
    marginTop: 20,
  },

  loginText: {
    fontSize: 15,
    color: "#333",
  },
});