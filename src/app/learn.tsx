import { HubScreen } from '@/components/hub-screen';
import { GuguColors, LEARN_SECTIONS } from '@/constants/gugu';

export default function LearnScreen() {
  return (
    <HubScreen
      title="Learn"
      description="Alphabet, pronunciation, phonics, vocabulary, and reading."
      sections={LEARN_SECTIONS}
      tint={GuguColors.yellow}
    />
  );
}
