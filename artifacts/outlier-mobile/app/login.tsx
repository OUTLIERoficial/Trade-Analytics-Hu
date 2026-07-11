import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import Svg, { Path } from "react-native-svg";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 18 18">
      <Path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <Path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <Path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <Path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </Svg>
  );
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Redirect href="/(tabs)" />;

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      const err = await loginWithGoogle();
      if (err) {
        setError(err);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Preencha o email e a password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const err = await login(email.trim().toLowerCase(), password);
      if (err) {
        setError(err);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setLoading(false);
    }
  }

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "center",
    },
    logo: {
      fontFamily: "Inter_700Bold",
      fontSize: 38,
      letterSpacing: -1,
      color: colors.foreground,
      marginBottom: 6,
    },
    logoAccent: { color: colors.primary },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
      marginBottom: 44,
    },
    label: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      color: colors.mutedForeground,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      height: 50,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.foreground,
    },
    eyeBtn: { padding: 4 },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.lossBg,
      borderWidth: 1,
      borderColor: colors.loss,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.loss,
      flex: 1,
    },
    btn: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: "#fff",
      letterSpacing: 0.3,
    },
    googleBtn: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 12,
    },
    googleBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 16,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    footer: {
      marginTop: 40,
      alignItems: "center",
    },
    footerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>
        <Text style={s.logo}>
          OUT<Text style={s.logoAccent}>LIER</Text>
        </Text>
        <Text style={s.subtitle}>Plataforma de gestão de trading</Text>

        <Text style={s.label}>Email</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="trader@exemplo.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <Text style={s.label}>Password</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Pressable onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Feather name="alert-circle" size={15} color={colors.loss} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Entrar</Text>
          )}
        </Pressable>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>ou</Text>
          <View style={s.dividerLine} />
        </View>

        <Pressable
          style={[s.googleBtn, googleLoading && s.btnDisabled]}
          onPress={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <>
              <GoogleIcon />
              <Text style={s.googleBtnText}>Entrar com Google</Text>
            </>
          )}
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>
            Não tem conta? Registe-se no OUTLIER Web.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
