export const TILE_SIZE = 32;
export const WORLD_W = 110;
export const WORLD_H = 110;

export const TILE = {
  GRASS: 0,
  GRASS_FLOWER: 1,
  DIRT_PATH: 2,
  STONE_FLOOR: 3,
  WATER_0: 4,
  WATER_1: 5,
  BRIDGE: 6,
  BUSH: 7,
  TREE: 8,
  RUIN_WALL: 9,
  CLIFF_ROCK: 10,
  POT: 11,
  SNOW: 12,
  ICE: 13,
  SNOW_TREE: 14,
  CRYSTAL_ROCK: 15,
  ASH_GROUND: 16,
  MAGMA_CRACK: 17,
  LAVA_0: 18,
  LAVA_1: 19,
  OBSIDIAN_WALL: 20,
  CRACKED_WALL: 21,
  CITADEL_FLOOR: 22,
  CITADEL_WALL: 23,
  SHRINE_OFF: 24,
  SHRINE_ON: 25,
  WARP_OFF: 26,
  WARP_ON: 27,
  CHEST_CLOSED: 28,
  CHEST_OPEN: 29,
  HOUSE_WALL: 30,
  HOUSE_ROOF: 31,
  FORGE_ANVIL: 32,
  SEAL_GATE: 33,
  SIGNPOST: 34,
  TORCH_BRAZIER: 35,
  SAND_BANK: 36,
  CITADEL_CARPET: 37,
  HEAL_FOUNTAIN: 38,
  DUMMY_TARGET: 39,
};

export const SOLID_TILES = new Set([
  TILE.WATER_0,
  TILE.WATER_1,
  TILE.TREE,
  TILE.RUIN_WALL,
  TILE.CLIFF_ROCK,
  TILE.POT,
  TILE.SNOW_TREE,
  TILE.CRYSTAL_ROCK,
  TILE.LAVA_0,
  TILE.LAVA_1,
  TILE.OBSIDIAN_WALL,
  TILE.CRACKED_WALL,
  TILE.CITADEL_WALL,
  TILE.SHRINE_OFF,
  TILE.SHRINE_ON,
  TILE.WARP_OFF,
  TILE.WARP_ON,
  TILE.CHEST_CLOSED,
  TILE.CHEST_OPEN,
  TILE.HOUSE_WALL,
  TILE.HOUSE_ROOF,
  TILE.FORGE_ANVIL,
  TILE.SEAL_GATE,
  TILE.SIGNPOST,
  TILE.TORCH_BRAZIER,
  TILE.HEAL_FOUNTAIN,
  TILE.DUMMY_TARGET,
]);

export const SHRINES = [
  {
    id: "shrine_emerald",
    name: "Kuil Astral Zamrud",
    region: "Emerald Ruin Wilds",
    tx: 18,
    ty: 68,
    color: "#34d399",
    guardianName: "Kolosus Rune Zamrud",
  },
  {
    id: "shrine_tundra",
    name: "Kuil Astral Glasier",
    region: "Frostpeak Crystal Tundra",
    tx: 20,
    ty: 20,
    color: "#38bdf8",
    guardianName: "Kolosus Rune Glasier",
  },
  {
    id: "shrine_badlands",
    name: "Kuil Astral Magma",
    region: "Scorched Magma Badlands",
    tx: 90,
    ty: 82,
    color: "#fb923c",
    guardianName: "Kolosus Rune Magma",
  },
];

