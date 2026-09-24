import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      console.log("Login successful");
      console.log("JWT stored:", !!token);

      router.replace("/");
    } catch (error: any) {
      console.error("Login error:", error);

      Alert.alert(
        "Login Failed",
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.card}>
        <Text style={styles.brand}>FEEDANTS</Text>

        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Login to continue to the competition.
        </Text>

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => router.push("/register")}
          style={styles.registerButton}
        >
          <Text style={styles.registerText}>
            Don't have an account? Create one
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f7f7f7",
  },
  registerButton: {
  alignItems: "center",
  marginTop: 20,
},

registerText: {
  fontSize: 15,
  color: "#333",
},

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 26,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  brand: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 28,
    lineHeight: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 18,
    backgroundColor: "#fafafa",
  },

  button: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});