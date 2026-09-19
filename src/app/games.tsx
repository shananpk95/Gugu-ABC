import { HubScreen } from '@/components/hub-screen';
import { GAME_SECTIONS, GuguColors } from '@/constants/gugu';

export default function GamesScreen() {
  return (
    <HubScreen
      title="Games"
      description="Mini games that practice letters, sounds, and words."
      sections={GAME_SECTIONS}
      tint={GuguColors.coral}
    />
  );
}