export const WARP_POINTS = [
  {
    id: "warp_sanctuary",
    name: "Nza Haven Sanctuary",
    subtitle: "Pusat Kota & Tempa Astral",
    tx: 55,
    ty: 60,
    spawnX: 55,
    spawnY: 61.4,
    defaultUnlocked: true,
  },
  {
    id: "warp_emerald",
    name: "Reruntuhan Zamrud",
    subtitle: "Wilayah Barat Daya",
    tx: 22,
    ty: 70,
    spawnX: 22,
    spawnY: 71.4,
    defaultUnlocked: false,
  },
  {
    id: "warp_tundra",
    name: "Puncak Kristal Es",
    subtitle: "Wilayah Barat Laut",
    tx: 25,
    ty: 22,
    spawnX: 25,
    spawnY: 23.4,
    defaultUnlocked: false,
  },
  {
    id: "warp_badlands",
    name: "Lembah Magma Obsidian",
    subtitle: "Wilayah Tenggara",
    tx: 85,
    ty: 82,
    spawnX: 85,
    spawnY: 83.4,
    defaultUnlocked: false,
  },
  {
    id: "warp_citadel",
    name: "Gerbang Benteng Gerhana",
    subtitle: "Wilayah Timur Laut (Boss)",
    tx: 84,
    ty: 42,
    spawnX: 84,
    spawnY: 40.4,
    defaultUnlocked: false,
  },
];

export const NPCS = [
  {
    id: "kael",
    name: "Master Kael",
    role: "Pandai Besi Cyber-Astral",
    spriteCol: 0,
    tx: 49,
    ty: 56.4,
    opensForge: true,
    lines: [
      "Yo Nza! Plasma Katana milikmu masih bisa ditempa lebih tajam dengan Aether Shard.",
      "Kumpulkan kristal dari Void-Hound, Rune-Golem, atau peti kuno lalu tempa di sini!",
    ],
  },
  {
    id: "lyra",
    name: "Pendeta Lyra",
    role: "Penjaga Segel Bintang",
    spriteCol: 1,
    tx: 55,
    ty: 53.5,
    healsPlayer: true,
    lines: [
      "Cahaya Astral memulihkan lukamu, Nza. Tiga Kuil Elemen menahan segel Benteng Gerhana di Timur Laut.",
      "Aktifkan Kuil Zamrud, Glasier, dan Magma untuk membuka gerbang menuju Malakor, Sang Penguasa Gerhana!",
    ],
  },
  {
    id: "renn",
    name: "Ranger Renn",
    role: "Pengintai Perbatasan",
    spriteCol: 2,
    tx: 47,
    ty: 62.2,
    lines: [
      "Tips lapangan: dinding batu retak bercahaya kuning bisa dihancurkan pakai Chrono-Bomb [L]!",
      "Tekan [M] kapan saja buat buka Peta Dunia dan Fast Travel antar Obelisk Astral.",
    ],
  },
  {
    id: "vex",
    name: "Alkemis Vex",
    role: "Peramu Nano-Potion",
    spriteCol: 3,
    tx: 61,
    ty: 55.6,
    opensForge: true,
    lines: [
      "Butuh Nano-Potion tambahan sebelum melawan Kolosus Kuil atau Malakor? Cek stok ramuanku!",
    ],
  },
];

