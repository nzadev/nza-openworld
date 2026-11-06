#!/usr/bin/env python3
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "sprites"
OUT_DIR.mkdir(parents=True, exist_ok=True)

OUTLINE = (14, 15, 26, 255)


def new_img(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def upscale(img: Image.Image, factor: int = 2) -> Image.Image:
    return img.resize((img.width * factor, img.height * factor), Image.Resampling.NEAREST)


def px_set(img: Image.Image, x: int, y: int, c: tuple[int, int, int, int]) -> None:
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), c)


def px_rect(img: Image.Image, x: int, y: int, w: int, h: int, c: tuple[int, int, int, int]) -> None:
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            px_set(img, xx, yy, c)


def draw_grid(img: Image.Image, ox: int, oy: int, rows: list[str], pal: dict[str, tuple[int, int, int, int]]) -> None:
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != "." and ch in pal:
                px_set(img, ox + x, oy + y, pal[ch])


def mirror_grid(rows: list[str]) -> list[str]:
    return [r[::-1] for r in rows]


def add_pixel_outline(img: Image.Image, x0: int, y0: int, w: int, h: int, outline_col: tuple[int, int, int, int] = OUTLINE) -> None:
    src = img.crop((x0, y0, x0 + w, y0 + h))
    sp = src.load()
    out = new_img(w, h)
    op = out.load()
    for y in range(h):
        for x in range(w):
            if sp[x, y][3] > 0:
                op[x, y] = sp[x, y]
            else:
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and sp[nx, ny][3] > 120:
                        op[x, y] = outline_col
                        break
    img.paste(out, (x0, y0))


def build_hero_sheet() -> None:
    cell = 24
    sheet = new_img(cell * 7, cell * 4)

    pal = {
        "K": (14, 15, 26, 255),
        "h": (22, 25, 48, 255),
        "H": (44, 52, 92, 255),
        "L": (76, 90, 148, 255),
        "S": (252, 212, 174, 255),
        "s": (218, 162, 122, 255),
        "W": (255, 255, 255, 255),
        "E": (16, 208, 255, 255),
        "C": (42, 48, 98, 255),
        "c": (27, 31, 68, 255),
        "A": (58, 76, 112, 255),
        "a": (36, 48, 74, 255),
        "B": (0, 242, 255, 255),
        "b": (195, 255, 255, 255),
        "G": (255, 214, 68, 255),
        "g": (214, 156, 32, 255),
        "M": (44, 34, 28, 255),
    }

    def paint_nza(col: int, row: int, facing: str, pose: str) -> None:
        ox, oy = col * cell, row * cell
        bob = -1 if pose in ("walk1", "walk2") else 0
        stride = 1 if pose == "walk1" else (-1 if pose == "walk2" else 0)

        if facing == "up" and pose != "item":
            px_rect(sheet, ox + 4, oy + 11 + bob, 4, 3, pal["B"])
            px_rect(sheet, ox + 5, oy + 12 + bob, 3, 1, pal["G"])

        if pose == "item":
            px_rect(sheet, ox + 8, oy + 3, 8, 6, pal["h"])
            px_rect(sheet, ox + 7, oy + 4, 10, 4, pal["H"])
            px_rect(sheet, ox + 8, oy + 8, 8, 5, pal["S"])
            px_set(sheet, ox + 10, oy + 10, pal["E"])
            px_set(sheet, ox + 13, oy + 10, pal["E"])
            px_rect(sheet, ox + 6, oy + 8, 2, 5, pal["C"])
            px_rect(sheet, ox + 16, oy + 8, 2, 5, pal["C"])
            px_rect(sheet, ox + 8, oy + 13, 8, 6, pal["C"])
            px_rect(sheet, ox + 9, oy + 13, 6, 2, pal["G"])
            px_rect(sheet, ox + 10, oy + 15, 4, 3, pal["B"])
            px_rect(sheet, ox + 9, oy + 19, 2, 3, pal["a"])
            px_rect(sheet, ox + 13, oy + 19, 2, 3, pal["a"])
            add_pixel_outline(sheet, ox, oy, cell, cell)
            return

        hx, hy = ox + 7, oy + 3 + bob
        px_rect(sheet, hx + 1, hy, 8, 3, pal["H"])
        px_rect(sheet, hx, hy + 2, 10, 5, pal["h"])
        px_set(sheet, hx - 1, hy + 1, pal["h"])
        px_set(sheet, hx + 10, hy + 2, pal["H"])
        px_set(sheet, hx + 3, hy - 1, pal["L"])
        px_set(sheet, hx + 7, hy - 1, pal["H"])

        if facing == "down":
            px_rect(sheet, hx + 1, hy + 5, 8, 5, pal["S"])
            px_rect(sheet, hx + 1, hy + 9, 8, 1, pal["s"])
            px_rect(sheet, hx + 2, hy + 6, 2, 2, pal["W"])
            px_rect(sheet, hx + 6, hy + 6, 2, 2, pal["W"])
            px_set(sheet, hx + 3, hy + 7, pal["E"])
            px_set(sheet, hx + 6, hy + 7, pal["E"])
        elif facing == "up":
            px_rect(sheet, hx + 1, hy + 4, 8, 6, pal["h"])
            px_rect(sheet, hx + 2, hy + 5, 6, 3, pal["H"])
        elif facing == "left":
            px_rect(sheet, hx + 1, hy + 5, 6, 5, pal["S"])
            px_rect(sheet, hx + 6, hy + 4, 4, 6, pal["h"])
            px_set(sheet, hx + 2, hy + 6, pal["W"])
            px_set(sheet, hx + 2, hy + 7, pal["E"])
            px_rect(sheet, hx + 9, hy + 9, 4, 2, pal["B"])
            px_set(sheet, hx + 10, hy + 9, pal["G"])
        elif facing == "right":
            px_rect(sheet, hx + 3, hy + 5, 6, 5, pal["S"])
            px_rect(sheet, hx, hy + 4, 4, 6, pal["h"])
            px_set(sheet, hx + 7, hy + 6, pal["W"])
            px_set(sheet, hx + 7, hy + 7, pal["E"])
            px_rect(sheet, hx - 3, hy + 9, 4, 2, pal["B"])
            px_set(sheet, hx - 2, hy + 9, pal["G"])

        tx, ty = ox + 7, oy + 13 + bob
        px_rect(sheet, tx, ty, 10, 6, pal["c"])
        px_rect(sheet, tx + 1, ty, 8, 5, pal["C"])
        px_rect(sheet, tx + 1, ty, 8, 2, pal["B"])
        px_rect(sheet, tx + 3, ty, 4, 2, pal["G"])

        if facing == "up":
            px_rect(sheet, tx + 1, ty + 2, 8, 5, pal["C"])
            px_rect(sheet, tx + 2, ty + 3, 6, 4, pal["c"])
        else:
            px_rect(sheet, tx + 3, ty + 2, 4, 3, pal["A"])
            px_set(sheet, tx + 4, ty + 3, pal["B"])
            px_set(sheet, tx + 5, ty + 3, pal["B"])

        lx1 = ox + 8 + stride
        lx2 = ox + 13 - stride
        ly = oy + 19
        px_rect(sheet, lx1, ly, 3, 3, pal["a"])
        px_rect(sheet, lx2, ly, 3, 3, pal["a"])
        px_rect(sheet, lx1, ly + 2, 3, 1, pal["B"])
        px_rect(sheet, lx2, ly + 2, 3, 1, pal["B"])

        if pose == "guard":
            sx = ox + (5 if facing == "left" else 13 if facing == "right" else 8)
            sy = oy + (10 if facing == "up" else 13)
            px_rect(sheet, sx, sy, 7, 7, pal["C"])
            px_rect(sheet, sx + 1, sy + 1, 5, 5, pal["B"])
            px_rect(sheet, sx + 2, sy + 2, 3, 3, pal["b"])
            px_set(sheet, sx + 3, sy + 3, pal["G"])
        elif pose == "slash":
            if facing == "down":
                px_rect(sheet, ox + 11, oy + 17, 2, 6, pal["B"])
                px_rect(sheet, ox + 12, oy + 18, 1, 5, pal["b"])
            elif facing == "up":
                px_rect(sheet, ox + 14, oy + 0, 2, 7, pal["B"])
                px_rect(sheet, ox + 14, oy + 1, 1, 5, pal["b"])
            elif facing == "left":
                px_rect(sheet, ox + 1, oy + 14, 7, 2, pal["B"])
                px_rect(sheet, ox + 1, oy + 14, 6, 1, pal["b"])
            elif facing == "right":
                px_rect(sheet, ox + 16, oy + 14, 7, 2, pal["B"])
                px_rect(sheet, ox + 17, oy + 14, 6, 1, pal["b"])
        elif pose == "dash":
            for yy in range(oy + 4, oy + 21, 3):
                px_set(sheet, ox + 5, yy, pal["B"])
                px_set(sheet, ox + 18, yy, pal["B"])
        elif pose == "bow":
            bx = ox + (3 if facing == "left" else 18 if facing == "right" else 16)
            by = oy + 12
            px_rect(sheet, bx, by, 2, 6, pal["G"])
            px_rect(sheet, bx + 1, by + 1, 2, 4, pal["B"])
        else:
            if facing in ("down", "right"):
                px_rect(sheet, ox + 5, oy + 14 + bob, 3, 4, pal["A"])
                px_set(sheet, ox + 6, oy + 15 + bob, pal["B"])

        add_pixel_outline(sheet, ox, oy, cell, cell)

    poses = ["idle", "walk1", "walk2", "slash", "dash", "guard", "item"]
    dirs = ["down", "up", "left", "right"]
    for r_idx, d in enumerate(dirs):
        for c_idx, p in enumerate(poses):
            paint_nza(c_idx, r_idx, d, p)

    upscale(sheet, 2).save(OUT_DIR / "hero_nza.png")


