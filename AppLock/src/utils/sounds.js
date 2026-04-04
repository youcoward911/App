import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

const SQUEAL_SOUNDS = [
  require("../../assets/sounds/squeal1.wav"),
  require("../../assets/sounds/squeal2.wav"),
  require("../../assets/sounds/squeal3.wav"),
];

let squealIndex = 0;

export async function playPigSqueal() {
  try {
    // Haptic buzz
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Play squeal sound — cycle through different ones
    const { sound } = await Audio.Sound.createAsync(
      SQUEAL_SOUNDS[squealIndex % SQUEAL_SOUNDS.length],
      { shouldPlay: true, volume: 0.8 }
    );
    squealIndex++;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    // At least do haptics if audio fails
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (_) {}
  }
}
