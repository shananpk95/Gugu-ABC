"""Export platform branding squares from the master GuGu logo. Does not modify the master."""

from pathlib import Path

from PIL import Image

ROOT = Path(r"d:\Projects\Gugu-ABC")
MASTER = ROOT / "assets" / "images" / "gugu-logo.png"
OUT_DIR = ROOT / "assets" / "images"
SKY = (126, 200, 227, 255)  # GuguColors.sky


def contain(master: Image.Image, size: int, background: tuple[int, int, int, int], fit: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    box = int(size * fit)
    scale = min(box / master.width, box / master.height)
    resized = master.resize(
        (max(1, int(master.width * scale)), max(1, int(master.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return canvas


def main() -> None:
    master = Image.open(MASTER).convert("RGBA")
    print("master", master.size, master.mode)

    # App / iOS icon: opaque sky, full logo contained (not cropped).
    contain(master, 1024, SKY, 0.82).save(OUT_DIR / "icon.png", "PNG")
    # Android adaptive foreground: transparent, extra inset so the circle mask cannot crop.
    contain(master, 1024, (0, 0, 0, 0), 0.66).save(OUT_DIR / "android-icon-foreground.png", "PNG")
    # Favicon: same logo on sky; 192px downscales more cleanly than 48px.
    contain(master, 192, SKY, 0.88).save(OUT_DIR / "favicon.png", "PNG")
    print("exported icon, android-icon-foreground, favicon from", MASTER.name)


if __name__ == "__main__":
    main()
