import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    // any app-level effects
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // disable header by default for all screens
      }}
    >
      {/* Custom config for index screen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Men",
          headerShown: false, // still redundant here but explicit
        }}
      />
    </Stack>
  );
}
