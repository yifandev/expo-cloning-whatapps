import { Ionicons } from "@expo/vector-icons";
import { Link, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform } from "react-native";

export default function LayoutTabs() {
  if (Platform.OS === "ios") {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="chats">
          <Label>Chats</Label>
          <Icon sf="message.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Icon sf="gear" drawable="custom_settings_drawable" />
          <Label>Settings</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="search" role="search">
          <Label>Search</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5EA",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#25D366",
          fontSize: 25,
        },
        tabBarActiveTintColor: "#25D366",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tabs.Screen
        name="chats"
        options={({ navigation }) => ({
          headerTitle: "Whatapps Cloning",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={size}
              color={color}
            />
          ),
          headerSearchBarOptions: {
            placeholder: "Pencarian chat...",
            onChangeText: ({ nativeEvent }) => {
              console.log("Search text:", nativeEvent.text);
            },
            hideWhenScrolling: false, // Keep search bar visible
          },
          // headerLeft: () => (
          //   <HeaderIcon
          //     name="menu-outline"
          //     onPress={() => navigation.openDrawer()}
          //   />
          // ),

          headerRight: () => (
            <Link href="/new/chat" asChild>
              <Ionicons name="add" size={28} className="px-1" />
            </Link>
          ),
        })}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan Akun",
          headerShadowVisible: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShadowVisible: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
