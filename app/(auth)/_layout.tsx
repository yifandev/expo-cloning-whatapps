import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "white" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{ title: "Masukan Akun Anda", headerLargeTitle: true }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ title: "Buat Akun Baru", headerLargeTitle: true }}
      />
    </Stack>
  );
}
