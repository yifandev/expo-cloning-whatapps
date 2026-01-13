import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    code?: string;
  }>({});

  const validateSignUpForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Nama depan diperlukan";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Nama belakang diperlukan";
    }

    if (!emailAddress) {
      newErrors.email = "Email diperlukan";
    } else if (!/\S+@\S+\.\S+/.test(emailAddress)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password diperlukan";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password diperlukan";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationForm = () => {
    const newErrors: typeof errors = {};

    if (!code.trim()) {
      newErrors.code = "Kode verifikasi diperlukan";
    } else if (code.length !== 6) {
      newErrors.code = "Kode harus 6 digit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded || !validateSignUpForm()) return;

    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);

      Toast.show({
        type: "info",
        text1: "Kode Verifikasi Dikirim",
        text2: "Silakan cek email Anda untuk kode verifikasi",
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_identifier_exists") {
          errorMessage =
            "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk dengan email ini.";
        } else if (clerkError.code === "form_password_length_too_short") {
          errorMessage = "Password terlalu pendek. Minimal 8 karakter.";
        } else if (clerkError.code === "form_password_no_uppercase") {
          errorMessage = "Password harus mengandung huruf besar.";
        } else if (clerkError.code === "form_password_no_lowercase") {
          errorMessage = "Password harus mengandung huruf kecil.";
        } else if (clerkError.code === "form_password_no_number") {
          errorMessage = "Password harus mengandung angka.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Error Pendaftaran",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded || !validateVerificationForm()) return;

    setIsLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        Toast.show({
          type: "success",
          text1: "Pendaftaran Berhasil!",
          text2: "Akun Anda telah berhasil diverifikasi",
          visibilityTime: 3000,
          onHide: () => {
            router.replace("/");
          },
        });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Kode verifikasi tidak valid",
        });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      let errorMessage = "Kode verifikasi tidak valid";

      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === "verification_failed") {
          errorMessage = "Kode verifikasi salah. Silakan coba lagi.";
        } else if (clerkError.code === "verification_expired") {
          errorMessage =
            "Kode verifikasi telah kedaluwarsa. Kirim ulang kode baru.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Error Verifikasi",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      Toast.show({
        type: "success",
        text1: "Kode Dikirim Ulang",
        text2: "Kode verifikasi baru telah dikirim ke email Anda",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal mengirim ulang kode. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAwareScrollView
        bottomOffset={20}
        extraKeyboardSpace={20}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 gap-2 flex-1 justify-center min-h-screen">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-center text-[#25D366]">
              Verifikasi Email
            </Text>
            <Text className="text-lg text-center text-gray-600 mt-2">
              Masukkan kode verifikasi yang dikirim ke email Anda
            </Text>
            <Text className="text-sm text-center text-gray-500 mt-1">
              {emailAddress}
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium mb-1 text-gray-700">
                Kode Verifikasi
              </Text>
              <TextInput
                value={code}
                placeholder="Masukkan 6-digit kode"
                onChangeText={(text) => {
                  setCode(text);
                  if (errors.code) setErrors({ ...errors, code: undefined });
                }}
                keyboardType="number-pad"
                maxLength={6}
                className={`border p-4 rounded-lg text-lg ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                editable={!isLoading}
              />
              {errors.code && (
                <Text className="text-red-500 text-sm mt-1">{errors.code}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={onVerifyPress}
              className="bg-primary p-4 rounded-lg items-center mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white text-lg">
                  Verifikasi Akun
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex flex-row gap-2 items-center justify-center mt-4">
              <Text className="text-gray-600">Tidak menerima kode?</Text>
              <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                <Text className="text-primary font-bold">Kirim ulang</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row gap-2 items-center justify-center mt-2">
              <Text className="text-gray-600">Email salah?</Text>
              <TouchableOpacity
                onPress={() => setPendingVerification(false)}
                disabled={isLoading}
              >
                <Text className="text-primary font-bold">Ubah email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }

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
            Buat Akun Baru
          </Text>
          <Text className="text-lg text-center text-gray-600 mt-2">
            Daftar untuk mulai menggunakan aplikasi
          </Text>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium mb-1 text-gray-700">
                Masukan Nama Depan
              </Text>
              <TextInput
                value={firstName}
                placeholder="Nama Depan"
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName)
                    setErrors({ ...errors, firstName: undefined });
                }}
                className={`border p-4 rounded-lg ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                editable={!isLoading}
              />
              {errors.firstName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.firstName}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium mb-1 text-gray-700">
                Masukan Nama Belakang
              </Text>
              <TextInput
                value={lastName}
                placeholder="Nama Belakang"
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName)
                    setErrors({ ...errors, lastName: undefined });
                }}
                className={`border p-4 rounded-lg ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                editable={!isLoading}
              />
              {errors.lastName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View>

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
              autoComplete="new-password"
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
            <Text className="text-xs text-gray-500 mt-1">
              Minimal 8 karakter dengan kombinasi huruf dan angka
            </Text>
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium mb-1 text-gray-700">
              Konfirmasi Password
            </Text>
            <TextInput
              value={confirmPassword}
              placeholder="Ulangi password"
              secureTextEntry={true}
              autoComplete="new-password"
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
              className={`border p-4 rounded-lg ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              editable={!isLoading}
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={onSignUpPress}
            className="bg-primary p-4 rounded-lg items-center mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-semibold text-white text-lg">
                Daftar Sekarang
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex flex-row gap-2 items-center justify-center mt-4">
            <Text className="text-gray-600">Sudah memiliki akun?</Text>
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => router.back()}
            >
              <Text className="text-primary font-bold">Masuk sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-center text-gray-500 text-xs">
            Dengan mendaftar, Anda menyetujui{" "}
            <Text className="text-blue-600">Syarat & Ketentuan</Text> dan{" "}
            <Text className="text-blue-600">Kebijakan Privasi</Text> kami
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
