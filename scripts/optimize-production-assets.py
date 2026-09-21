"""
Production asset optimizer for Gugu ABC.
- Resizes oversized PNGs (keeps PNG, preserves alpha)
- Re-encodes BGM + WAV effects/voices to compact MP3 without changing content
Does not invent new audio; only re-encodes existing files.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
AUDIO = ROOT / "assets" / "audio"

# Max edge for in-app art (covers ~256–300 CSS px at 3x). App icons stay separately capped higher.
MAX_EDGE_DEFAULT = 768
MAX_EDGE_ICON = 1024  # store / adaptive icon sources
ICON_NAMES = {
    "icon.png",
    "android-icon-foreground.png",
    "favicon.png",
}


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def optimize_images() -> tuple[int, int]:
    from PIL import Image

    before = 0
    after = 0
    for path in sorted(IMAGES.rglob("*.png")):
        before += path.stat().st_size
        with Image.open(path) as im:
            im.load()
            has_alpha = im.mode in ("RGBA", "LA") or ("transparency" in im.info)
            work = im.convert("RGBA") if has_alpha else im.convert("RGB")
            max_edge = MAX_EDGE_ICON if path.name in ICON_NAMES else MAX_EDGE_DEFAULT
            w, h = work.size
            scale = min(1.0, max_edge / max(w, h))
            if scale < 1.0:
                work = work.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)
            tmp = path.with_suffix(".tmp.png")
            save_kwargs = {"optimize": True}
            if has_alpha:
                work.save(tmp, format="PNG", **save_kwargs)
            else:
                work.convert("RGB").save(tmp, format="PNG", **save_kwargs)
        # Keep only if smaller (or resized). Always keep if resized; if same size skip replace when larger.
        if tmp.stat().st_size <= path.stat().st_size or scale < 1.0:
            tmp.replace(path)
        else:
            tmp.unlink(missing_ok=True)
        after += path.stat().st_size
    return before, after


def encode_mp3(src: Path, dst: Path, bitrate: str, mono: bool) -> None:
    args = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        bitrate,
    ]
    if mono:
        args += ["-ac", "1"]
    args.append(str(dst))
    run(args)


def optimize_audio() -> tuple[int, int]:
    before = sum(p.stat().st_size for p in AUDIO.rglob("*") if p.is_file())
    # BGM: re-encode in place via temp (keep .mp3 name)
    bgm = AUDIO / "music" / "gugu-bgm-source.mp3"
    if bgm.exists():
        tmp = bgm.with_suffix(".tmp.mp3")
        # 96k stereo is ample for kids BGM and preserves loop content
        encode_mp3(bgm, tmp, "96k", mono=False)
        if tmp.stat().st_size < bgm.stat().st_size:
            tmp.replace(bgm)
        else:
            tmp.unlink(missing_ok=True)

    # WAV -> MP3 (same basename), then delete WAV
    for wav in list(AUDIO.rglob("*.wav")):
        mp3 = wav.with_suffix(".mp3")
        br = "96k" if "celebrate" in wav.name else "64k"
        encode_mp3(wav, mp3, br, mono=True)
        if mp3.exists() and mp3.stat().st_size > 0:
            wav.unlink()

    after = sum(p.stat().st_size for p in AUDIO.rglob("*") if p.is_file())
    return before, after


def main() -> None:
    img_b, img_a = optimize_images()
    aud_b, aud_a = optimize_audio()
    print(f"IMAGES  {img_b/1e6:.2f} MB -> {img_a/1e6:.2f} MB  saved {(img_b-img_a)/1e6:.2f} MB")
    print(f"AUDIO   {aud_b/1e6:.2f} MB -> {aud_a/1e6:.2f} MB  saved {(aud_b-aud_a)/1e6:.2f} MB")
    print(f"TOTAL   {(img_b+aud_b)/1e6:.2f} MB -> {(img_a+aud_a)/1e6:.2f} MB")


if __name__ == "__main__":
    main()
