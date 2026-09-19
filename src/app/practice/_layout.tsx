import { Stack } from 'expo-router';

export default function PracticeLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', orientation: 'landscape' }} />;
}
