import SupabaseProvider from "@/providers/SupabaseProvider";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import "../global.css";
function RootStack() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!isSignedIn}>
          <Stack.Screen name="(drawer)" />
        </Stack.Protected>
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SupabaseProvider>
        <KeyboardProvider>
          <RootStack />
        </KeyboardProvider>
      </SupabaseProvider>
    </ClerkProvider>
  );
}
