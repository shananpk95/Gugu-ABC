# Play & Learn ABC audio

## Letter names (`letter-names/`)

Prerecorded alphabet names (A–Z) as mono MP3. These are the names a child hears in Letter Name mode, Draw praise, and balloon games.

## Phonics (`phonics/`)

Prerecorded isolated phonemes (not alphabet names) as mono MP3. Mapping follows
https://www.showandtellletter.com/alphabet-sounds/

- A /æ/  E /ɛ/  I /ɪ/  O /ɒ~ɑ/  U /ʌ/
- C hard /k/  G hard /g/  Q /kw/  X /ks/  Y /j/

Rebuild phonics WAV intermediates with `python scripts/generate-phonics-audio.py`, then re-run
`python scripts/optimize-production-assets.py` to produce production MP3s.
Do not regenerate letter-name source files.

## Background music (`music/`)

Background loop (`gugu-bgm-source.mp3`), ~101s stereo MP3 (production bitrate ~96 kbps).
Rebuild/replace by swapping this file only (or re-running the optimizer).

## Effects

Tap / success / retry / celebrate-wow as mono MP3:
- `celebrate-wow.mp3` — kids cheering clip (source 0:14–0:17) on Draw letter complete
Rebuild from the source MP3 with:
`ffmpeg -y -ss 14 -t 3 -i "<source>.mp3" -ac 1 -b:a 96k assets/audio/effects/celebrate-wow.mp3`
