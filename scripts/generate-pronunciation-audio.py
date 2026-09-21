"""
Generate bundled letter-name and phonics WAV files.

Letter names: neural TTS of the alphabet letter (the name a child hears).
Phonics: neural TTS of a teaching word, then isolate the target sound.
Isolated-phoneme TTS is not used; engines misread it as letter names or gibberish.
"""
from __future__ import annotations

import asyncio
import subprocess
import sys
from pathlib import Path

import edge_tts
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / ".tts-cache"
NAME_DIR = ROOT / "assets" / "audio" / "letter-names"
PHONICS_DIR = ROOT / "assets" / "audio" / "phonics"
VOICE = "en-US-JennyNeural"

# Teaching words chosen so the target sound is at the edge (start, except X).
# IPA matches https://www.showandtellletter.com/alphabet-sounds/
PHONICS = [
    ("A", "ant", "vowel", "/æ/"),
    ("B", "ball", "stop", "/b/"),
    ("C", "cat", "stop", "/k/"),
    ("D", "dog", "stop", "/d/"),
    ("E", "egg", "vowel", "/ɛ/"),
    ("F", "fish", "continuant", "/f/"),
    ("G", "goat", "stop", "/g/"),
    ("H", "hat", "continuant", "/h/"),
    ("I", "igloo", "vowel", "/ɪ/"),
    ("J", "juice", "affricate", "/dʒ/"),
    ("K", "kite", "stop", "/k/"),
    ("L", "leaf", "continuant", "/l/"),
    ("M", "milk", "continuant", "/m/"),
    ("N", "nest", "continuant", "/n/"),
    ("O", "ox", "vowel", "/ɒ/"),
    ("P", "pig", "stop", "/p/"),
    ("Q", "queen", "cluster", "/kw/"),
    ("R", "rabbit", "continuant", "/r/"),
    ("S", "sun", "continuant", "/s/"),
    ("T", "tiger", "stop", "/t/"),
    ("U", "up", "vowel", "/ʌ/"),
    ("V", "van", "continuant", "/v/"),
    ("W", "water", "glide", "/w/"),
    ("X", "box", "coda", "/ks/"),
    ("Y", "yellow", "glide", "/j/"),
    ("Z", "zoo", "continuant", "/z/"),
]


def ffmpeg(*args: str) -> None:
    cmd = ["ffmpeg", "-y", *args]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr[-800:] or "ffmpeg failed")


def mp3_to_wav(mp3: Path, wav: Path) -> None:
    ffmpeg(
        "-i",
        str(mp3),
        "-ac",
        "1",
        "-ar",
        "22050",
        "-sample_fmt",
        "s16",
        str(wav),
    )


def read_wav(path: Path) -> tuple[int, np.ndarray]:
    import wave

    with wave.open(str(path), "rb") as handle:
        sr = handle.getframerate()
        channels = handle.getnchannels()
        frames = np.frombuffer(handle.readframes(handle.getnframes()), dtype=np.int16)
        data = frames.astype(np.float32) / 32768.0
        if channels > 1:
            data = data.reshape(-1, channels).mean(axis=1)
        return sr, data


def write_wav(path: Path, sr: int, data: np.ndarray) -> None:
    import wave

    peak = float(np.max(np.abs(data))) or 1.0
    data = np.clip(data / peak * 0.89, -1.0, 1.0)
    pcm = (data * 32767.0).astype(np.int16)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sr)
        handle.writeframes(pcm.tobytes())


def fade(data: np.ndarray, sr: int, fade_in: float, fade_out: float) -> np.ndarray:
    out = data.copy()
    n_in = min(len(out), int(sr * fade_in))
    n_out = min(len(out), int(sr * fade_out))
    if n_in:
        out[:n_in] *= np.linspace(0.0, 1.0, n_in, dtype=np.float32)
    if n_out:
        out[-n_out:] *= np.linspace(1.0, 0.0, n_out, dtype=np.float32)
    return out


def speech_bounds(data: np.ndarray, sr: int) -> tuple[int, int]:
    hop = max(1, int(sr * 0.01))
    if len(data) < hop * 3:
        return 0, len(data)
    env = np.sqrt(np.mean(data[: len(data) - len(data) % hop].reshape(-1, hop) ** 2, axis=1))
    peak = float(env.max()) + 1e-9
    mask = env > peak * 0.07
    if not mask.any():
        return 0, len(data)
    first = int(np.argmax(mask))
    last = int(len(mask) - 1 - np.argmax(mask[::-1]))
    start = max(0, first * hop - int(sr * 0.02))
    end = min(len(data), (last + 1) * hop + int(sr * 0.04))
    return start, end


def slice_phoneme(data: np.ndarray, sr: int, kind: str) -> np.ndarray:
    start, end = speech_bounds(data, sr)
    speech = data[start:end]
    if len(speech) < int(sr * 0.05):
        speech = data

    def take(begin_s: float, dur_s: float, max_frac: float) -> np.ndarray:
        a = int(sr * begin_s)
        b = a + int(sr * dur_s)
        cap = a + max(int(sr * 0.08), int(len(speech) * max_frac))
        a = max(0, min(a, len(speech) - 1))
        b = max(a + 1, min(b, cap, len(speech)))
        return speech[a:b]

    if kind == "vowel":
        clip = take(0.02, 0.26, 0.52)
        return fade(clip, sr, 0.015, 0.1)
    if kind == "stop":
        clip = take(0.0, 0.15, 0.28)
        return fade(clip, sr, 0.004, 0.08)
    if kind == "continuant":
        clip = take(0.0, 0.24, 0.36)
        return fade(clip, sr, 0.015, 0.08)
    if kind == "affricate":
        clip = take(0.0, 0.17, 0.3)
        return fade(clip, sr, 0.005, 0.07)
    if kind == "glide":
        clip = take(0.0, 0.17, 0.3)
        return fade(clip, sr, 0.008, 0.07)
    if kind == "cluster":
        clip = take(0.0, 0.18, 0.32)
        return fade(clip, sr, 0.005, 0.07)
    if kind == "coda":
        dur = min(int(sr * 0.2), max(int(sr * 0.12), int(len(speech) * 0.4)))
        clip = speech[-dur:] if len(speech) > dur else speech
        return fade(clip, sr, 0.015, 0.06)
    return fade(speech, sr, 0.02, 0.06)


def trim_name(data: np.ndarray, sr: int) -> np.ndarray:
    start, end = speech_bounds(data, sr)
    clip = data[start:end]
    pad = int(sr * 0.06)
    out = np.concatenate(
        [np.zeros(pad, dtype=np.float32), clip, np.zeros(pad, dtype=np.float32)]
    )
    return fade(out, sr, 0.01, 0.04)


async def tts_to_mp3(text: str, dest: Path, rate: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE, rate=rate)
    await communicate.save(str(dest))


async def main() -> None:
    raise SystemExit(
        "Letter-name audio is frozen. Rebuild phonics with: python scripts/generate-phonics-audio.py"
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(1)
