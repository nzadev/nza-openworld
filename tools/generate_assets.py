#!/usr/bin/env python3
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "sprites"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def make_sheet(cols: int, rows: int, cell: int = 16) -> Image.Image:
    return Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))


def upscale(img: Image.Image, factor: int = 2) -> Image.Image:
    return img.resize((img.width * factor, img.height * factor), Image.Resampling.NEAREST)


def put(img: Image.Image, x: int, y: int, color: tuple[int, int, int, int]) -> None:
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), color)


def rect(img: Image.Image, x0: int, y0: int, w: int, h: int, color: tuple[int, int, int, int]) -> None:
    for yy in range(y0, y0 + h):
        for xx in range(x0, x0 + w):
            put(img, xx, yy, color)


def draw_grid(img: Image.Image, ox: int, oy: int, rows: list[str], palette: dict[str, tuple[int, int, int, int]]) -> None:
    for r_idx, row in enumerate(rows):
        for c_idx, ch in enumerate(row):
            if ch in palette:
                put(img, ox + c_idx, oy + r_idx, palette[ch])


def mirror_rows(rows: list[str]) -> list[str]:
    return [r[::-1] for r in rows]


def build_hero_sheet() -> None:
    sheet = make_sheet(6, 4, 16)
    pal = {
        "k": (14, 15, 28, 255),
        "h": (22, 24, 44, 255),
        "H": (44, 49, 86, 255),
        "s": (244, 198, 160, 255),
        "S": (209, 152, 114, 255),
        "e": (18, 226, 255, 255),
        "c": (36, 40, 84, 255),
        "C": (58, 66, 128, 255),
        "d": (24, 27, 58, 255),
        "g": (255, 212, 76, 255),
        "b": (0, 242, 255, 255),
        "B": (196, 255, 255, 255),
        "a": (45, 58, 86, 255),
        "p": (26, 33, 54, 255),
        "t": (18, 20, 34, 255),
    }

    down_idle = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khsssssshk....",
        "...kseeesesk....",
        "...ksssssssk....",
        "..kCCbggbbCCk...",
        "..kcCCCCCCcck...",
        ".kdcCaabaaCcdk..",
        ".kdcCpppppcCdk..",
        "..kdcpppppcdk...",
        "...kpp..ppk.....",
        "...ktt..ttk.....",
        "...kbt..tbk.....",
        "................",
        "................",
    ]
    down_walk1 = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khsssssshk....",
        "...kseeesesk....",
        "...ksssssssk....",
        "..kCCbggbbCCk...",
        "..kcCCCCCCcck...",
        ".kdcCaabaaCcdk..",
        ".kdcCpppppcCdk..",
        "..kdcpppppcdk...",
        "..kpp....ppk....",
        "..kbt....ttk....",
        "................",
        "................",
        "................",
    ]
    down_walk2 = mirror_rows(down_walk1)
    down_slash = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khsssssshk....",
        "...kseeesesk....",
        "...ksssssssk....",
        "..kCCbggbbCCk...",
        "..kcCCCCCCccss..",
        ".kdcCaabaaCckB..",
        "..dcCpppppcCkBb.",
        "...kppppppk..bBb",
        "...kpp..ppk...bB",
        "...kbt..tbk....b",
        "...............b",
        "................",
        "................",
    ]
    down_dash = [
        "....bbHbb.......",
        "...khhHhhkk.....",
        "..bhhhhhhhhb....",
        "..khsssssshk....",
        "...kseeesesk....",
        "..bCCbggbbCCb...",
        ".bkcCCCCCCcckb..",
        ".bdcCaabaaCcdb..",
        "..bkppppppkb....",
        "...bpp..ppb.....",
        "..bbt....tbb....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    down_bow = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khsssssshk....",
        "...kseeesesk....",
        "...ksssssssk..b.",
        "..kCCbggbbCCk.gb",
        "..kcCCCCCCccssBb",
        ".kdcCaabaaCc..gb",
        "..dcCpppppcCk.b.",
        "...kppppppk.....",
        "...kpp..ppk.....",
        "...kbt..tbk.....",
        "................",
        "................",
        "................",
    ]

    up_idle = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khhhhhhhhk....",
        "...khhhhhhk.....",
        "..kCCbggbbCCk...",
        ".bgbCCCCCCCCk...",
        "bggdcCCCCCCcdk..",
        "b..dcCCCCCCcdk..",
        "...dcCCCCCCcdk..",
        "...kddddddddk...",
        "...kpp..ppk.....",
        "...ktt..ttk.....",
        "...kbt..tbk.....",
        "................",
        "................",
    ]
    up_walk1 = [
        "....kkHkk.......",
        "...khhHhhkk.....",
        "..khhhhhhhhk....",
        "..khhhhhhhhk....",
        "...khhhhhhk.....",
        "..kCCbggbbCCk...",
        ".bgbCCCCCCCCk...",
        "bggdcCCCCCCcdk..",
        "...dcCCCCCCcdk..",
        "...dcCCCCCCcdk..",
        "...kddddddddk...",
        "..kpp....ppk....",
        "..kbt....ttk....",
        "................",
        "................",
        "................",
    ]
    up_walk2 = mirror_rows(up_walk1)
    up_slash = [
        "..........bB....",
        "....kkHkk.bBb...",
        "...khhHhhkkBb...",
        "..khhhhhhhhkB...",
        "..khhhhhhhhks...",
        "..kCCbggbbCCss..",
        ".bgbCCCCCCCCk...",
        "bggdcCCCCCCcdk..",
        "...dcCCCCCCcdk..",
        "...kddddddddk...",
        "...kpp..ppk.....",
        "...kbt..tbk.....",
        "................",
        "................",
        "................",
        "................",
    ]
    up_dash = [
        "....bbHbb.......",
        "...khhHhhkk.....",
        "..bhhhhhhhhb....",
        "..khhhhhhhhk....",
        "..bCCbggbbCCb...",
        ".bgbCCCCCCCCb...",
        "bggbcCCCCCCcb...",
        "...bcCCCCCCcb...",
        "...bddddddddb...",
        "...bpp..ppb.....",
        "..bbt....tbb....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    up_bow = [
        "....kkHkk..bBb..",
        "...khhHhhkg...g.",
        "..khhhhhhhhb.b..",
        "..khhhhhhhhkB...",
        "..kCCbggbbCCk...",
        ".bgbCCCCCCCCk...",
        "bggdcCCCCCCcdk..",
        "...dcCCCCCCcdk..",
        "...kddddddddk...",
        "...kpp..ppk.....",
        "...kbt..tbk.....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]

    left_idle = [
        "....kkHkkk......",
        "...khhHhhhhk....",
        "...khhhhhhhhk...",
        "...ksssehhhk....",
        "...ksssshhk.....",
        "....kCCbggbbg...",
        "...kcCCCCCCbgb..",
        "...kcCaabCCdkb..",
        "...kcCpppCCdk...",
        "....kppppcdk....",
        "....kpp.ppk.....",
        "....ktt.ttk.....",
        "...kbbt.tbk.....",
        "................",
        "................",
        "................",
    ]
    left_walk1 = [
        "....kkHkkk......",
        "...khhHhhhhk....",
        "...khhhhhhhhk...",
        "...ksssehhhk....",
        "...ksssshhk.....",
        "....kCCbggbbg...",
        "...kcCCCCCCbgb..",
        "...kcCaabCCdk...",
        "...kcCpppCCdk...",
        "....kppppcdk....",
        "...kpp...ppk....",
        "..kbbt....ttk...",
        "................",
        "................",
        "................",
        "................",
    ]
    left_walk2 = [
        "....kkHkkk......",
        "...khhHhhhhk....",
        "...khhhhhhhhk...",
        "...ksssehhhk....",
        "...ksssshhk.....",
        "....kCCbggbbg...",
        "...kcCCCCCCbgb..",
        "...kcCaabCCdk...",
        "...kcCpppCCdk...",
        "....kppppcdk....",
        "....kpp.ppk.....",
        "...ktt...bbtk...",
        "................",
        "................",
        "................",
        "................",
    ]
    left_slash = [
        ".....kkHkkk.....",
        "....khhHhhhhk...",
        "....khhhhhhhhk..",
        "....ksssehhhk...",
        "....ksssshhk....",
        ".....kCCbggbbg..",
        ".bbbbBssCCCCbgb.",
        "bBBBBBkCaabCCdk.",
        ".bbbb..kpppCCdk.",
        ".......kppppdk..",
        "......kpp..ppk..",
        ".....kbbt..tbk..",
        "................",
        "................",
        "................",
        "................",
    ]
    left_dash = [
        ".....bbHbbb.....",
        "....khhHhhhhb...",
        "....khhhhhhhhb..",
        "....ksssehhhb...",
        ".....bCCbggbbgb.",
        "....bcCCCCCCbgbb",
        "....bcCaabCCdbb.",
        ".....bppppcdbb..",
        "....bpp...ppb...",
        "...bbbt....tbb..",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    left_bow = [
        ".....kkHkkk.....",
        "....khhHhhhhk...",
        "....khhhhhhhhk..",
        "..b.ksssehhhk...",
        ".bg..ksssshhk...",
        "bBbbsskCCbggbb..",
        ".bg..kcCCCCCCdk.",
        "..b..kcCpppCCdk.",
        "......kppppcdk..",
        "......kpp.ppk...",
        ".....kbbt.tbk...",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]

    rows_data = [
        [down_idle, down_walk1, down_walk2, down_slash, down_dash, down_bow],
        [up_idle, up_walk1, up_walk2, up_slash, up_dash, up_bow],
        [left_idle, left_walk1, left_walk2, left_slash, left_dash, left_bow],
        [mirror_rows(f) for f in [left_idle, left_walk1, left_walk2, left_slash, left_dash, left_bow]],
    ]

    for r_idx, frames in enumerate(rows_data):
        for c_idx, grid in enumerate(frames):
            draw_grid(sheet, c_idx * 16, r_idx * 16, grid, pal)

    upscale(sheet, 2).save(OUT_DIR / "hero_nza.png")


def build_mobs_sheet() -> None:
    sheet = make_sheet(4, 6, 16)

    wolf_pal = {
        "k": (12, 8, 24, 255),
        "w": (34, 22, 62, 255),
        "W": (58, 38, 102, 255),
        "r": (232, 72, 255, 255),
        "e": (255, 76, 148, 255),
        "c": (168, 85, 247, 255),
    }
    wolf_0 = [
        "................",
        "................",
        "..kk.......kk...",
        ".kWWk.....kWWc..",
        "kWWWWkkkkkWWWc..",
        "keWWWWWrWWWWWk..",
        "kWWWWWrWWWWWWk..",
        ".kWWWWWWWWWWk...",
        "..kWWk..kWWk....",
        "..kwwk..kwwk....",
        "..kkrk..kkrk....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    wolf_1 = [
        "................",
        "................",
        "..kk........kk..",
        ".kWWk......kWWc.",
        "kWWWWkkkkkWWWWc.",
        "keWWWWWrWWWWWWk.",
        "kWWWWWrWWWWWWWk.",
        ".kWWWWWWWWWWWk..",
        ".kWWk.....kWWk..",
        "kwwk.......kwwk.",
        "kkrk.......kkrk.",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    wolf_2 = mirror_rows(wolf_1)
    wolf_atk = [
        "................",
        ".kk.........rc..",
        "kWWk.......kWWc.",
        "keWWkkkkkkWWWWk.",
        "erWWWWWrWWWWWWk.",
        ".kWWWWWrWWWWk...",
        "..kWWWWWWWWk....",
        ".kWWk....kWWk...",
        "kkrk......kkrk..",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    for i, g in enumerate([wolf_0, wolf_1, wolf_2, wolf_atk]):
        draw_grid(sheet, i * 16, 0, g, wolf_pal)

    golem_pal = {
        "k": (16, 20, 32, 255),
        "s": (78, 90, 116, 255),
        "S": (122, 138, 168, 255),
        "b": (42, 208, 255, 255),
        "B": (182, 246, 255, 255),
        "r": (236, 72, 255, 255),
        "R": (255, 170, 255, 255),
    }
    golem_0 = [
        "......bBb.......",
        "..b..bBBBb..b...",
        ".bBb.kbbbk.bBb..",
        ".kbbkSSSSSkbbk..",
        "..kSSSSSSSSSk...",
        ".kSSSkrrrkSSSk..",
        "kBSSkrRrrrkSSBk.",
        "kbSSkrrRrrkSSbk.",
        "krrSkSSSSSkSrrk.",
        ".kSSkssssskSSk..",
        "..kk.ksssk.kk...",
        "....kSS.SSk.....",
        "....kss.ssk.....",
        "...kSSk.kSSk....",
        "................",
        "................",
    ]
    golem_1 = [
        "......bBb.......",
        "..b..bBBBb..b...",
        ".bBb.kbbbk.bBb..",
        ".kbbkSSSSSkbbk..",
        "..kSSSSSSSSSk...",
        ".kSSSkrrrkSSSk..",
        "kBSSkrRrrrkSSBk.",
        "kbSSkrrRrrkSSbk.",
        "krrSkSSSSSkSrrk.",
        "..kk.ksssk.kk...",
        "....kSS.SSk.....",
        "...kSSk..kSSk...",
        "...kssk..kssk...",
        "................",
        "................",
        "................",
    ]
    golem_2 = mirror_rows(golem_1)
    golem_atk = [
        "..bBb.bBb.bBb...",
        ".bBBBbBBBbBBBb..",
        "kbbbbkbbbkbbbbk.",
        "kSSSkSSSSSkSSSk.",
        ".kSSkrrRrrkSSk..",
        "kBSSkrRRRrkSSBk.",
        "krrSkrrrrrkSrrk.",
        ".kSSkSSSSSkSSk..",
        "..kSSsssssSSk...",
        "...kSSk.kSSk....",
        "..kSSk...kSSk...",
        "..krrk...krrk...",
        "................",
        "................",
        "................",
        "................",
    ]
    for i, g in enumerate([golem_0, golem_1, golem_2, golem_atk]):
        draw_grid(sheet, i * 16, 16, g, golem_pal)

    wraith_pal = {
        "k": (10, 26, 44, 255),
        "c": (34, 150, 212, 255),
        "C": (103, 232, 249, 255),
        "W": (224, 252, 255, 255),
        "e": (255, 230, 102, 255),
        "d": (22, 78, 128, 255),
    }
    wraith_0 = [
        ".....kCCCk......",
        "....kCWWWCk.....",
        "...kCWeeeWCk....",
        "..W.kCCCCCk.W...",
        ".WCk.kdddk.kCW..",
        "WCk.kcCCCck.kCW.",
        "Ck..kcCCCck..kC.",
        "....kddcddk.....",
        "....kdd.ddk.....",
        ".....kd.dk......",
        "......k.k.......",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    wraith_1 = [
        "................",
        ".....kCCCk......",
        "....kCWWWCk.....",
        "...kCWeeeWCk....",
        ".WC..kCCCk..CW..",
        "WCk.kcCCCck.kCW.",
        "Ck..kcCCCck..kC.",
        "....kddcddk.....",
        ".....kd.dk......",
        "....kd...dk.....",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    wraith_atk = [
        "WW...kCCCk...WW.",
        "CWC.kCWWWCk.CWC.",
        ".CWCkWeeeWCkWC..",
        "..WCkCCCCCkCW...",
        "...kkcWWWckk....",
        "....kcCCCck.....",
        "....kddcddk.....",
        ".....kdddk......",
        "......k.k.......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    for i, g in enumerate([wraith_0, wraith_1, wraith_0, wraith_atk]):
        draw_grid(sheet, i * 16, 32, g, wraith_pal)

    djinn_pal = {
        "k": (24, 10, 8, 255),
        "o": (52, 28, 26, 255),
        "r": (220, 56, 24, 255),
        "f": (255, 132, 24, 255),
        "y": (255, 226, 76, 255),
    }
    djinn_0 = [
        "......fyf.......",
        ".....fyyyf......",
        "....frrrrf......",
        "...kooooook.....",
        "...koyrrryok....",
        "..koorfffrrok...",
        ".fkooorrrookf...",
        "fykooooooookyf..",
        ".fkoorrrrookf...",
        "...krrffrrk.....",
        "....krffrk......",
        ".....fyyf.......",
        "......ff........",
        "................",
        "................",
        "................",
    ]
    djinn_1 = [
        ".....fyyf.......",
        "....fyyyyf......",
        "....frrrrf......",
        "...kooooook.....",
        "...koyrrryok....",
        ".fykoorffrrokyf.",
        ".fkooorrrookf...",
        "..kooooooook....",
        "...koorrrook....",
        "....krffrrk.....",
        ".....fyyff......",
        "......ff........",
        "................",
        "................",
        "................",
        "................",
    ]
    djinn_atk = [
        "..fy..fyf..yf...",
        ".fyyffyyyffyyf..",
        "..ffkooooookff..",
        "...koyyyyyok....",
        "..koorfffrrok...",
        "fyykoorrrookyyf.",
        "fyykoooooookyyf.",
        "...koorrrook....",
        "....krfffrk.....",
        ".....fyyyf......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    for i, g in enumerate([djinn_0, djinn_1, djinn_0, djinn_atk]):
        draw_grid(sheet, i * 16, 48, g, djinn_pal)

    knight_pal = {
        "k": (12, 10, 22, 255),
        "a": (44, 38, 74, 255),
        "A": (78, 68, 126, 255),
        "v": (192, 38, 211, 255),
        "r": (255, 56, 108, 255),
        "g": (250, 204, 21, 255),
    }
    knight_0 = [
        "..v........v....",
        "..kv.kkkk.vk....",
        "...kAAAAAAk..r..",
        "...kArrrrAk.rvr.",
        "...kAAAAAAk..v..",
        "..kAAgvvgAAk.k..",
        ".kAAAaaaaAAAkk..",
        ".kaAAaaaaAAak...",
        "..kAAaaaaAAk.k..",
        "...kAA..AAk..k..",
        "...kaa..aak..k..",
        "...kgg..ggk.....",
        "................",
        "................",
        "................",
        "................",
    ]
    knight_1 = [
        "..v........v....",
        "..kv.kkkk.vk....",
        "...kAAAAAAk..r..",
        "...kArrrrAk.rvr.",
        "...kAAAAAAk..v..",
        "..kAAgvvgAAk.k..",
        ".kAAAaaaaAAAkk..",
        "..kAAaaaaAAk.k..",
        "..kAA....AAk.k..",
        "..kgg....ggk....",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    knight_atk = [
        "..v........v....",
        "..kv.kkkk.vk....",
        "...kAAAAAAk.....",
        "...kArrrrAk.....",
        "...kAAAAAAk.....",
        "..kAAgvvgAAkrrv.",
        "rvvrrkaaaAAAkvvr",
        ".rrr.kaaaAAk.rr.",
        "....kAA..AAk....",
        "...kgg....ggk...",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]
    for i, g in enumerate([knight_0, knight_1, mirror_rows(knight_1), knight_atk]):
        draw_grid(sheet, i * 16, 64, g, knight_pal)

    npc_configs = [
        {
            "h": (68, 42, 32, 255),
            "v": (255, 142, 36, 255),
            "c": (132, 52, 38, 255),
            "t": (212, 162, 64, 255),
        },
        {
            "h": (216, 236, 255, 255),
            "v": (34, 226, 255, 255),
            "c": (56, 88, 168, 255),
            "t": (165, 243, 252, 255),
        },
        {
            "h": (56, 38, 24, 255),
            "v": (52, 211, 153, 255),
            "c": (28, 104, 72, 255),
            "t": (250, 204, 21, 255),
        },
        {
            "h": (76, 29, 149, 255),
            "v": (232, 121, 249, 255),
            "c": (88, 28, 135, 255),
            "t": (253, 224, 71, 255),
        },
    ]
    npc_grid = [
        "....kkkkkk......",
        "...khhhhhhk.....",
        "..khhhhhhhhk....",
        "...ksvvvvsk.....",
        "...kssssssk.....",
        "..kccctttcck....",
        ".kcccccccccck...",
        ".kcccttttccck...",
        "..kcccccccck....",
        "...kcccccck.....",
        "...kdd..ddk.....",
        "...kkk..kkk.....",
        "................",
        "................",
        "................",
        "................",
    ]
    for idx, cfg in enumerate(npc_configs):
        p = {
            "k": (14, 16, 28, 255),
            "s": (242, 196, 158, 255),
            "d": (32, 36, 56, 255),
            **cfg,
        }
        draw_grid(sheet, idx * 16, 80, npc_grid, p)

    upscale(sheet, 2).save(OUT_DIR / "mobs.png")


def build_boss_sheet() -> None:
    sheet = make_sheet(4, 2, 32)
    draw = ImageDraw.Draw(sheet)

    for frame in range(4):
        ox = frame * 32
        oy = 0
        enrage = frame == 3
        cast = frame == 2
        bob = -1 if frame in (1, 2) else 0

        halo_col = (255, 64, 128, 220) if enrage else (192, 84, 255, 210)
        rim_col = (255, 224, 102, 255) if not enrage else (255, 120, 80, 255)
        draw.ellipse((ox + 8, oy + 1 + bob, ox + 24, oy + 17 + bob), outline=rim_col, width=2)
        draw.ellipse((ox + 10, oy + 3 + bob, ox + 22, oy + 15 + bob), fill=(12, 8, 22, 255))

        wing_col = (64, 24, 96, 255) if not enrage else (112, 20, 68, 255)
        wing_hi = (168, 85, 247, 255) if not enrage else (255, 72, 128, 255)
        spread = 2 if cast or enrage else 0
        draw.polygon([(ox + 12, oy + 14 + bob), (ox + 2 - spread, oy + 7 + bob), (ox + 4, oy + 22 + bob)], fill=wing_col, outline=wing_hi)
        draw.polygon([(ox + 20, oy + 14 + bob), (ox + 30 + spread, oy + 7 + bob), (ox + 28, oy + 22 + bob)], fill=wing_col, outline=wing_hi)

        rect(sheet, ox + 11, oy + 12 + bob, 10, 12, (28, 22, 48, 255))
        rect(sheet, ox + 12, oy + 13 + bob, 8, 9, (52, 40, 88, 255))
        rect(sheet, ox + 14, oy + 15 + bob, 4, 5, halo_col)
        rect(sheet, ox + 12, oy + 7 + bob, 8, 6, (24, 18, 42, 255))
        put(sheet, ox + 11, oy + 5 + bob, rim_col)
        put(sheet, ox + 12, oy + 6 + bob, rim_col)
        put(sheet, ox + 20, oy + 5 + bob, rim_col)
        put(sheet, ox + 19, oy + 6 + bob, rim_col)
        rect(sheet, ox + 13, oy + 9 + bob, 2, 2, (255, 64, 108, 255))
        rect(sheet, ox + 17, oy + 9 + bob, 2, 2, (255, 64, 108, 255))

        blade_c = (255, 72, 148, 255) if enrage else (0, 242, 255, 255)
        if cast:
            draw.line((ox + 5, oy + 4, ox + 10, oy + 14), fill=blade_c, width=2)
            draw.line((ox + 27, oy + 4, ox + 22, oy + 14), fill=blade_c, width=2)
        else:
            draw.line((ox + 3, oy + 24, ox + 10, oy + 16), fill=blade_c, width=2)
            draw.line((ox + 29, oy + 24, ox + 22, oy + 16), fill=blade_c, width=2)

        rect(sheet, ox + 12, oy + 24 + bob, 3, 5, (22, 18, 38, 255))
        rect(sheet, ox + 17, oy + 24 + bob, 3, 5, (22, 18, 38, 255))

    for frame in range(4):
        ox = frame * 32
        oy = 32
        slam = frame == 2
        over = frame == 3
        step = 1 if frame == 1 else 0
        core = (255, 208, 64, 255) if over else (34, 232, 255, 255)
        stone = (72, 86, 112, 255)
        stone_hi = (124, 144, 176, 255)

        rect(sheet, ox + 9, oy + 8 + step, 14, 16, stone)
        rect(sheet, ox + 11, oy + 10 + step, 10, 12, stone_hi)
        draw.polygon([(ox + 16, oy + 2), (ox + 12, oy + 8), (ox + 20, oy + 8)], fill=core)
        rect(sheet, ox + 13, oy + 13 + step, 6, 6, (24, 32, 52, 255))
        rect(sheet, ox + 14, oy + 14 + step, 4, 4, core)

        arm_y = oy + (16 if slam else 10)
        rect(sheet, ox + 3, arm_y, 5, 10, stone)
        rect(sheet, ox + 24, arm_y, 5, 10, stone)
        rect(sheet, ox + 4, arm_y + 2, 3, 4, core)
        rect(sheet, ox + 25, arm_y + 2, 3, 4, core)

        rect(sheet, ox + 10, oy + 24, 4, 6 - step, stone)
        rect(sheet, ox + 18, oy + 24, 4, 6, stone)

    upscale(sheet, 2).save(OUT_DIR / "boss_malakor.png")


def tile_box(sheet: Image.Image, idx: int) -> tuple[int, int]:
    return (idx % 8) * 16, (idx // 8) * 16


def fill_checker(sheet: Image.Image, ox: int, oy: int, c1: tuple[int, int, int, int], c2: tuple[int, int, int, int], mod: int = 5) -> None:
    for y in range(16):
        for x in range(16):
            v = ((x * 7 + y * 13) % mod) == 0
            put(sheet, ox + x, oy + y, c2 if v else c1)


def build_world_tiles() -> None:
    sheet = make_sheet(8, 5, 16)

    ox, oy = tile_box(sheet, 0)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    for px, py in [(3, 4), (11, 9), (6, 13)]:
        put(sheet, ox + px, oy + py, (74, 178, 102, 255))

    ox, oy = tile_box(sheet, 1)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    for fx, fy, fc in [(3, 4, (34, 232, 255, 255)), (11, 6, (255, 214, 82, 255)), (7, 12, (244, 114, 182, 255))]:
        put(sheet, ox + fx, oy + fy, fc)
        put(sheet, ox + fx + 1, oy + fy, (255, 255, 255, 255))

    ox, oy = tile_box(sheet, 2)
    fill_checker(sheet, ox, oy, (148, 118, 82, 255), (128, 98, 66, 255), 4)
    for sx, sy in [(2, 3), (9, 7), (5, 12), (13, 13)]:
        rect(sheet, ox + sx, oy + sy, 2, 2, (168, 140, 102, 255))

    ox, oy = tile_box(sheet, 3)
    rect(sheet, ox, oy, 16, 16, (88, 98, 114, 255))
    for y in (0, 8):
        rect(sheet, ox, oy + y, 16, 1, (56, 64, 78, 255))
    rect(sheet, ox + 7, oy, 1, 8, (56, 64, 78, 255))
    rect(sheet, ox + 15, oy + 8, 1, 8, (56, 64, 78, 255))
    put(sheet, ox + 2, oy + 2, (64, 142, 86, 255))
    put(sheet, ox + 11, oy + 10, (64, 142, 86, 255))

    for f_idx, shift in [(4, 0), (5, 3)]:
        ox, oy = tile_box(sheet, f_idx)
        rect(sheet, ox, oy, 16, 16, (18, 118, 168, 255))
        for wy in (3, 9, 14):
            for wx in range(16):
                if (wx + shift + wy) % 6 < 3:
                    put(sheet, ox + wx, oy + wy, (72, 208, 242, 255))

    ox, oy = tile_box(sheet, 6)
    rect(sheet, ox, oy, 16, 16, (124, 82, 44, 255))
    for x in range(0, 16, 4):
        rect(sheet, ox + x, oy, 1, 16, (82, 50, 26, 255))
    rect(sheet, ox, oy, 16, 2, (162, 114, 66, 255))
    rect(sheet, ox, oy + 14, 16, 2, (162, 114, 66, 255))

    ox, oy = tile_box(sheet, 7)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    rect(sheet, ox + 2, oy + 3, 12, 10, (24, 88, 54, 255))
    rect(sheet, ox + 3, oy + 2, 10, 10, (44, 164, 96, 255))
    for bx, by in [(5, 5), (10, 6), (7, 9)]:
        put(sheet, ox + bx, oy + by, (34, 238, 255, 255))

    ox, oy = tile_box(sheet, 8)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    rect(sheet, ox + 6, oy + 11, 4, 5, (92, 58, 34, 255))
    rect(sheet, ox + 2, oy + 2, 12, 10, (20, 78, 48, 255))
    rect(sheet, ox + 3, oy + 1, 10, 9, (36, 128, 72, 255))
    rect(sheet, ox + 5, oy + 2, 6, 5, (64, 168, 96, 255))

    ox, oy = tile_box(sheet, 9)
    rect(sheet, ox, oy, 16, 16, (64, 74, 92, 255))
    rect(sheet, ox + 1, oy + 1, 14, 6, (96, 108, 128, 255))
    rect(sheet, ox + 1, oy + 9, 6, 6, (88, 100, 120, 255))
    rect(sheet, ox + 9, oy + 9, 6, 6, (88, 100, 120, 255))
    rect(sheet, ox + 2, oy + 1, 5, 2, (54, 148, 84, 255))

    ox, oy = tile_box(sheet, 10)
    fill_checker(sheet, ox, oy, (78, 66, 58, 255), (96, 82, 72, 255), 4)
    rect(sheet, ox + 2, oy + 2, 12, 12, (62, 52, 46, 255))
    rect(sheet, ox + 3, oy + 3, 10, 8, (112, 96, 84, 255))

    ox, oy = tile_box(sheet, 11)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    rect(sheet, ox + 4, oy + 4, 8, 10, (156, 88, 48, 255))
    rect(sheet, ox + 5, oy + 3, 6, 2, (196, 122, 72, 255))
    rect(sheet, ox + 5, oy + 7, 6, 2, (34, 232, 255, 255))

    ox, oy = tile_box(sheet, 12)
    fill_checker(sheet, ox, oy, (218, 234, 248, 255), (196, 218, 240, 255), 6)

    ox, oy = tile_box(sheet, 13)
    rect(sheet, ox, oy, 16, 16, (122, 206, 244, 255))
    for i in range(12):
        put(sheet, ox + i + 2, oy + (13 - i), (214, 248, 255, 255))

    ox, oy = tile_box(sheet, 14)
    fill_checker(sheet, ox, oy, (218, 234, 248, 255), (196, 218, 240, 255), 6)
    rect(sheet, ox + 6, oy + 12, 4, 4, (78, 52, 36, 255))
    for row_w, ry in [(4, 2), (8, 5), (12, 8)]:
        rx = 8 - row_w // 2
        rect(sheet, ox + rx, oy + ry, row_w, 3, (32, 84, 92, 255))
        rect(sheet, ox + rx, oy + ry, row_w, 1, (238, 248, 255, 255))

    ox, oy = tile_box(sheet, 15)
    fill_checker(sheet, ox, oy, (218, 234, 248, 255), (196, 218, 240, 255), 6)
    rect(sheet, ox + 5, oy + 3, 6, 11, (38, 198, 248, 255))
    rect(sheet, ox + 3, oy + 7, 10, 7, (139, 92, 246, 255))
    rect(sheet, ox + 6, oy + 4, 3, 7, (206, 250, 255, 255))

    ox, oy = tile_box(sheet, 16)
    fill_checker(sheet, ox, oy, (48, 40, 44, 255), (62, 50, 54, 255), 5)

    ox, oy = tile_box(sheet, 17)
    fill_checker(sheet, ox, oy, (48, 40, 44, 255), (62, 50, 54, 255), 5)
    for cx, cy in [(2, 3), (3, 4), (4, 5), (5, 5), (10, 9), (11, 10), (12, 11)]:
        put(sheet, ox + cx, oy + cy, (255, 126, 28, 255))

    for f_idx, sh in [(18, 0), (19, 2)]:
        ox, oy = tile_box(sheet, f_idx)
        rect(sheet, ox, oy, 16, 16, (208, 52, 18, 255))
        for y in (2, 7, 12):
            for x in range(16):
                if (x + sh + y) % 5 < 2:
                    put(sheet, ox + x, oy + y, (255, 196, 46, 255))

    ox, oy = tile_box(sheet, 20)
    rect(sheet, ox, oy, 16, 16, (28, 20, 28, 255))
    rect(sheet, ox + 2, oy + 2, 12, 12, (46, 32, 48, 255))
    rect(sheet, ox + 5, oy + 4, 2, 8, (220, 68, 28, 255))

    ox, oy = tile_box(sheet, 21)
    rect(sheet, ox, oy, 16, 16, (92, 78, 66, 255))
    for i in range(3, 13):
        put(sheet, ox + i, oy + i, (255, 184, 48, 255))
        put(sheet, ox + (15 - i), oy + i, (24, 18, 16, 255))

    ox, oy = tile_box(sheet, 22)
    rect(sheet, ox, oy, 16, 16, (30, 24, 52, 255))
    rect(sheet, ox, oy, 16, 1, (54, 44, 92, 255))
    rect(sheet, ox, oy, 1, 16, (54, 44, 92, 255))
    put(sheet, ox + 8, oy + 8, (168, 85, 247, 255))

    ox, oy = tile_box(sheet, 23)
    rect(sheet, ox, oy, 16, 16, (18, 14, 34, 255))
    rect(sheet, ox + 2, oy + 2, 12, 12, (42, 32, 76, 255))
    rect(sheet, ox + 6, oy + 4, 4, 8, (192, 38, 211, 255))

    for idx, active in [(24, False), (25, True)]:
        ox, oy = tile_box(sheet, idx)
        rect(sheet, ox, oy, 16, 16, (54, 62, 82, 255))
        rect(sheet, ox + 2, oy + 2, 12, 12, (82, 94, 120, 255))
        c = (0, 242, 255, 255) if active else (64, 72, 92, 255)
        rect(sheet, ox + 5, oy + 4, 6, 8, c)
        if active:
            rect(sheet, ox + 6, oy + 5, 4, 6, (224, 255, 255, 255))

    for idx, active in [(26, False), (27, True)]:
        ox, oy = tile_box(sheet, idx)
        fill_checker(sheet, ox, oy, (54, 62, 82, 255), (68, 78, 102, 255), 4)
        rect(sheet, ox + 4, oy + 2, 8, 12, (38, 44, 66, 255))
        c = (34, 238, 255, 255) if active else (92, 102, 124, 255)
        rect(sheet, ox + 6, oy + 4, 4, 8, c)

    for idx, opened in [(28, False), (29, True)]:
        ox, oy = tile_box(sheet, idx)
        fill_checker(sheet, ox, oy, (68, 78, 96, 255), (82, 92, 112, 255), 5)
        rect(sheet, ox + 2, oy + 4, 12, 10, (124, 68, 28, 255))
        rect(sheet, ox + 2, oy + 4, 12, 2, (250, 204, 21, 255))
        if opened:
            rect(sheet, ox + 3, oy + 6, 10, 4, (24, 18, 28, 255))
        else:
            rect(sheet, ox + 7, oy + 7, 2, 3, (34, 238, 255, 255))

    ox, oy = tile_box(sheet, 30)
    rect(sheet, ox, oy, 16, 16, (214, 198, 172, 255))
    rect(sheet, ox, oy, 2, 16, (92, 58, 34, 255))
    rect(sheet, ox + 14, oy, 2, 16, (92, 58, 34, 255))
    rect(sheet, ox + 5, oy + 4, 6, 6, (56, 198, 244, 255))

    ox, oy = tile_box(sheet, 31)
    rect(sheet, ox, oy, 16, 16, (44, 52, 108, 255))
    for y in range(0, 16, 4):
        rect(sheet, ox, oy + y, 16, 1, (28, 34, 76, 255))
    rect(sheet, ox, oy + 14, 16, 2, (245, 196, 66, 255))

    ox, oy = tile_box(sheet, 32)
    rect(sheet, ox, oy, 16, 16, (88, 98, 114, 255))
    rect(sheet, ox + 2, oy + 5, 12, 7, (42, 48, 64, 255))
    rect(sheet, ox + 4, oy + 3, 8, 3, (255, 138, 36, 255))
    rect(sheet, ox + 5, oy + 7, 6, 2, (0, 242, 255, 255))

    ox, oy = tile_box(sheet, 33)
    rect(sheet, ox, oy, 16, 16, (30, 24, 52, 255))
    for x in (2, 6, 10, 13):
        rect(sheet, ox + x, oy, 2, 16, (232, 72, 255, 255))
    rect(sheet, ox, oy + 7, 16, 2, (0, 242, 255, 255))

    ox, oy = tile_box(sheet, 34)
    fill_checker(sheet, ox, oy, (42, 126, 72, 255), (54, 148, 84, 255), 5)
    rect(sheet, ox + 7, oy + 9, 2, 6, (92, 58, 34, 255))
    rect(sheet, ox + 3, oy + 3, 10, 6, (168, 122, 68, 255))
    rect(sheet, ox + 4, oy + 5, 8, 1, (48, 32, 18, 255))

    ox, oy = tile_box(sheet, 35)
    rect(sheet, ox, oy, 16, 16, (68, 78, 96, 255))
    rect(sheet, ox + 4, oy + 6, 8, 8, (42, 48, 62, 255))
    rect(sheet, ox + 5, oy + 2, 6, 5, (0, 242, 255, 255))
    rect(sheet, ox + 6, oy + 3, 4, 3, (224, 255, 255, 255))

    ox, oy = tile_box(sheet, 36)
    fill_checker(sheet, ox, oy, (214, 192, 136, 255), (194, 170, 114, 255), 5)

    ox, oy = tile_box(sheet, 37)
    rect(sheet, ox, oy, 16, 16, (136, 24, 68, 255))
    rect(sheet, ox + 1, oy, 2, 16, (250, 204, 21, 255))
    rect(sheet, ox + 13, oy, 2, 16, (250, 204, 21, 255))

    ox, oy = tile_box(sheet, 38)
    rect(sheet, ox, oy, 16, 16, (88, 98, 114, 255))
    rect(sheet, ox + 2, oy + 2, 12, 12, (34, 198, 244, 255))
    rect(sheet, ox + 5, oy + 5, 6, 6, (214, 255, 255, 255))

    ox, oy = tile_box(sheet, 39)
    fill_checker(sheet, ox, oy, (148, 118, 82, 255), (128, 98, 66, 255), 4)
    rect(sheet, ox + 7, oy + 10, 2, 5, (92, 58, 34, 255))
    rect(sheet, ox + 4, oy + 4, 8, 6, (196, 152, 92, 255))
    rect(sheet, ox + 6, oy + 6, 4, 2, (239, 68, 68, 255))

    upscale(sheet, 2).save(OUT_DIR / "world_tiles.png")


def build_fx_items() -> None:
    sheet = make_sheet(8, 2, 16)
    draw = ImageDraw.Draw(sheet)

    draw.arc((1, 1, 14, 14), start=15, end=165, fill=(0, 242, 255, 255), width=3)
    draw.arc((2, 2, 13, 13), start=30, end=150, fill=(224, 255, 255, 255), width=1)

    draw.arc((17, 1, 30, 14), start=195, end=345, fill=(0, 242, 255, 255), width=3)
    draw.arc((18, 2, 29, 13), start=210, end=330, fill=(224, 255, 255, 255), width=1)

    draw.arc((33, 1, 46, 14), start=105, end=255, fill=(0, 242, 255, 255), width=3)
    draw.arc((34, 2, 45, 13), start=120, end=240, fill=(224, 255, 255, 255), width=1)

    draw.arc((49, 1, 62, 14), start=-75, end=75, fill=(0, 242, 255, 255), width=3)
    draw.arc((50, 2, 61, 13), start=-60, end=60, fill=(224, 255, 255, 255), width=1)

    draw.ellipse((65, 1, 78, 14), outline=(0, 242, 255, 255), width=2)
    draw.ellipse((67, 3, 76, 12), outline=(255, 214, 82, 255), width=1)

    ox = 5 * 16
    rect(sheet, ox + 2, 7, 10, 2, (0, 242, 255, 255))
    draw.polygon([(ox + 14, 8), (ox + 10, 5), (ox + 10, 11)], fill=(224, 255, 255, 255))
    rect(sheet, ox + 1, 6, 2, 4, (255, 214, 82, 255))

    ox = 6 * 16
    draw.ellipse((ox + 3, 4, ox + 13, 14), fill=(28, 36, 62, 255), outline=(0, 242, 255, 255))
    rect(sheet, ox + 7, 2, 2, 3, (255, 196, 48, 255))
    rect(sheet, ox + 7, 8, 2, 2, (0, 242, 255, 255))

    ox = 7 * 16
    draw.ellipse((ox + 1, 1, ox + 14, 14), fill=(255, 138, 36, 235))
    draw.ellipse((ox + 3, 3, ox + 12, 12), fill=(0, 242, 255, 255))
    draw.ellipse((ox + 5, 5, ox + 10, 10), fill=(255, 255, 255, 255))

    orbs = [
        (0, (192, 38, 211, 255), (255, 160, 255, 255)),
        (1, (34, 211, 238, 255), (224, 255, 255, 255)),
        (2, (249, 115, 22, 255), (254, 240, 138, 255)),
    ]
    for col, c_out, c_in in orbs:
        ox = col * 16
        oy = 16
        draw.ellipse((ox + 4, oy + 4, ox + 12, oy + 12), fill=c_out)
        draw.ellipse((ox + 6, oy + 6, ox + 10, oy + 10), fill=c_in)

    ox, oy = 3 * 16, 16
    heart = [
        "................",
        "................",
        "...rrr..rrr.....",
        "..rRRRrRRRRr....",
        "..rWRRRRRRRr....",
        "..rRRRRRRRRr....",
        "...rRRRRRRr.....",
        "....rRRRRr......",
        ".....rRRr.......",
        "......rr........",
        "................",
    ]
    draw_grid(sheet, ox, oy, heart, {"r": (190, 24, 93, 255), "R": (251, 64, 128, 255), "W": (255, 228, 242, 255)})

    ox, oy = 4 * 16, 16
    draw.polygon([(ox + 8, oy + 2), (ox + 13, oy + 8), (ox + 8, oy + 14), (ox + 3, oy + 8)], fill=(0, 232, 255, 255), outline=(255, 224, 102, 255))
    rect(sheet, ox + 7, oy + 5, 2, 5, (232, 255, 255, 255))

    ox, oy = 5 * 16, 16
    rect(sheet, ox + 6, oy + 2, 4, 2, (214, 180, 112, 255))
    draw.ellipse((ox + 4, oy + 5, ox + 12, oy + 14), fill=(34, 232, 168, 255), outline=(224, 255, 255, 255))

    ox, oy = 6 * 16, 16
    draw.polygon([(ox + 8, oy + 1), (ox + 14, oy + 8), (ox + 8, oy + 15), (ox + 2, oy + 8)], fill=(168, 85, 247, 255), outline=(250, 204, 21, 255))
    rect(sheet, ox + 7, oy + 6, 2, 4, (0, 242, 255, 255))

    ox, oy = 7 * 16, 16
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        x2 = int(round(8 + math.cos(rad) * 6))
        y2 = int(round(8 + math.sin(rad) * 6))
        draw.line((ox + 8, oy + 8, ox + x2, oy + y2), fill=(255, 244, 180, 255), width=1)

    upscale(sheet, 2).save(OUT_DIR / "fx_items.png")


def main() -> None:
    build_hero_sheet()
    build_mobs_sheet()
    build_boss_sheet()
    build_world_tiles()
    build_fx_items()
    print("Generated sprites in", OUT_DIR)


if __name__ == "__main__":
    main()
