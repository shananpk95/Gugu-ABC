import { Stack } from 'expo-router';

export default function AppTabs() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        orientation: 'landscape',
        contentStyle: { flex: 1 },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="learn" />
      <Stack.Screen name="games" />
      <Stack.Screen name="progress" />
    </Stack>
  );
}
