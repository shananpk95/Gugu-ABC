from pathlib import Path

from PIL import Image, ImageFilter, ImageDraw

SRC = Path(
    r"C:\Users\shana\.cursor\projects\d-Projects-Gugu-ABC\assets"
    r"\c__Users_shana_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"5d08cf5dad26b73df66bfc27f8e6eac4_images_image-c84ffec5-9726-4264-b30d-ff79bae8482a.jpg"
)
OUT = Path(r"d:\Projects\Gugu-ABC\assets\images")

src = Image.open(SRC).convert("RGBA")
print("source", src.size)
src.convert("RGB").save(OUT / "home-reference-full.png")


def crop(name: str, box: tuple[int, int, int, int]) -> Image.Image:
    im = src.crop(box)
    im.save(OUT / name)
    print(name, im.size, box)
    return im


def key_blue(im: Image.Image) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if b > 170 and g > 160 and r < 190 and (g - r) > 18 and (b - r) > 25:
                px[x, y] = (r, g, b, 0)
    return out


# Tight card crops from the screenshot
crop("cat-trace.png", (162, 372, 278, 500))
crop("cat-abc.png", (286, 372, 402, 500))
crop("cat-phonics.png", (410, 372, 526, 500))
crop("cat-words.png", (534, 372, 650, 500))
crop("cat-games.png", (658, 372, 774, 500))
crop("chevron.png", (838, 408, 910, 480))

logo = key_blue(crop("_logo.png", (348, 4, 682, 282)))
logo.save(OUT / "gugu-logo.png")
Path(OUT / "_logo.png").unlink(missing_ok=True)

# Background: original scene with the category row removed so cards can scroll on top.
bg = src.convert("RGB")
filler = bg.crop((180, 508, 820, 572)).resize((682, 198), Image.Resampling.BICUBIC)
bg.paste(filler, (148, 348))
band = bg.crop((148, 332, 830, 368)).filter(ImageFilter.GaussianBlur(3))
bg.paste(band, (148, 332))
bg.save(OUT / "home-background.png")
print("home-background painted", bg.size)