def build_mobs_sheet() -> None:
    cell = 24
    sheet = new_img(cell * 4, cell * 6)
    draw = ImageDraw.Draw(sheet)

    for c in range(4):
        ox, oy = c * cell, 0
        leap = -2 if c == 3 else 0
        stride = 2 if c == 1 else (-2 if c == 2 else 0)
        draw.ellipse((ox + 4, oy + 10 + leap, ox + 19, oy + 18 + leap), fill=(44, 28, 82, 255))
        draw.ellipse((ox + 5, oy + 11 + leap, ox + 17, oy + 16 + leap), fill=(68, 42, 122, 255))
        draw.polygon([(ox + 3, oy + 9 + leap), (ox + 8, oy + 6 + leap), (ox + 9, oy + 13 + leap)], fill=(44, 28, 82, 255))
        draw.polygon([(ox + 17, oy + 12 + leap), (ox + 22, oy + 7 + leap), (ox + 20, oy + 14 + leap)], fill=(168, 85, 247, 255))
        px_rect(sheet, ox + 5, oy + 10 + leap, 2, 2, (255, 64, 160, 255))
        px_rect(sheet, ox + 10, oy + 12 + leap, 3, 2, (232, 121, 249, 255))
        px_rect(sheet, ox + 6 + stride, oy + 17 + leap, 3, 4, (32, 20, 62, 255))
        px_rect(sheet, ox + 15 - stride, oy + 17 + leap, 3, 4, (32, 20, 62, 255))
        px_set(sheet, ox + 6 + stride, oy + 20 + leap, (232, 121, 249, 255))
        px_set(sheet, ox + 15 - stride, oy + 20 + leap, (232, 121, 249, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    for c in range(4):
        ox, oy = c * cell, cell
        slam = 2 if c == 3 else 0
        step = 1 if c == 1 else (-1 if c == 2 else 0)
        draw.polygon([(ox + 12, oy + 2), (ox + 8, oy + 8), (ox + 16, oy + 8)], fill=(56, 216, 255, 255))
        draw.polygon([(ox + 12, oy + 3), (ox + 10, oy + 7), (ox + 14, oy + 7)], fill=(210, 252, 255, 255))
        draw.polygon([(ox + 5, oy + 5), (ox + 3, oy + 10), (ox + 8, oy + 10)], fill=(56, 216, 255, 255))
        draw.polygon([(ox + 19, oy + 5), (ox + 16, oy + 10), (ox + 21, oy + 10)], fill=(56, 216, 255, 255))
        px_rect(sheet, ox + 6, oy + 8, 12, 10, (92, 106, 136, 255))
        px_rect(sheet, ox + 7, oy + 9, 10, 8, (132, 148, 180, 255))
        px_rect(sheet, ox + 9, oy + 11, 6, 5, (192, 38, 211, 255))
        px_rect(sheet, ox + 10, oy + 12, 4, 3, (255, 178, 255, 255))
        px_rect(sheet, ox + 2, oy + 9 + slam, 4, 8, (82, 96, 126, 255))
        px_rect(sheet, ox + 18, oy + 9 + slam, 4, 8, (82, 96, 126, 255))
        px_rect(sheet, ox + 3, oy + 12 + slam, 2, 3, (56, 216, 255, 255))
        px_rect(sheet, ox + 19, oy + 12 + slam, 2, 3, (56, 216, 255, 255))
        px_rect(sheet, ox + 7, oy + 18 + max(0, step), 4, 4, (72, 84, 112, 255))
        px_rect(sheet, ox + 13, oy + 18 + max(0, -step), 4, 4, (72, 84, 112, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    for c in range(4):
        ox, oy = c * cell, cell * 2
        bob = -1 if c in (1, 3) else 0
        draw.ellipse((ox + 7, oy + 3 + bob, ox + 17, oy + 12 + bob), fill=(56, 189, 248, 255))
        draw.ellipse((ox + 8, oy + 4 + bob, ox + 16, oy + 10 + bob), fill=(186, 230, 253, 255))
        px_rect(sheet, ox + 9, oy + 7 + bob, 2, 2, (250, 204, 21, 255))
        px_rect(sheet, ox + 13, oy + 7 + bob, 2, 2, (250, 204, 21, 255))
        draw.polygon([(ox + 8, oy + 11 + bob), (ox + 16, oy + 11 + bob), (ox + 12, oy + 21 + bob)], fill=(28, 100, 162, 255))
        wing = -3 if c == 3 else 0
        draw.line((ox + 7, oy + 11 + bob, ox + 2, oy + 16 + wing), fill=(224, 252, 255, 255), width=2)
        draw.line((ox + 17, oy + 11 + bob, ox + 22, oy + 16 + wing), fill=(224, 252, 255, 255), width=2)
        add_pixel_outline(sheet, ox, oy, cell, cell)

    for c in range(4):
        ox, oy = c * cell, cell * 3
        flare = 2 if c == 3 else (c % 2)
        draw.polygon([(ox + 12, oy + 2 - flare), (ox + 7, oy + 9), (ox + 17, oy + 9)], fill=(255, 196, 46, 255))
        draw.ellipse((ox + 6, oy + 7, ox + 18, oy + 17), fill=(68, 28, 26, 255))
        draw.ellipse((ox + 8, oy + 8, ox + 16, oy + 15), fill=(234, 88, 12, 255))
        px_rect(sheet, ox + 9, oy + 10, 2, 2, (254, 240, 138, 255))
        px_rect(sheet, ox + 13, oy + 10, 2, 2, (254, 240, 138, 255))
        draw.ellipse((ox + 8, oy + 16, ox + 16, oy + 21), fill=(251, 146, 60, 255))
        px_rect(sheet, ox + 3, oy + 11, 3, 4, (255, 180, 42, 255))
        px_rect(sheet, ox + 18, oy + 11, 3, 4, (255, 180, 42, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    for c in range(4):
        ox, oy = c * cell, cell * 4
        atk = c == 3
        px_rect(sheet, ox + 8, oy + 5, 8, 6, (68, 54, 114, 255))
        px_set(sheet, ox + 7, oy + 3, (232, 72, 255, 255))
        px_set(sheet, ox + 8, oy + 4, (232, 72, 255, 255))
        px_set(sheet, ox + 16, oy + 3, (232, 72, 255, 255))
        px_set(sheet, ox + 15, oy + 4, (232, 72, 255, 255))
        px_rect(sheet, ox + 9, oy + 7, 6, 2, (255, 56, 112, 255))
        px_rect(sheet, ox + 7, oy + 11, 10, 7, (50, 40, 88, 255))
        px_rect(sheet, ox + 9, oy + 12, 6, 4, (92, 76, 152, 255))
        px_rect(sheet, ox + 4, oy + 11, 4, 6, (38, 30, 68, 255))
        px_rect(sheet, ox + 5, oy + 12, 2, 4, (192, 38, 211, 255))
        if atk:
            draw.line((ox + 17, oy + 14, ox + 23, oy + 14), fill=(255, 64, 128, 255), width=2)
        else:
            draw.line((ox + 19, oy + 4, ox + 19, oy + 20), fill=(148, 163, 184, 255), width=1)
            px_rect(sheet, ox + 18, oy + 4, 3, 4, (255, 64, 128, 255))
        px_rect(sheet, ox + 8, oy + 18, 3, 4, (36, 28, 62, 255))
        px_rect(sheet, ox + 13, oy + 18, 3, 4, (36, 28, 62, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    npc_styles = [
        ((92, 52, 36, 255), (180, 83, 9, 255), (251, 191, 36, 255)),
        ((216, 238, 255, 255), (37, 99, 235, 255), (34, 211, 238, 255)),
        ((62, 42, 28, 255), (22, 101, 52, 255), (74, 222, 128, 255)),
        ((88, 28, 135, 255), (107, 33, 168, 255), (244, 114, 182, 255)),
    ]
    for idx, (hair, robe, trim) in enumerate(npc_styles):
        ox, oy = idx * cell, cell * 5
        px_rect(sheet, ox + 8, oy + 4, 8, 4, hair)
        px_rect(sheet, ox + 8, oy + 7, 8, 5, (250, 208, 170, 255))
        px_set(sheet, ox + 10, oy + 9, (20, 24, 38, 255))
        px_set(sheet, ox + 13, oy + 9, (20, 24, 38, 255))
        px_rect(sheet, ox + 7, oy + 12, 10, 7, robe)
        px_rect(sheet, ox + 9, oy + 12, 6, 2, trim)
        px_rect(sheet, ox + 10, oy + 14, 4, 4, trim)
        px_rect(sheet, ox + 8, oy + 19, 3, 3, (36, 40, 58, 255))
        px_rect(sheet, ox + 13, oy + 19, 3, 3, (36, 40, 58, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    upscale(sheet, 2).save(OUT_DIR / "mobs.png")


def build_boss_sheet() -> None:
    cell = 40
    sheet = new_img(cell * 4, cell * 2)
    draw = ImageDraw.Draw(sheet)

    for f in range(4):
        ox, oy = f * cell, 0
        enrage = f == 3
        cast = f == 2
        bob = -1 if f in (1, 2) else 0
        rim = (255, 96, 128, 255) if enrage else (255, 214, 82, 255)
        wing_c = (118, 24, 78, 255) if enrage else (68, 30, 112, 255)
        wing_hi = (255, 72, 148, 255) if enrage else (192, 132, 252, 255)

        draw.ellipse((ox + 11, oy + 2 + bob, ox + 29, oy + 20 + bob), outline=rim, width=2)
        draw.ellipse((ox + 13, oy + 4 + bob, ox + 27, oy + 18 + bob), fill=(14, 10, 26, 255))

        sp = 3 if cast or enrage else 0
        draw.polygon([(ox + 15, oy + 18 + bob), (ox + 2 - sp, oy + 8 + bob), (ox + 5, oy + 28 + bob)], fill=wing_c, outline=wing_hi)
        draw.polygon([(ox + 25, oy + 18 + bob), (ox + 38 + sp, oy + 8 + bob), (ox + 35, oy + 28 + bob)], fill=wing_c, outline=wing_hi)

        px_rect(sheet, ox + 14, oy + 16 + bob, 12, 14, (36, 28, 66, 255))
        px_rect(sheet, ox + 16, oy + 18 + bob, 8, 10, (68, 52, 118, 255))
        px_rect(sheet, ox + 18, oy + 20 + bob, 4, 6, rim)
        px_rect(sheet, ox + 15, oy + 10 + bob, 10, 7, (28, 22, 52, 255))
        px_rect(sheet, ox + 17, oy + 13 + bob, 2, 2, (255, 64, 112, 255))
        px_rect(sheet, ox + 21, oy + 13 + bob, 2, 2, (255, 64, 112, 255))

        blade = (255, 72, 148, 255) if enrage else (0, 242, 255, 255)
        if cast:
            draw.line((ox + 6, oy + 4, ox + 14, oy + 18), fill=blade, width=3)
            draw.line((ox + 34, oy + 4, ox + 26, oy + 18), fill=blade, width=3)
        else:
            draw.line((ox + 4, oy + 31, ox + 14, oy + 20), fill=blade, width=3)
            draw.line((ox + 36, oy + 31, ox + 26, oy + 20), fill=blade, width=3)

        px_rect(sheet, ox + 15, oy + 30 + bob, 4, 6, (24, 18, 44, 255))
        px_rect(sheet, ox + 21, oy + 30 + bob, 4, 6, (24, 18, 44, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    for f in range(4):
        ox, oy = f * cell, cell
        slam = 3 if f == 2 else 0
        core = (255, 208, 64, 255) if f == 3 else (34, 232, 255, 255)
        draw.polygon([(ox + 20, oy + 3), (ox + 14, oy + 11), (ox + 26, oy + 11)], fill=core)
        px_rect(sheet, ox + 11, oy + 11, 18, 19, (82, 96, 128, 255))
        px_rect(sheet, ox + 13, oy + 13, 14, 15, (132, 150, 184, 255))
        px_rect(sheet, ox + 16, oy + 16, 8, 8, (26, 34, 56, 255))
        px_rect(sheet, ox + 18, oy + 18, 4, 4, core)
        px_rect(sheet, ox + 4, oy + 13 + slam, 6, 13, (82, 96, 128, 255))
        px_rect(sheet, ox + 30, oy + 13 + slam, 6, 13, (82, 96, 128, 255))
        px_rect(sheet, ox + 5, oy + 16 + slam, 4, 5, core)
        px_rect(sheet, ox + 31, oy + 16 + slam, 4, 5, core)
        px_rect(sheet, ox + 13, oy + 30, 5, 6, (64, 76, 102, 255))
        px_rect(sheet, ox + 22, oy + 30, 5, 6, (64, 76, 102, 255))
        add_pixel_outline(sheet, ox, oy, cell, cell)

    upscale(sheet, 2).save(OUT_DIR / "boss_malakor.png")


def build_world_tiles() -> None:
    sheet = new_img(32 * 8, 32 * 5)
    draw = ImageDraw.Draw(sheet)

    def tpos(idx: int) -> tuple[int, int]:
        return (idx % 8) * 32, (idx // 8) * 32

    def paint_grass_base(ox: int, oy: int) -> None:
        for y in range(32):
            for x in range(32):
                n = (x * 13 + y * 29 + (x ^ y) * 7) % 17
                c = (56, 158, 78, 255) if n < 10 else (46, 138, 68, 255) if n < 15 else (76, 184, 92, 255)
                px_set(sheet, ox + x, oy + y, c)
        for bx, by in ((5, 7), (19, 12), (11, 24), (25, 26)):
            px_set(sheet, ox + bx, oy + by, (36, 114, 54, 255))
            px_set(sheet, ox + bx, oy + by - 1, (98, 204, 106, 255))
            px_set(sheet, ox + bx + 1, oy + by, (98, 204, 106, 255))

    def paint_snow_base(ox: int, oy: int) -> None:
        for y in range(32):
            for x in range(32):
                n = (x * 11 + y * 23) % 19
                c = (228, 242, 252, 255) if n < 13 else (204, 226, 244, 255) if n < 18 else (250, 254, 255, 255)
                px_set(sheet, ox + x, oy + y, c)

    def paint_ash_base(ox: int, oy: int) -> None:
        for y in range(32):
            for x in range(32):
                n = (x * 17 + y * 19) % 16
                c = (58, 46, 52, 255) if n < 10 else (46, 36, 42, 255) if n < 14 else (74, 58, 64, 255)
                px_set(sheet, ox + x, oy + y, c)

    def paint_stone_floor(ox: int, oy: int, base=(108, 118, 136, 255), hi=(136, 148, 168, 255), lo=(64, 72, 88, 255)) -> None:
        px_rect(sheet, ox, oy, 32, 32, base)
        blocks = [(0, 0, 15, 15), (16, 0, 15, 15), (0, 16, 20, 15), (21, 16, 10, 15)]
        for bx, by, bw, bh in blocks:
            px_rect(sheet, ox + bx, oy + by, bw, 1, hi)
            px_rect(sheet, ox + bx, oy + by, 1, bh, hi)
            px_rect(sheet, ox + bx, oy + by + bh, bw + 1, 1, lo)
            px_rect(sheet, ox + bx + bw, oy + by, 1, bh + 1, lo)

    ox, oy = tpos(0)
    paint_grass_base(ox, oy)

    ox, oy = tpos(1)
    paint_grass_base(ox, oy)
    for fx, fy, petal in ((7, 8, (56, 226, 255, 255)), (21, 11, (255, 218, 82, 255)), (13, 23, (250, 132, 202, 255)), (25, 25, (255, 255, 255, 255))):
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            px_set(sheet, ox + fx + dx, oy + fy + dy, petal)
        px_set(sheet, ox + fx, oy + fy, (255, 244, 130, 255))
        px_set(sheet, ox + fx, oy + fy + 2, (32, 108, 52, 255))

    ox, oy = tpos(2)
    for y in range(32):
        for x in range(32):
            n = (x * 19 + y * 31) % 15
            c = (186, 148, 98, 255) if n < 9 else (166, 128, 80, 255) if n < 13 else (206, 170, 118, 255)
            px_set(sheet, ox + x, oy + y, c)
    for sx, sy in ((5, 6), (18, 9), (10, 19), (24, 24), (6, 26)):
        draw.ellipse((ox + sx, oy + sy, ox + sx + 4, oy + sy + 3), fill=(198, 164, 116, 255), outline=(138, 104, 62, 255))

    ox, oy = tpos(3)
    paint_stone_floor(ox, oy)
    px_rect(sheet, ox + 3, oy + 14, 4, 2, (68, 162, 86, 255))
    px_rect(sheet, ox + 18, oy + 29, 5, 2, (68, 162, 86, 255))

    for tid, shift in ((4, 0), (5, 5)):
        ox, oy = tpos(tid)
        for y in range(32):
            for x in range(32):
                band = ((x + y // 2 + shift) % 12)
                c = (28, 148, 208, 255) if band < 8 else (44, 174, 232, 255)
                px_set(sheet, ox + x, oy + y, c)
        for wy in (5, 14, 24):
            for wx in range(2, 29):
                if (wx + shift + wy) % 9 < 4:
                    px_set(sheet, ox + wx, oy + wy, (186, 242, 255, 255))

    ox, oy = tpos(6)
    px_rect(sheet, ox, oy, 32, 32, (148, 98, 52, 255))
    for x in range(0, 32, 8):
        px_rect(sheet, ox + x, oy, 7, 32, (164, 112, 62, 255))
        px_rect(sheet, ox + x, oy, 1, 32, (192, 138, 82, 255))
        px_rect(sheet, ox + x + 7, oy, 1, 32, (92, 56, 28, 255))
    px_rect(sheet, ox, oy, 32, 4, (198, 146, 86, 255))
    px_rect(sheet, ox, oy + 28, 32, 4, (198, 146, 86, 255))
    px_rect(sheet, ox, oy + 4, 32, 1, OUTLINE)
    px_rect(sheet, ox, oy + 27, 32, 1, OUTLINE)

    ox, oy = tpos(7)
    paint_grass_base(ox, oy)
    draw.ellipse((ox + 3, oy + 5, ox + 28, oy + 28), fill=(26, 98, 52, 255), outline=OUTLINE)
    draw.ellipse((ox + 5, oy + 5, ox + 26, oy + 24), fill=(48, 168, 86, 255))
    draw.ellipse((ox + 8, oy + 6, ox + 22, oy + 16), fill=(102, 218, 118, 255))
    for bx, by in ((10, 13), (20, 12), (14, 19), (18, 20)):
        px_rect(sheet, ox + bx, oy + by, 2, 2, (34, 238, 255, 255))

    ox, oy = tpos(8)
    paint_grass_base(ox, oy)
    draw.ellipse((ox + 5, oy + 22, ox + 26, oy + 30), fill=(22, 68, 36, 180))
    px_rect(sheet, ox + 12, oy + 19, 8, 10, (112, 68, 38, 255))
    px_rect(sheet, ox + 13, oy + 19, 3, 10, (142, 92, 54, 255))
    draw.ellipse((ox + 2, oy + 2, ox + 29, oy + 23), fill=(24, 96, 52, 255), outline=OUTLINE)
    draw.ellipse((ox + 4, oy + 3, ox + 27, oy + 19), fill=(46, 152, 78, 255))
    draw.ellipse((ox + 7, oy + 4, ox + 23, oy + 13), fill=(98, 208, 114, 255))

    ox, oy = tpos(9)
    px_rect(sheet, ox, oy, 32, 32, (68, 78, 96, 255))
    px_rect(sheet, ox, oy, 32, 12, (112, 126, 148, 255))
    px_rect(sheet, ox + 1, oy + 1, 30, 2, (152, 168, 192, 255))
    px_rect(sheet, ox, oy + 12, 32, 2, OUTLINE)
    for by in (14, 23):
        px_rect(sheet, ox + 1, oy + by, 14, 8, (88, 100, 122, 255))
        px_rect(sheet, ox + 17, oy + by, 14, 8, (88, 100, 122, 255))
        px_rect(sheet, ox, oy + by + 8, 32, 1, OUTLINE)
    px_rect(sheet, ox + 4, oy + 1, 9, 4, (64, 168, 86, 255))

    ox, oy = tpos(10)
    paint_grass_base(ox, oy)
    draw.polygon([(ox + 3, oy + 26), (ox + 6, oy + 7), (ox + 16, oy + 3), (ox + 26, oy + 8), (ox + 29, oy + 26)], fill=(96, 82, 72, 255), outline=OUTLINE)
    draw.polygon([(ox + 7, oy + 9), (ox + 16, oy + 5), (ox + 24, oy + 9), (ox + 22, oy + 15), (ox + 9, oy + 15)], fill=(138, 120, 106, 255))
    px_rect(sheet, ox + 6, oy + 16, 20, 9, (74, 62, 54, 255))

    ox, oy = tpos(11)
    paint_grass_base(ox, oy)
    draw.ellipse((ox + 8, oy + 23, ox + 24, oy + 29), fill=(18, 48, 28, 170))
    draw.ellipse((ox + 7, oy + 8, ox + 25, oy + 27), fill=(176, 98, 52, 255), outline=OUTLINE)
    draw.ellipse((ox + 9, oy + 10, ox + 19, oy + 23), fill=(214, 134, 78, 255))
    draw.ellipse((ox + 9, oy + 5, ox + 23, oy + 11), fill=(138, 72, 36, 255), outline=OUTLINE)
    px_rect(sheet, ox + 10, oy + 15, 12, 3, (34, 228, 255, 255))

    ox, oy = tpos(12)
    paint_snow_base(ox, oy)

    ox, oy = tpos(13)
    px_rect(sheet, ox, oy, 32, 32, (132, 214, 250, 255))
    px_rect(sheet, ox, oy, 32, 1, (196, 242, 255, 255))
    for i in range(22):
        px_set(sheet, ox + 4 + i, oy + 25 - i, (232, 252, 255, 255))
        if i < 14:
            px_set(sheet, ox + 12 + i, oy + 27 - i, (206, 244, 255, 255))

    ox, oy = tpos(14)
    paint_snow_base(ox, oy)
    px_rect(sheet, ox + 13, oy + 23, 6, 7, (92, 58, 36, 255))
    for tier_y, half_w in ((3, 5), (9, 9), (15, 12)):
        draw.polygon([(ox + 16, oy + tier_y), (ox + 16 - half_w, oy + tier_y + 9), (ox + 16 + half_w, oy + tier_y + 9)], fill=(34, 92, 104, 255), outline=OUTLINE)
        draw.polygon([(ox + 16, oy + tier_y + 1), (ox + 16 - half_w + 3, oy + tier_y + 5), (ox + 16 + half_w - 3, oy + tier_y + 5)], fill=(238, 248, 255, 255))

    ox, oy = tpos(15)
    paint_snow_base(ox, oy)
    draw.polygon([(ox + 16, oy + 2), (ox + 10, oy + 14), (ox + 12, oy + 27), (ox + 20, oy + 27), (ox + 22, oy + 14)], fill=(38, 198, 248, 255), outline=OUTLINE)
    draw.polygon([(ox + 16, oy + 4), (ox + 13, oy + 14), (ox + 16, oy + 25)], fill=(208, 250, 255, 255))
    draw.polygon([(ox + 8, oy + 11), (ox + 4, oy + 20), (ox + 7, oy + 28), (ox + 13, oy + 28)], fill=(168, 85, 247, 255), outline=OUTLINE)
    draw.polygon([(ox + 24, oy + 12), (ox + 19, oy + 28), (ox + 26, oy + 28), (ox + 28, oy + 19)], fill=(168, 85, 247, 255), outline=OUTLINE)

    ox, oy = tpos(16)
    paint_ash_base(ox, oy)

    ox, oy = tpos(17)
    paint_ash_base(ox, oy)
    draw.line((ox + 4, oy + 6, ox + 14, oy + 15), fill=(255, 118, 24, 255), width=2)
    draw.line((ox + 14, oy + 15, ox + 26, oy + 25), fill=(255, 204, 48, 255), width=2)

    for tid, sh in ((18, 0), (19, 4)):
        ox, oy = tpos(tid)
        for y in range(32):
            for x in range(32):
                v = (x + y + sh) % 10
                c = (214, 52, 16, 255) if v < 6 else (248, 118, 24, 255) if v < 9 else (255, 218, 64, 255)
                px_set(sheet, ox + x, oy + y, c)

    ox, oy = tpos(20)
    paint_ash_base(ox, oy)
    draw.polygon([(ox + 4, oy + 28), (ox + 8, oy + 5), (ox + 16, oy + 2), (ox + 25, oy + 7), (ox + 28, oy + 28)], fill=(36, 24, 42, 255), outline=OUTLINE)
    draw.polygon([(ox + 9, oy + 7), (ox + 16, oy + 4), (ox + 18, oy + 26), (ox + 7, oy + 26)], fill=(58, 38, 68, 255))
    draw.line((ox + 15, oy + 8, ox + 17, oy + 24), fill=(255, 102, 24, 255), width=2)

    ox, oy = tpos(21)
    px_rect(sheet, ox, oy, 32, 32, (108, 88, 72, 255))
    px_rect(sheet, ox + 1, oy + 1, 30, 8, (142, 118, 96, 255))
    draw.line((ox + 6, oy + 6, ox + 25, oy + 26), fill=(255, 204, 48, 255), width=3)
    draw.line((ox + 25, oy + 7, ox + 7, oy + 25), fill=(255, 128, 24, 255), width=2)
    draw.rectangle((ox, oy, ox + 31, oy + 31), outline=OUTLINE)

    ox, oy = tpos(22)
    paint_stone_floor(ox, oy, (42, 32, 72, 255), (68, 52, 112, 255), (24, 18, 44, 255))
    px_rect(sheet, ox + 14, oy + 14, 4, 4, (168, 85, 247, 255))

    ox, oy = tpos(23)
    px_rect(sheet, ox, oy, 32, 32, (26, 18, 48, 255))
    px_rect(sheet, ox + 2, oy + 2, 28, 10, (58, 42, 98, 255))
    px_rect(sheet, ox + 4, oy + 15, 24, 14, (40, 28, 72, 255))
    px_rect(sheet, ox + 12, oy + 6, 8, 18, (192, 38, 211, 255))
    px_rect(sheet, ox + 14, oy + 8, 4, 14, (245, 208, 254, 255))
    draw.rectangle((ox, oy, ox + 31, oy + 31), outline=OUTLINE)

    for tid, active in ((24, False), (25, True)):
        ox, oy = tpos(tid)
        paint_stone_floor(ox, oy)
        draw.rectangle((ox + 4, oy + 6, ox + 27, oy + 27), fill=(62, 72, 96, 255), outline=OUTLINE)
        gem = (0, 242, 255, 255) if active else (78, 88, 112, 255)
        draw.polygon([(ox + 16, oy + 3), (ox + 9, oy + 15), (ox + 16, oy + 25), (ox + 23, oy + 15)], fill=gem, outline=OUTLINE)
        if active:
            draw.polygon([(ox + 16, oy + 6), (ox + 12, oy + 15), (ox + 16, oy + 22), (ox + 20, oy + 15)], fill=(224, 255, 255, 255))

    for tid, active in ((26, False), (27, True)):
        ox, oy = tpos(tid)
        paint_stone_floor(ox, oy)
        draw.ellipse((ox + 5, oy + 5, ox + 26, oy + 26), fill=(42, 52, 78, 255), outline=OUTLINE)
        ring = (34, 238, 255, 255) if active else (94, 106, 132, 255)
        draw.ellipse((ox + 8, oy + 8, ox + 23, oy + 23), outline=ring, width=2)
        if active:
            draw.ellipse((ox + 12, oy + 12, ox + 19, oy + 19), fill=(224, 255, 255, 255))

    for tid, opened in ((28, False), (29, True)):
        ox, oy = tpos(tid)
        paint_stone_floor(ox, oy)
        draw.rectangle((ox + 4, oy + 8, ox + 27, oy + 26), fill=(146, 78, 32, 255), outline=OUTLINE)
        px_rect(sheet, ox + 5, oy + 9, 22, 4, (250, 204, 21, 255))
        if opened:
            px_rect(sheet, ox + 6, oy + 13, 20, 7, (22, 16, 32, 255))
        else:
            px_rect(sheet, ox + 6, oy + 14, 20, 2, OUTLINE)
            px_rect(sheet, ox + 14, oy + 13, 4, 6, (34, 238, 255, 255))

    ox, oy = tpos(30)
    px_rect(sheet, ox, oy, 32, 32, (232, 216, 188, 255))
    px_rect(sheet, ox, oy, 4, 32, (112, 68, 38, 255))
    px_rect(sheet, ox + 28, oy, 4, 32, (112, 68, 38, 255))
    px_rect(sheet, ox, oy + 26, 32, 6, (108, 118, 136, 255))
    draw.rectangle((ox + 9, oy + 6, ox + 22, oy + 19), fill=(56, 198, 248, 255), outline=OUTLINE)
    px_rect(sheet, ox + 15, oy + 7, 2, 12, (112, 68, 38, 255))
    px_rect(sheet, ox + 10, oy + 12, 12, 2, (112, 68, 38, 255))

    ox, oy = tpos(31)
    px_rect(sheet, ox, oy, 32, 32, (52, 62, 128, 255))
    for ry in range(0, 28, 6):
        px_rect(sheet, ox, oy + ry, 32, 2, (76, 88, 164, 255))
        px_rect(sheet, ox, oy + ry + 5, 32, 1, (28, 34, 78, 255))
    px_rect(sheet, ox, oy + 28, 32, 4, (250, 204, 21, 255))

    ox, oy = tpos(32)
    paint_stone_floor(ox, oy)
    draw.rectangle((ox + 4, oy + 10, ox + 27, oy + 26), fill=(48, 56, 76, 255), outline=OUTLINE)
    draw.ellipse((ox + 8, oy + 6, ox + 23, oy + 16), fill=(255, 138, 28, 255), outline=OUTLINE)
    draw.ellipse((ox + 11, oy + 8, ox + 20, oy + 14), fill=(255, 232, 92, 255))

    ox, oy = tpos(33)
    paint_stone_floor(ox, oy, (42, 32, 72, 255), (68, 52, 112, 255), (24, 18, 44, 255))
    for bx in (4, 11, 18, 25):
        px_rect(sheet, ox + bx, oy, 3, 32, (232, 72, 255, 255))
        px_rect(sheet, ox + bx + 1, oy, 1, 32, (255, 210, 255, 255))
    px_rect(sheet, ox, oy + 14, 32, 4, (0, 242, 255, 255))

    ox, oy = tpos(34)
    paint_grass_base(ox, oy)
    px_rect(sheet, ox + 14, oy + 18, 4, 11, (102, 62, 34, 255))
    draw.rectangle((ox + 5, oy + 6, ox + 26, oy + 19), fill=(192, 142, 82, 255), outline=OUTLINE)
    px_rect(sheet, ox + 8, oy + 10, 16, 2, (92, 58, 32, 255))
    px_rect(sheet, ox + 8, oy + 14, 12, 2, (92, 58, 32, 255))

    ox, oy = tpos(35)
    paint_stone_floor(ox, oy)
    draw.rectangle((ox + 9, oy + 14, ox + 22, oy + 27), fill=(52, 60, 78, 255), outline=OUTLINE)
    draw.polygon([(ox + 16, oy + 3), (ox + 10, oy + 14), (ox + 22, oy + 14)], fill=(0, 242, 255, 255), outline=OUTLINE)
    draw.polygon([(ox + 16, oy + 6), (ox + 13, oy + 13), (ox + 19, oy + 13)], fill=(224, 255, 255, 255))

    ox, oy = tpos(36)
    for y in range(32):
        for x in range(32):
            n = (x * 13 + y * 17) % 13
            c = (232, 208, 146, 255) if n < 9 else (214, 188, 124, 255)
            px_set(sheet, ox + x, oy + y, c)

    ox, oy = tpos(37)
    px_rect(sheet, ox, oy, 32, 32, (156, 24, 76, 255))
    px_rect(sheet, ox + 2, oy, 3, 32, (250, 204, 21, 255))
    px_rect(sheet, ox + 27, oy, 3, 32, (250, 204, 21, 255))
    px_rect(sheet, ox + 14, oy + 14, 4, 4, (250, 204, 21, 255))

    ox, oy = tpos(38)
    paint_stone_floor(ox, oy)
    draw.ellipse((ox + 3, oy + 3, ox + 28, oy + 28), fill=(82, 94, 118, 255), outline=OUTLINE)
    draw.ellipse((ox + 6, oy + 6, ox + 25, oy + 25), fill=(34, 211, 238, 255))
    draw.ellipse((ox + 11, oy + 11, ox + 20, oy + 20), fill=(224, 255, 255, 255))

    ox, oy = tpos(39)
    paint_grass_base(ox, oy)
    px_rect(sheet, ox + 14, oy + 18, 4, 11, (108, 68, 38, 255))
    draw.ellipse((ox + 8, oy + 6, ox + 24, oy + 21), fill=(214, 168, 102, 255), outline=OUTLINE)
    draw.ellipse((ox + 11, oy + 9, ox + 21, oy + 18), outline=(239, 68, 68, 255), width=2)
    px_rect(sheet, ox + 15, oy + 13, 2, 2, (239, 68, 68, 255))

    sheet.save(OUT_DIR / "world_tiles.png")


def build_props_25d() -> None:
    sheet = new_img(256, 128)
    draw = ImageDraw.Draw(sheet)

    draw.ellipse((12, 48, 52, 62), fill=(12, 32, 18, 120))
    px_rect(sheet, 26, 38, 12, 20, (112, 68, 38, 255))
    px_rect(sheet, 28, 38, 5, 20, (148, 96, 56, 255))
    for cx, cy, rx, ry, col in (
        (32, 26, 24, 18, (22, 88, 48, 255)),
        (22, 24, 15, 13, (36, 136, 68, 255)),
        (42, 24, 15, 13, (36, 136, 68, 255)),
        (32, 18, 18, 14, (54, 168, 86, 255)),
        (30, 13, 12, 9, (112, 224, 126, 255)),
    ):
        draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=col)
    add_pixel_outline(sheet, 0, 0, 64, 64)

    ox = 64
    draw.ellipse((ox + 14, 48, ox + 50, 62), fill=(18, 38, 56, 110))
    px_rect(sheet, ox + 27, 42, 10, 16, (92, 58, 36, 255))
    for ty, hw in ((6, 10), (18, 16), (30, 22)):
        draw.polygon([(ox + 32, ty), (ox + 32 - hw, ty + 16), (ox + 32 + hw, ty + 16)], fill=(34, 92, 108, 255))
        draw.polygon([(ox + 32, ty + 1), (ox + 32 - hw + 4, ty + 9), (ox + 32 + hw - 4, ty + 9)], fill=(236, 248, 255, 255))
    add_pixel_outline(sheet, ox, 0, 64, 64)

    ox, oy = 128, 0
    draw.rectangle((ox + 6, oy + 40, ox + 122, oy + 92), fill=(228, 212, 184, 255))
    px_rect(sheet, ox + 6, oy + 40, 8, 52, (112, 68, 38, 255))
    px_rect(sheet, ox + 114, oy + 40, 8, 52, (112, 68, 38, 255))
    px_rect(sheet, ox + 6, oy + 82, 116, 10, (98, 108, 128, 255))
    draw.polygon([(ox + 2, oy + 44), (ox + 64, oy + 8), (ox + 126, oy + 44)], fill=(48, 58, 124, 255))
    draw.polygon([(ox + 8, oy + 42), (ox + 64, oy + 12), (ox + 120, oy + 42)], fill=(68, 82, 162, 255))
    px_rect(sheet, ox + 2, oy + 42, 124, 4, (250, 204, 21, 255))
    draw.rectangle((ox + 52, oy + 58, ox + 76, oy + 92), fill=(116, 66, 34, 255), outline=OUTLINE)
    px_rect(sheet, ox + 70, oy + 74, 3, 3, (250, 204, 21, 255))
    for wx in (ox + 20, ox + 88):
        draw.rectangle((wx, oy + 54, wx + 20, oy + 72), fill=(56, 208, 255, 255), outline=OUTLINE)
        px_rect(sheet, wx + 9, oy + 55, 2, 16, (112, 68, 38, 255))
        px_rect(sheet, wx + 1, oy + 62, 18, 2, (112, 68, 38, 255))
    add_pixel_outline(sheet, ox, oy, 128, 98)

    sheet.save(OUT_DIR / "props_25d.png")


def build_fx_items() -> None:
    sheet = new_img(32 * 8, 32 * 2)
    draw = ImageDraw.Draw(sheet)

    arcs = [
        (0, 15, 165),
        (1, 195, 345),
        (2, 105, 255),
        (3, -75, 75),
    ]
    for col, a0, a1 in arcs:
        ox = col * 32
        draw.arc((ox + 2, 2, ox + 30, 30), start=a0, end=a1, fill=(0, 242, 255, 255), width=6)
        draw.arc((ox + 4, 4, ox + 28, 28), start=a0 + 10, end=a1 - 10, fill=(232, 255, 255, 255), width=3)

    ox = 4 * 32
    draw.ellipse((ox + 2, 2, ox + 30, 30), outline=(0, 242, 255, 255), width=4)
    draw.ellipse((ox + 6, 6, ox + 26, 26), outline=(255, 214, 72, 255), width=2)

    ox = 5 * 32
    px_rect(sheet, ox + 4, 14, 18, 4, (0, 242, 255, 255))
    draw.polygon([(ox + 29, 16), (ox + 20, 10), (ox + 20, 22)], fill=(232, 255, 255, 255), outline=OUTLINE)
    px_rect(sheet, ox + 2, 12, 4, 8, (255, 214, 72, 255))

    ox = 6 * 32
    draw.ellipse((ox + 6, 8, ox + 26, 28), fill=(36, 46, 78, 255), outline=OUTLINE)
    draw.ellipse((ox + 11, 13, ox + 21, 23), fill=(0, 242, 255, 255))
    px_rect(sheet, ox + 14, 3, 4, 5, (255, 196, 48, 255))

    ox = 7 * 32
    draw.ellipse((ox + 1, 1, ox + 30, 30), fill=(255, 132, 28, 240))
    draw.ellipse((ox + 6, 6, ox + 25, 25), fill=(0, 242, 255, 255))
    draw.ellipse((ox + 10, 10, ox + 21, 21), fill=(255, 255, 255, 255))

    orbs = [
        (0, (192, 38, 211, 255), (255, 180, 255, 255)),
        (1, (34, 211, 238, 255), (232, 255, 255, 255)),
        (2, (249, 115, 22, 255), (254, 240, 138, 255)),
    ]
    for col, c_out, c_in in orbs:
        ox, oy = col * 32, 32
        draw.ellipse((ox + 7, oy + 7, ox + 25, oy + 25), fill=c_out, outline=OUTLINE)
        draw.ellipse((ox + 11, oy + 11, ox + 21, oy + 21), fill=c_in)

    ox, oy = 3 * 32, 32
    draw.polygon([(ox + 16, oy + 26), (ox + 5, oy + 14), (ox + 9, oy + 7), (ox + 16, oy + 11), (ox + 23, oy + 7), (ox + 27, oy + 14)], fill=(244, 63, 94, 255), outline=OUTLINE)
    draw.ellipse((ox + 9, oy + 9, ox + 14, oy + 14), fill=(255, 228, 236, 255))

    ox, oy = 4 * 32, 32
    draw.polygon([(ox + 16, oy + 4), (ox + 25, oy + 16), (ox + 16, oy + 28), (ox + 7, oy + 16)], fill=(0, 232, 255, 255), outline=OUTLINE)
    draw.polygon([(ox + 16, oy + 8), (ox + 21, oy + 16), (ox + 16, oy + 24), (ox + 11, oy + 16)], fill=(224, 255, 255, 255))

    ox, oy = 5 * 32, 32
    draw.ellipse((ox + 5, oy + 5, ox + 27, oy + 27), outline=(0, 242, 255, 255), width=4)
    draw.ellipse((ox + 9, oy + 9, ox + 23, oy + 23), outline=(250, 204, 21, 255), width=2)

    ox, oy = 6 * 32, 32
    draw.polygon([(ox + 16, oy + 3), (ox + 27, oy + 16), (ox + 16, oy + 29), (ox + 5, oy + 16)], fill=(168, 85, 247, 255), outline=OUTLINE)
    draw.polygon([(ox + 16, oy + 8), (ox + 22, oy + 16), (ox + 16, oy + 24), (ox + 10, oy + 16)], fill=(250, 204, 21, 255))

    ox, oy = 7 * 32, 32
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        x2 = int(round(16 + math.cos(rad) * 12))
        y2 = int(round(16 + math.sin(rad) * 12))
        draw.line((ox + 16, oy + 16, ox + x2, oy + y2), fill=(0, 242, 255, 255), width=2)
    draw.ellipse((ox + 11, oy + 11, ox + 21, oy + 21), fill=(255, 255, 255, 255))

    sheet.save(OUT_DIR / "fx_items.png")


def main() -> None:
    build_hero_sheet()
    build_mobs_sheet()
    build_boss_sheet()
    build_world_tiles()
    build_props_25d()
    build_fx_items()
    print("Generated 16-bit SNES pixel art sprites in", OUT_DIR)


if __name__ == "__main__":
    main()
