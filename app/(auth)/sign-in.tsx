import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!emailAddress) {
      newErrors.email = "Email diperlukan";
    } else if (!/\S+@\S+\.\S+/.test(emailAddress)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password diperlukan";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || !validateForm()) return;

    setIsLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        Toast.show({
          type: "success",
          text1: "Login Berhasil",
          text2: "Selamat datang kembali!",
        });

        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));

        // Show toast instead of Alert for consistency
        Toast.show({
          type: "info",
          text1: "Perhatian",
          text2: "Silakan lengkapi proses verifikasi yang diperlukan.",
        });
      }
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));

      let errorMessage = "Email atau password salah. Silakan coba lagi.";

      // You can add more specific error handling based on Clerk error codes
      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_password_incorrect") {
          errorMessage = "Password salah. Silakan coba lagi.";
        } else if (clerkError.code === "form_identifier_not_found") {
          errorMessage = "Email tidak ditemukan.";
        } else if (clerkError.message.includes("not confirmed")) {
          errorMessage = "Silakan verifikasi email Anda terlebih dahulu.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Gagal Masuk",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password functionality (Clerk-specific)
  const handleForgotPassword = async () => {
    if (!emailAddress) {
      Toast.show({
        type: "info",
        text1: "Informasi",
        text2: "Masukkan email Anda terlebih dahulu",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailAddress)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Format email tidak valid",
      });
      return;
    }

    try {
      // With Clerk, you would initiate password reset flow
      // Note: The actual implementation might differ based on your Clerk setup
      // This is a placeholder - you might need to use Clerk's resetPassword method

      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: "Link reset password telah dikirim ke email Anda",
      });

      // You might want to navigate to a password reset screen
      // router.push("/reset-password");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={20}
      extraKeyboardSpace={20}
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 gap-2 flex-1 justify-center min-h-screen">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-center text-primary">
            Selamat Datang
          </Text>
          <Text className="text-lg text-center text-gray-600 mt-2">
            Masuk ke akun Anda
          </Text>
        </View>

        <View className="gap-3">
          <View>
            <Text className="text-sm font-medium mb-1 text-gray-700">
              Email
            </Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={emailAddress}
              placeholder="contoh@email.com"
              onChangeText={(text) => {
                setEmailAddress(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`border p-4 rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              editable={!isLoading}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium mb-1 text-gray-700">
              Password
            </Text>
            <TextInput
              value={password}
              placeholder="••••••••"
              secureTextEntry={true}
              autoComplete="password"
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              className={`border p-4 rounded-lg ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              editable={!isLoading}
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            className="self-end mb-4"
            disabled={isLoading}
          >
            <Text className="text-primary text-sm">Lupa password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignInPress}
            className="bg-primary p-4 rounded-lg items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-semibold text-white text-lg">Masuk</Text>
            )}
          </TouchableOpacity>

          <View className="flex flex-row gap-2 items-center justify-center mt-4">
            <Text className="text-gray-600">Belum punya akun?</Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text className="text-primary font-bold">Daftar sekarang</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-center text-gray-500 text-xs">
            Dengan masuk, Anda menyetujui{" "}
            <Text className="text-blue-600">Syarat & Ketentuan</Text> dan{" "}
            <Text className="text-blue-600">Kebijakan Privasi</Text> kami
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
