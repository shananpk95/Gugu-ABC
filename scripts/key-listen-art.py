from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\shana\.cursor\projects\d-Projects-Gugu-ABC\assets")
OUT = Path(r"d:\Projects\Gugu-ABC\assets\images")

FILES = ["subcat-letter-name.png", "subcat-phonics.png", "listen-gugu-boy.png"]


def is_chroma(r: int, g: int, b: int) -> bool:
    return g > 175 and g >= r + 28 and g >= b + 40 and r < 230 and b < 170


def key_image(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    chroma = [[is_chroma(*px[x, y][:3]) for x in range(w)] for y in range(h)]
    seen = [[False] * w for _ in range(h)]
    queue = deque()

    for x in range(w):
        for y in (0, h - 1):
            if chroma[y][x] and not seen[y][x]:
                seen[y][x] = True
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if chroma[y][x] and not seen[y][x]:
                seen[y][x] = True
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        r, g, b, _a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and chroma[ny][nx] and not seen[ny][nx]:
                seen[ny][nx] = True
                queue.append((nx, ny))

    # Punch leftover neon pockets (armpits, holes) that are not edge-connected.
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and is_chroma(r, g, b):
                px[x, y] = (0, 0, 0, 0)

    # Soften leftover lime fringe on opaque pixels.
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                px[x, y] = (0, 0, 0, 0)
                continue
            if g > 170 and g > r + 20 and g > b + 24:
                empty = 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        empty += 1
                if empty >= 2:
                    px[x, y] = (0, 0, 0, 0)

    return im


for name in FILES:
    keyed = key_image(SRC / name)
    dest = OUT / name
    keyed.save(dest)
    print("saved", dest, keyed.size)
