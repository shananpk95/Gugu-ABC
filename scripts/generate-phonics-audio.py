"""
Rebuild phonics WAVs only. Never writes letter-name files.

Uses Windows SAPI phoneme tags (UPS), not letter text and not word-slicing.
expo-speech is not used for phonics playback; these assets are.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / ".sapi-phonemes"
PHONICS_DIR = ROOT / "assets" / "audio" / "phonics"

# American English UPS. These are phonemes, never alphabet names.
# https://learn.microsoft.com/azure/ai-services/speech-service/speech-ssml-phonetic-sets
PHONEMES = {
    "a": "AE",      # short /æ/ apple
    "b": "B",
    "c": "K",       # hard C
    "d": "D",
    "e": "EH",      # short /ɛ/ egg
    "f": "F",
    "g": "G",       # hard G
    "h": "HH",
    "i": "IH",      # short /ɪ/ igloo
    "j": "JH",
    "k": "K",
    "l": "L",
    "m": "M",
    "n": "N",
    "o": "AA",      # short O ox
    "p": "P",
    "q": "K W",     # /kw/
    "r": "R",
    "s": "S",
    "t": "T",
    "u": "AH",      # short /ʌ/ up
    "v": "V",
    "w": "W",
    "x": "K S",     # /ks/
    "y": "Y",       # consonant /j/
    "z": "Z",
}

MAX_SECONDS = {
    "a": 0.7, "e": 0.7, "i": 0.7, "o": 0.7, "u": 0.7,
    "f": 0.65, "h": 0.45, "l": 0.55, "m": 0.65, "n": 0.65,
    "r": 0.55, "s": 0.65, "v": 0.65, "z": 0.65,
    "b": 0.32, "c": 0.32, "d": 0.32, "g": 0.32, "k": 0.32,
    "p": 0.32, "t": 0.32, "j": 0.38, "q": 0.4, "w": 0.38,
    "x": 0.42, "y": 0.38,
}

SSML = """<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody rate="-8%"><phoneme alphabet="x-microsoft-ups" ph="{ph}">&#x00A0;</phoneme></prosody></speak>"""


def record_sapi() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    lines = [
        "Add-Type -AssemblyName System.Speech",
        "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer",
        "$synth.Rate = -2",
        'try { $synth.SelectVoice("Microsoft Zira Desktop") } catch { }',
    ]
    for letter, ph in PHONEMES.items():
        wav = CACHE / f"{letter}.wav"
        ssml = SSML.format(ph=ph).replace("'", "''")
        lines.append(f"$synth.SetOutputToWaveFile('{wav}')")
        lines.append(f"$synth.SpeakSsml('{ssml}')")
        lines.append("$synth.SetOutputToNull()")
        lines.append(f"if ((Get-Item '{wav}').Length -lt 1000) {{ throw 'empty {letter}' }}")
    script = CACHE / "record.ps1"
    script.write_text("\n".join(lines), encoding="utf-8")
    result = subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(script)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout)[-1200:] or "SAPI recording failed")


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
    pcm = (np.clip(data / peak * 0.88, -1.0, 1.0) * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sr)
        handle.writeframes(pcm.tobytes())


def tidy(data: np.ndarray, sr: int, max_s: float) -> np.ndarray:
    hop = max(1, int(sr * 0.01))
    usable = data[: len(data) - len(data) % hop]
    env = np.sqrt(np.mean(usable.reshape(-1, hop) ** 2, axis=1))
    peak = float(env.max()) + 1e-9
    mask = env > peak * 0.08
    if mask.any():
        first = int(np.argmax(mask))
        last = int(len(mask) - 1 - np.argmax(mask[::-1]))
        start = max(0, first * hop - int(sr * 0.03))
        end = min(len(data), (last + 1) * hop + int(sr * 0.05))
        clip = data[start:end]
    else:
        clip = data
    limit = int(sr * max_s)
    if len(clip) > limit:
        clip = clip[:limit]
    n_out = min(len(clip), int(sr * 0.06))
    n_in = min(len(clip), int(sr * 0.012))
    if n_in:
        clip[:n_in] *= np.linspace(0.0, 1.0, n_in, dtype=np.float32)
    if n_out:
        clip[-n_out:] *= np.linspace(1.0, 0.0, n_out, dtype=np.float32)
    pad = int(sr * 0.05)
    return np.concatenate(
        [np.zeros(pad, dtype=np.float32), clip, np.zeros(pad, dtype=np.float32)]
    )


def main() -> None:
    PHONICS_DIR.mkdir(parents=True, exist_ok=True)
    record_sapi()
    for letter in PHONEMES:
        raw = CACHE / f"{letter}.wav"
        if not raw.exists() or raw.stat().st_size < 1000:
            raise RuntimeError(f"missing SAPI render for {letter}")
        sr, data = read_wav(raw)
        write_wav(PHONICS_DIR / f"{letter}.wav", sr, tidy(data, sr, MAX_SECONDS[letter]))
        print("phonics", letter)
    print("phonics-only done; letter-name files untouched")


if __name__ == "__main__":
    main()
