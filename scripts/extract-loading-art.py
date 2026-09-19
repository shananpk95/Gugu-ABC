from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(
    r"C:\Users\shana\.cursor\projects\d-Projects-Gugu-ABC\assets"
    r"\c__Users_shana_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"5d08cf5dad26b73df66bfc27f8e6eac4_images_image-cb9eaa64-4581-4ed5-b2a7-882778ac93a8.jpg"
)
OUT = Path(r"d:\Projects\Gugu-ABC\assets\images")

src = Image.open(SRC).convert("RGBA")
print("source", src.size)
src.convert("RGB").save(OUT / "loading-reference.png")


def crop(name: str, box: tuple[int, int, int, int]) -> Image.Image:
    im = src.crop(box)
    im.save(OUT / name)
    print(name, im.size, box)
    return im


def key_sky(im: Image.Image) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            sky = b > 168 and g > 175 and r < 210 and (g - r) > 8 and (b - r) > 12
            if sky:
                px[x, y] = (r, g, b, 0)
    return out


def clone_patch(im: Image.Image, dest: tuple[int, int, int, int], src_box: tuple[int, int, int, int]) -> None:
    patch = im.crop(src_box).resize((dest[2] - dest[0], dest[3] - dest[1]), Image.Resampling.BICUBIC)
    im.paste(patch, dest[:2])


boy = key_sky(crop("_tmp-boy.png", (310, 168, 720, 470)))
boy.save(OUT / "gugu-boy.png")

sign = key_sky(crop("_tmp-sign.png", (838, 210, 1018, 500)))
sign.save(OUT / "loading-sign.png")

left_bf = key_sky(crop("_tmp-bf-left.png", (175, 175, 310, 310)))
left_bf.save(OUT / "loading-butterfly-left.png")

right_bf = key_sky(crop("_tmp-bf-right.png", (615, 235, 745, 355)))
right_bf.save(OUT / "loading-butterfly-right.png")

star = key_sky(crop("_tmp-star.png", (678, 418, 768, 512)))
star.save(OUT / "loading-star.png")

bg = src.convert("RGB")
clone_patch(bg, (250, 8, 780, 175), (40, 8, 240, 140))  # logo wordmark -> sky
clone_patch(bg, (310, 168, 720, 455), (40, 200, 280, 360))  # boy -> trees/sky mix
clone_patch(bg, (250, 418, 780, 545), (40, 470, 250, 560))  # bar/text -> grass
bg = bg.filter(ImageFilter.GaussianBlur(radius=0.4))
bg.save(OUT / "loading-background.png")
print("loading-background", bg.size)

for tmp in OUT.glob("_tmp-*.png"):
    tmp.unlink()
