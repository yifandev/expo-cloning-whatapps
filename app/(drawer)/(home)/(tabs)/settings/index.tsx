import { SignOutButton } from "@/components/SignOutButton";
import React from "react";
import { View } from "react-native";

export default function index() {
  return (
    <View className="flex-1 items-center justify-center">
      <SignOutButton />
    </View>
  );
}
