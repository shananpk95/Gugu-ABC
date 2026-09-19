from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(r"d:\Projects\Gugu-ABC")
SRC = Path(r"C:\Users\shana\.cursor\projects\d-Projects-Gugu-ABC\assets")
OUT = ROOT / "assets" / "images"


def chroma_key_lime(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lime = (g > 140) & (g > r + 40) & (g > b + 40) & (r < 190) & (b < 190)
    arr[:, :, 3] = np.where(lime, 0, a)
    return Image.fromarray(arr)


def despill(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    a = arr[:, :, 3]
    fringe = (a > 0) & (a < 255) & (g > r + 12) & (g > b + 12)
    g2 = np.minimum(g, ((r + b) // 2) + 8)
    arr[:, :, 1] = np.where(fringe, g2, g).astype(np.uint8)
    neon = (a > 0) & (g > 170) & (g > r + 55) & (g > b + 55) & (r < 130) & (b < 130)
    arr[:, :, 3] = np.where(neon, 0, a)
    return Image.fromarray(arr)


def trim(im: Image.Image, pad: int = 6) -> Image.Image:
    arr = np.array(im)
    ys, xs = np.where(arr[:, :, 3] > 12)
    left, right = int(xs.min()), int(xs.max())
    top, bottom = int(ys.min()), int(ys.max())
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width - 1, right + pad)
    bottom = min(im.height - 1, bottom + pad)
    return im.crop((left, top, right + 1, bottom + 1))


def fit_width(im: Image.Image, width: int) -> Image.Image:
    height = max(1, int(im.height * (width / im.width)))
    return im.resize((width, height), Image.Resampling.LANCZOS)


def process_prop(name: str, max_width: int) -> None:
    im = trim(despill(chroma_key_lime(Image.open(SRC / name))))
    im = fit_width(im, max_width)
    dest = OUT / name
    im.save(dest, "PNG", optimize=True)
    print(name, im.size, round(im.height / im.width, 4))


def main() -> None:
    world = Image.open(SRC / "home-world.png").convert("RGB")
    world = world.resize((1600, 900), Image.Resampling.LANCZOS)
    world.save(OUT / "home-world.png", "PNG", optimize=True)
    print("home-world", world.size)

    process_prop("home-cloud.png", 420)
    process_prop("home-bird.png", 280)
    process_prop("home-bee.png", 220)
    process_prop("home-butterfly.png", 240)


if __name__ == "__main__":
    main()
