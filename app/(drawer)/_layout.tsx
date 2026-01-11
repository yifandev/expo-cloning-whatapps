import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="(home)"
        options={{
          drawerLabel: "Home",
          title: "Home",
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          drawerLabel: "Tentang",
          title: "Tentang",
          headerShadowVisible: false,
        }}
      />
    </Drawer>
  );
}