function hash2d(x, y) {
  let n = Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1274126177, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

export function getRegionAt(tx, ty) {
  if (tx >= 42 && tx <= 67 && ty >= 47 && ty <= 68) {
    return { id: "sanctuary", name: "Nza Haven Sanctuary", theme: "sanctuary", color: "#38bdf8" };
  }
  if (tx >= 62 && ty <= 45) {
    return { id: "citadel", name: "Eclipse Citadel", theme: "citadel", color: "#c084fc" };
  }
  if (tx < 62 && ty <= 46) {
    return { id: "tundra", name: "Frostpeak Crystal Tundra", theme: "tundra", color: "#7dd3fc" };
  }
  if (tx >= 64 && ty > 46) {
    return { id: "badlands", name: "Scorched Magma Badlands", theme: "badlands", color: "#fb923c" };
  }
  return { id: "wilds", name: "Emerald Ruin Wilds", theme: "wilds", color: "#34d399" };
}

export function createWorldData(saved = null) {
  const tiles = new Uint8Array(WORLD_W * WORLD_H);
  const idx = (x, y) => y * WORLD_W + x;
  const setTile = (x, y, t) => {
    if (x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H) {
      tiles[idx(x, y)] = t;
    }
  };
  const fillRect = (x0, y0, w, h, t) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        setTile(x, y, t);
      }
    }
  };
  const strokeRect = (x0, y0, w, h, t) => {
    for (let x = x0; x < x0 + w; x++) {
      setTile(x, y0, t);
      setTile(x, y0 + h - 1, t);
    }
    for (let y = y0; y < y0 + h; y++) {
      setTile(x0, y, t);
      setTile(x0 + w - 1, y, t);
    }
  };

  for (let y = 0; y < WORLD_H; y++) {
    for (let x = 0; x < WORLD_W; x++) {
      const r = hash2d(x, y);
      const reg = getRegionAt(x, y).id;

      if (x <= 2 || x >= WORLD_W - 3 || y <= 2 || y >= WORLD_H - 3) {
        if (reg === "tundra") setTile(x, y, TILE.CRYSTAL_ROCK);
        else if (reg === "badlands") setTile(x, y, TILE.OBSIDIAN_WALL);
        else if (reg === "citadel") setTile(x, y, TILE.CITADEL_WALL);
        else setTile(x, y, TILE.CLIFF_ROCK);
        continue;
      }

      if (reg === "sanctuary") {
        setTile(x, y, r < 0.16 ? TILE.GRASS_FLOWER : TILE.GRASS);
      } else if (reg === "tundra") {
        if (r < 0.09) setTile(x, y, TILE.SNOW_TREE);
        else if (r < 0.13) setTile(x, y, TILE.CRYSTAL_ROCK);
        else setTile(x, y, TILE.SNOW);
      } else if (reg === "badlands") {
        if (r < 0.08) setTile(x, y, TILE.OBSIDIAN_WALL);
        else if (r < 0.24) setTile(x, y, TILE.MAGMA_CRACK);
        else setTile(x, y, TILE.ASH_GROUND);
      } else if (reg === "citadel") {
        if (r < 0.07) setTile(x, y, TILE.OBSIDIAN_WALL);
        else setTile(x, y, TILE.CITADEL_FLOOR);
      } else {
        if (r < 0.11) setTile(x, y, TILE.TREE);
        else if (r < 0.18) setTile(x, y, TILE.BUSH);
        else if (r < 0.32) setTile(x, y, TILE.GRASS_FLOWER);
        else setTile(x, y, TILE.GRASS);
      }
    }
  }

  for (let y = 47; y <= 106; y++) {
    const rx = 28 + Math.round(Math.sin(y * 0.14) * 2);
    setTile(rx - 2, y, TILE.SAND_BANK);
    setTile(rx - 1, y, TILE.WATER_0);
    setTile(rx, y, TILE.WATER_0);
    setTile(rx + 1, y, TILE.WATER_0);
    setTile(rx + 2, y, TILE.SAND_BANK);
  }

  for (let y = 49; y <= 105; y++) {
    const lx = 78 + Math.round(Math.cos(y * 0.15) * 2);
    setTile(lx - 1, y, TILE.LAVA_0);
    setTile(lx, y, TILE.LAVA_0);
    setTile(lx + 1, y, TILE.LAVA_0);
  }

  fillRect(13, 13, 16, 15, TILE.ICE);
  fillRect(16, 16, 9, 9, TILE.STONE_FLOOR);

  fillRect(44, 49, 22, 18, TILE.GRASS);
  fillRect(50, 52, 10, 12, TILE.STONE_FLOOR);
  fillRect(44, 57, 22, 3, TILE.DIRT_PATH);
  fillRect(54, 48, 3, 20, TILE.DIRT_PATH);

  const buildHouse = (hx, hy) => {
    fillRect(hx, hy, 5, 2, TILE.HOUSE_ROOF);
    fillRect(hx, hy + 2, 5, 2, TILE.HOUSE_WALL);
  };
  buildHouse(46, 51);
  buildHouse(60, 51);

  setTile(49, 55, TILE.FORGE_ANVIL);
  setTile(55, 56, TILE.HEAL_FOUNTAIN);
  setTile(52, 52, TILE.TORCH_BRAZIER);
  setTile(58, 52, TILE.TORCH_BRAZIER);
  setTile(62, 60, TILE.DUMMY_TARGET);
  setTile(62, 62, TILE.DUMMY_TARGET);
  setTile(46, 60, TILE.POT);
  setTile(47, 60, TILE.POT);
  setTile(46, 64, TILE.BUSH);
  setTile(47, 64, TILE.BUSH);
  setTile(48, 64, TILE.BUSH);

  for (let x = 20; x <= 55; x++) {
    for (let dy = -1; dy <= 1; dy++) {
      const t = tiles[idx(x, 58 + dy)];
      setTile(x, 58 + dy, t === TILE.WATER_0 ? TILE.BRIDGE : TILE.DIRT_PATH);
    }
  }
  for (let y = 58; y <= 70; y++) {
    setTile(20, y, TILE.DIRT_PATH);
    setTile(21, y, TILE.DIRT_PATH);
  }

  for (let y = 83; y <= 85; y++) {
    for (let x = 23; x <= 33; x++) {
      if (tiles[idx(x, y)] === TILE.WATER_0) setTile(x, y, TILE.BRIDGE);
      else setTile(x, y, TILE.DIRT_PATH);
    }
  }

  for (let y = 24; y <= 50; y++) {
    setTile(55, y, y < 46 ? TILE.SNOW : TILE.DIRT_PATH);
    setTile(56, y, y < 46 ? TILE.SNOW : TILE.DIRT_PATH);
  }
  for (let x = 25; x <= 56; x++) {
    setTile(x, 24, tiles[idx(x, 24)] === TILE.ICE ? TILE.ICE : TILE.DIRT_PATH);
    setTile(x, 25, tiles[idx(x, 25)] === TILE.ICE ? TILE.ICE : TILE.DIRT_PATH);
  }

  for (let x = 56; x <= 86; x++) {
    for (let dy = -1; dy <= 1; dy++) {
      const cur = tiles[idx(x, 58 + dy)];
      setTile(x, 58 + dy, cur === TILE.LAVA_0 ? TILE.BRIDGE : TILE.DIRT_PATH);
    }
  }
  for (let y = 58; y <= 83; y++) {
    setTile(85, y, TILE.DIRT_PATH);
    setTile(86, y, TILE.DIRT_PATH);
  }
  for (let y = 81; y <= 83; y++) {
    for (let x = 74; x <= 84; x++) {
      setTile(x, y, tiles[idx(x, y)] === TILE.LAVA_0 ? TILE.BRIDGE : TILE.DIRT_PATH);
    }
  }

  for (let x = 56; x <= 84; x++) {
    setTile(x, 42, TILE.STONE_FLOOR);
    setTile(x, 43, TILE.STONE_FLOOR);
  }

  fillRect(14, 64, 10, 9, TILE.STONE_FLOOR);
  strokeRect(14, 64, 10, 9, TILE.RUIN_WALL);
  fillRect(18, 72, 5, 1, TILE.STONE_FLOOR);
  fillRect(23, 68, 1, 4, TILE.STONE_FLOOR);
  setTile(16, 66, TILE.TORCH_BRAZIER);
  setTile(21, 66, TILE.TORCH_BRAZIER);

  fillRect(86, 78, 9, 9, TILE.STONE_FLOOR);
  strokeRect(86, 78, 9, 9, TILE.OBSIDIAN_WALL);
  fillRect(86, 81, 1, 3, TILE.STONE_FLOOR);
  setTile(88, 80, TILE.TORCH_BRAZIER);
  setTile(92, 80, TILE.TORCH_BRAZIER);

  strokeRect(14, 90, 7, 6, TILE.RUIN_WALL);
  fillRect(15, 91, 5, 4, TILE.STONE_FLOOR);
  setTile(17, 90, TILE.CRACKED_WALL);
  fillRect(16, 87, 3, 3, TILE.GRASS);

  strokeRect(35, 9, 7, 6, TILE.CRYSTAL_ROCK);
  fillRect(36, 10, 5, 4, TILE.STONE_FLOOR);
  setTile(38, 14, TILE.CRACKED_WALL);
  fillRect(37, 15, 3, 4, TILE.SNOW);

  strokeRect(94, 59, 7, 6, TILE.OBSIDIAN_WALL);
  fillRect(95, 60, 5, 4, TILE.STONE_FLOOR);
  setTile(94, 62, TILE.CRACKED_WALL);
  fillRect(90, 61, 4, 3, TILE.ASH_GROUND);

  fillRect(70, 7, 29, 30, TILE.CITADEL_FLOOR);
  strokeRect(70, 7, 29, 30, TILE.CITADEL_WALL);
  fillRect(79, 37, 11, 8, TILE.CITADEL_FLOOR);
  fillRect(82, 36, 5, 1, TILE.SEAL_GATE);
  fillRect(83, 12, 3, 24, TILE.CITADEL_CARPET);
  for (const py of [13, 19, 25, 31]) {
    setTile(75, py, TILE.TORCH_BRAZIER);
    setTile(93, py, TILE.TORCH_BRAZIER);
  }

  const activatedShrines = new Set(saved?.shrines || []);
  for (const sh of SHRINES) {
    setTile(sh.tx, sh.ty, activatedShrines.has(sh.id) ? TILE.SHRINE_ON : TILE.SHRINE_OFF);
  }
  if (activatedShrines.size >= 3 || saved?.gateOpen) {
    fillRect(82, 36, 5, 1, TILE.CITADEL_CARPET);
  }

  const unlockedWarps = new Set(saved?.warps || ["warp_sanctuary"]);
  for (const wp of WARP_POINTS) {
    if (wp.defaultUnlocked) unlockedWarps.add(wp.id);
    for (let dy = -1; dy <= 2; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cur = tiles[idx(wp.tx + dx, wp.ty + dy)];
        if (SOLID_TILES.has(cur) && cur !== TILE.SEAL_GATE) {
          setTile(wp.tx + dx, wp.ty + dy, TILE.STONE_FLOOR);
        }
      }
    }
    setTile(wp.tx, wp.ty, unlockedWarps.has(wp.id) ? TILE.WARP_ON : TILE.WARP_OFF);
  }

  const signs = [
    {
      tx: 53,
      ty: 60,
      title: "Papan Petunjuk Nza Haven",
      text: "Barat Daya: Reruntuhan Zamrud | Barat Laut: Puncak Glasier | Tenggara: Lembah Magma | Timur Laut: Benteng Gerhana.",
    },
    {
      tx: 81,
      ty: 39,
      title: "Prasasti Gerbang Gerhana",
      text: "Tiga Kuil Elemen harus menyala agar Segel Gerhana terbuka. (Atau buka Peta [M] untuk Teleport Penguji langsung ke Sanctum!)",
    },
  ];
  for (const s of signs) {
    setTile(s.tx, s.ty, TILE.SIGNPOST);
  }

  const chests = [
    { id: "chest_wilds_ruin", tx: 10, ty: 56, shards: 45, potion: 1, heartRelic: false, label: "45 Aether Shard + 1 Nano-Potion" },
    { id: "chest_wilds_vault", tx: 17, ty: 92, shards: 75, potion: 1, heartRelic: true, label: "Inti Hati Astral (+1 Max Heart) & 75 Shard!" },
    { id: "chest_tundra_lake", tx: 14, ty: 15, shards: 55, potion: 1, heartRelic: false, label: "55 Aether Shard + 1 Nano-Potion" },
    { id: "chest_tundra_vault", tx: 38, ty: 11, shards: 85, potion: 1, heartRelic: true, label: "Inti Hati Glasier (+1 Max Heart) & 85 Shard!" },
    { id: "chest_badlands_ridge", tx: 96, ty: 90, shards: 65, potion: 1, heartRelic: false, label: "65 Aether Shard + 1 Nano-Potion" },
    { id: "chest_badlands_vault", tx: 97, ty: 61, shards: 95, potion: 2, heartRelic: true, label: "Inti Hati Magma (+1 Max Heart) & 95 Shard!" },
    { id: "chest_citadel_west", tx: 73, ty: 10, shards: 110, potion: 2, heartRelic: false, label: "110 Aether Shard + 2 Nano-Potion" },
  ];
  const openedChests = new Set(saved?.chests || []);
  for (const ch of chests) {
    fillRect(ch.tx - 1, ch.ty - 1, 3, 3, getRegionAt(ch.tx, ch.ty).id === "tundra" ? TILE.SNOW : TILE.STONE_FLOOR);
    setTile(ch.tx, ch.ty, openedChests.has(ch.id) ? TILE.CHEST_OPEN : TILE.CHEST_CLOSED);
  }

  const mobSpawns = [
    { type: "void_hound", tx: 36, ty: 55 },
    { type: "void_hound", tx: 33, ty: 64 },
    { type: "void_hound", tx: 24, ty: 61 },
    { type: "rune_golem", tx: 26, ty: 74 },
    { type: "void_hound", tx: 14, ty: 78 },
    { type: "rune_golem", tx: 32, ty: 88 },
    { type: "void_hound", tx: 19, ty: 85 },
    { type: "rune_golem", tx: 11, ty: 62 },

    { type: "cryo_wraith", tx: 44, ty: 26 },
    { type: "cryo_wraith", tx: 35, ty: 22 },
    { type: "rune_golem", tx: 31, ty: 31 },
    { type: "cryo_wraith", tx: 16, ty: 30 },
    { type: "rune_golem", tx: 12, ty: 22 },
    { type: "cryo_wraith", tx: 27, ty: 14 },
    { type: "abyss_knight", tx: 38, ty: 18 },

    { type: "void_hound", tx: 71, ty: 56 },
    { type: "pyro_djinn", tx: 74, ty: 68 },
    { type: "pyro_djinn", tx: 88, ty: 64 },
    { type: "rune_golem", tx: 92, ty: 72 },
    { type: "pyro_djinn", tx: 82, ty: 90 },
    { type: "abyss_knight", tx: 94, ty: 84 },
    { type: "pyro_djinn", tx: 72, ty: 86 },

    { type: "abyss_knight", tx: 76, ty: 41 },
    { type: "abyss_knight", tx: 90, ty: 41 },
    { type: "abyss_knight", tx: 78, ty: 28 },
    { type: "abyss_knight", tx: 90, ty: 28 },
  ];

  for (const m of mobSpawns) {
    if (SOLID_TILES.has(tiles[idx(m.tx, m.ty)])) {
      const reg = getRegionAt(m.tx, m.ty).id;
      setTile(m.tx, m.ty, reg === "tundra" ? TILE.SNOW : reg === "badlands" ? TILE.ASH_GROUND : TILE.GRASS);
    }
  }

  const guardians = SHRINES.filter((s) => !activatedShrines.has(s.id)).map((s) => ({
    id: `guardian_${s.id}`,
    shrineId: s.id,
    name: s.guardianName,
    tx: s.tx + 2,
    ty: s.ty + 2,
  }));

  return {
    tiles,
    signs,
    chests,
    mobSpawns,
    guardians,
    activatedShrines,
    unlockedWarps,
    openedChests,
  };
}
