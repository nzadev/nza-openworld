import {
  TILE_SIZE,
  WORLD_W,
  WORLD_H,
  TILE,
  SOLID_TILES,
  SHRINES,
  WARP_POINTS,
  NPCS,
  getRegionAt,
  createWorldData,
} from "./world.js";

const SAVE_KEY = "nza_openworld_save_v1";

const MOB_STATS = {
  void_hound: { name: "Void-Hound", row: 0, hp: 34, speed: 92, dmg: 1, shards: 12, aggro: 185 },
  rune_golem: { name: "Crystal Rune-Golem", row: 1, hp: 68, speed: 48, dmg: 2, shards: 22, aggro: 170 },
  cryo_wraith: { name: "Cryo-Wraith", row: 2, hp: 46, speed: 64, dmg: 2, shards: 18, aggro: 220, ranged: "frost" },
  pyro_djinn: { name: "Pyro-Djinn", row: 3, hp: 54, speed: 58, dmg: 2, shards: 20, aggro: 230, ranged: "magma" },
  abyss_knight: { name: "Abyssal Knight", row: 4, hp: 82, speed: 74, dmg: 3, shards: 28, aggro: 205, ranged: "void" },
};

const DIR_VECS = {
  down: { x: 0, y: 1, row: 0 },
  up: { x: 0, y: -1, row: 1 },
  left: { x: -1, y: 0, row: 2 },
  right: { x: 1, y: 0, row: 3 },
};

export class OpenWorldEngine {
  constructor({ canvas, minimapCanvas, assets, sound, callbacks }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.minimapCanvas = minimapCanvas;
    this.minimapCtx = minimapCanvas ? minimapCanvas.getContext("2d") : null;

    this.assets = assets;
    this.sound = sound;
    this.cb = callbacks || {};

    this.viewW = canvas.width;
    this.viewH = canvas.height;

    this.keys = new Set();
    this.touchVec = { x: 0, y: 0 };
    this.running = false;
    this.paused = false;
    this.time = 0;
    this.lastTs = 0;
    this.minimapTimer = 0;

    this.shakeTime = 0;
    this.shakeMag = 0;
    this.currentRegionId = "";
    this.nearbyAction = null;

    this.initNewOrSaved(false);
  }

  hasSaveData() {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY));
    } catch {
      return false;
    }
  }

  loadRawSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveProgress() {
    try {
      const payload = {
        x: this.player.x,
        y: this.player.y,
        maxHp: this.player.maxHp,
        hp: this.player.hp,
        maxStamina: this.player.maxStamina,
        shards: this.player.shards,
        potions: this.player.potions,
        bladeLevel: this.player.bladeLevel,
        kills: this.player.kills,
        shrines: Array.from(this.world.activatedShrines),
        warps: Array.from(this.world.unlockedWarps),
        chests: Array.from(this.world.openedChests),
        gateOpen: this.gateOpen,
        bossDefeated: this.bossDefeated,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in private browsing
    }
  }

  initNewOrSaved(useSave = false) {
    const saved = useSave ? this.loadRawSave() : null;
    if (!useSave) {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        // Ignore storage errors
      }
    }

    this.world = createWorldData(saved);
    this.gateOpen = Boolean(saved?.gateOpen || this.world.activatedShrines.size >= 3);
    this.bossDefeated = Boolean(saved?.bossDefeated);

    this.player = {
      x: saved?.x ?? 55 * TILE_SIZE + 16,
      y: saved?.y ?? 58.5 * TILE_SIZE,
      vx: 0,
      vy: 0,
      dir: "down",
      speed: 142,
      maxHp: saved?.maxHp ?? 10,
      hp: saved?.hp ?? 10,
      maxStamina: saved?.maxStamina ?? 100,
      stamina: saved?.maxStamina ?? 100,
      shards: saved?.shards ?? 25,
      potions: saved?.potions ?? 2,
      bladeLevel: saved?.bladeLevel ?? 1,
      kills: saved?.kills ?? 0,
      attackTimer: 0,
      attackCooldown: 0,
      comboStep: 0,
      comboWindow: 0,
      spinTimer: 0,
      bowTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      bombCooldown: 0,
      invuln: 0,
      walkCycle: 0,
    };

    if (this.isSolidAtPixel(this.player.x, this.player.y)) {
      this.player.x = 55 * TILE_SIZE + 16;
      this.player.y = 58.5 * TILE_SIZE;
    }

    this.mobs = this.world.mobSpawns.map((sp, i) => this.createMob(sp.type, sp.tx, sp.ty, `mob_${i}`));
    this.guardians = this.world.guardians.map((g) => ({
      id: g.id,
      kind: "guardian",
      shrineId: g.shrineId,
      name: g.name,
      x: g.tx * TILE_SIZE + 16,
      y: g.ty * TILE_SIZE + 16,
      homeX: g.tx * TILE_SIZE + 16,
      homeY: g.ty * TILE_SIZE + 16,
      hp: 190,
      maxHp: 190,
      speed: 56,
      dmg: 2,
      shards: 65,
      aggro: 240,
      radius: 20,
      stateTimer: 1.2,
      shotTimer: 2.0,
      hurtTimer: 0,
      frame: 0,
    }));

    this.boss = this.bossDefeated
      ? null
      : {
          id: "malakor",
          kind: "malakor",
          name: "Malakor, Sang Penguasa Gerhana",
          x: 84 * TILE_SIZE + 16,
          y: 18 * TILE_SIZE + 16,
          homeX: 84 * TILE_SIZE + 16,
          homeY: 18 * TILE_SIZE + 16,
          hp: 440,
          maxHp: 440,
          speed: 78,
          dmg: 3,
          radius: 24,
          phase: 1,
          actionTimer: 1.8,
          dashVec: null,
          hurtTimer: 0,
          frame: 0,
          engaged: false,
        };

    this.projectiles = [];
    this.bombs = [];
    this.drops = [];
    this.slashes = [];
    this.particles = [];
    this.floatTexts = [];
    this.afterimages = [];

    this.camera = {
      x: this.player.x - this.viewW / 2,
      y: this.player.y - this.viewH / 2,
    };
    this.clampCamera();
    this.buildStaticMinimapBase();
    this.currentRegionId = "";
    this.checkRegionTransition(true);
    this.emitHud();
  }

  createMob(type, tx, ty, id) {
    const cfg = MOB_STATS[type];
    const px = tx * TILE_SIZE + 16;
    const py = ty * TILE_SIZE + 16;
    return {
      id,
      kind: "mob",
      type,
      name: cfg.name,
      row: cfg.row,
      x: px,
      y: py,
      homeX: px,
      homeY: py,
      vx: 0,
      vy: 0,
      hp: cfg.hp,
      maxHp: cfg.hp,
      speed: cfg.speed,
      dmg: cfg.dmg,
      shards: cfg.shards,
      aggro: cfg.aggro,
      ranged: cfg.ranged || null,
      radius: 12,
      aiTimer: Math.random() * 1.5,
      atkCooldown: 0.8 + Math.random(),
      pounceTimer: 0,
      hurtTimer: 0,
      respawnTimer: 0,
      dead: false,
      anim: Math.random() * 10,
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const step = (ts) => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
      this.lastTs = ts;
      if (!this.paused) {
        this.update(dt);
      }
      this.render();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  setPaused(flag) {
    this.paused = Boolean(flag);
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= WORLD_W || ty < 0 || ty >= WORLD_H) return TILE.CLIFF_ROCK;
    return this.world.tiles[ty * WORLD_W + tx];
  }

  setTile(tx, ty, tileId) {
    if (tx < 0 || tx >= WORLD_W || ty < 0 || ty >= WORLD_H) return;
    this.world.tiles[ty * WORLD_W + tx] = tileId;
  }

  isSolidAtPixel(px, py, radius = 9) {
    const pts = [
      [px - radius, py - radius],
      [px + radius, py - radius],
      [px - radius, py + radius],
      [px + radius, py + radius],
    ];
    for (const [cx, cy] of pts) {
      const tx = Math.floor(cx / TILE_SIZE);
      const ty = Math.floor(cy / TILE_SIZE);
      const t = this.getTile(tx, ty);
      if (SOLID_TILES.has(t)) return true;
    }
    return false;
  }

  moveEntityWithSlide(ent, dx, dy, radius = 9) {
    if (dx !== 0) {
      if (!this.isSolidAtPixel(ent.x + dx, ent.y, radius)) {
        ent.x += dx;
      } else {
        const nudge = 1.4;
        if (!this.isSolidAtPixel(ent.x + dx, ent.y - 6, radius)) ent.y -= nudge;
        else if (!this.isSolidAtPixel(ent.x + dx, ent.y + 6, radius)) ent.y += nudge;
      }
    }
    if (dy !== 0) {
      if (!this.isSolidAtPixel(ent.x, ent.y + dy, radius)) {
        ent.y += dy;
      } else {
        const nudge = 1.4;
        if (!this.isSolidAtPixel(ent.x - 6, ent.y + dy, radius)) ent.x -= nudge;
        else if (!this.isSolidAtPixel(ent.x + 6, ent.y + dy, radius)) ent.x += nudge;
      }
    }
  }

  getBladeDamage() {
    return 10 + (this.player.bladeLevel - 1) * 6;
  }

  getUpgradeCosts() {
    return {
      blade: this.player.bladeLevel >= 5 ? null : 50 * this.player.bladeLevel,
      heart: this.player.maxHp >= 24 ? null : 70 + Math.floor((this.player.maxHp - 10) / 2) * 35,
      stamina: this.player.maxStamina >= 200 ? null : 55 + Math.floor((this.player.maxStamina - 100) / 25) * 30,
      potion: this.player.potions >= 9 ? null : 30,
    };
  }

  buyUpgrade(type) {
    const costs = this.getUpgradeCosts();
    const cost = costs[type];
    if (cost === null || cost === undefined) {
      return { ok: false, msg: "Level upgrade ini sudah maksimal!" };
    }
    if (this.player.shards < cost) {
      return { ok: false, msg: `Aether Shard belum cukup! Butuh ${cost} Shard.` };
    }
    this.player.shards -= cost;
    if (type === "blade") {
      this.player.bladeLevel += 1;
    } else if (type === "heart") {
      this.player.maxHp += 2;
      this.player.hp = this.player.maxHp;
    } else if (type === "stamina") {
      this.player.maxStamina += 25;
      this.player.stamina = this.player.maxStamina;
    } else if (type === "potion") {
      this.player.potions += 1;
    }
    this.sound.upgrade();
    this.spawnBurst(this.player.x, this.player.y, "#00f2ff", 16);
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: "Tempa Astral berhasil ditingkatkan!" };
  }

  triggerSlash() {
    if (this.paused || this.player.attackCooldown > 0) return;
    this.sound.unlock();

    if (this.player.comboWindow > 0) {
      this.player.comboStep = (this.player.comboStep + 1) % 3;
    } else {
      this.player.comboStep = 0;
    }

    const isFinisher = this.player.comboStep === 2;
    this.player.attackTimer = 0.18;
    this.player.attackCooldown = isFinisher ? 0.28 : 0.19;
    this.player.comboWindow = 0.55;
    this.sound.slash(this.player.comboStep);

    const dv = DIR_VECS[this.player.dir];
    const reach = isFinisher ? 30 : 25;
    const sx = this.player.x + dv.x * reach;
    const sy = this.player.y + dv.y * reach;

    this.moveEntityWithSlide(this.player, dv.x * 5, dv.y * 5, 9);

    this.slashes.push({
      x: sx,
      y: sy,
      dir: this.player.dir,
      spin: false,
      timer: 0.16,
      maxTimer: 0.16,
      scale: isFinisher ? 1.25 : 1.0,
    });

    const dmg = Math.round(this.getBladeDamage() * (isFinisher ? 1.45 : 1 + this.player.comboStep * 0.15));
    this.applyMeleeHitbox(sx, sy, isFinisher ? 30 : 24, dmg);
    this.cutPropsNear(sx, sy, 24);
  }

  triggerSpinSlash() {
    if (this.paused || this.player.spinTimer > 0 || this.player.stamina < 26) return;
    this.sound.unlock();
    this.player.stamina -= 26;
    this.player.spinTimer = 0.28;
    this.player.attackTimer = 0.26;
    this.sound.spinSlash();

    this.slashes.push({
      x: this.player.x,
      y: this.player.y,
      dir: "down",
      spin: true,
      timer: 0.28,
      maxTimer: 0.28,
      scale: 1.55,
    });

    const dmg = Math.round(this.getBladeDamage() * 1.65);
    this.applyMeleeHitbox(this.player.x, this.player.y, 44, dmg);
    this.cutPropsNear(this.player.x, this.player.y, 42);
    this.shake(0.14, 3);
    this.emitHud();
  }

  triggerBow() {
    if (this.paused || this.player.bowTimer > 0 || this.player.stamina < 15) return;
    this.sound.unlock();
    this.player.stamina -= 15;
    this.player.bowTimer = 0.24;
    this.sound.bowShot();

    const dv = DIR_VECS[this.player.dir];
    this.projectiles.push({
      fromPlayer: true,
      kind: "arrow",
      x: this.player.x + dv.x * 14,
      y: this.player.y + dv.y * 14,
      vx: dv.x * 320,
      vy: dv.y * 320,
      dmg: Math.round(this.getBladeDamage() * 0.9),
      life: 1.15,
      radius: 6,
    });
    this.emitHud();
  }

  triggerBomb() {
    if (this.paused || this.player.bombCooldown > 0 || this.player.stamina < 22) return;
    this.sound.unlock();
    this.player.stamina -= 22;
    this.player.bombCooldown = 1.6;
    this.sound.bombPlant();

    const dv = DIR_VECS[this.player.dir];
    this.bombs.push({
      x: this.player.x + dv.x * 16,
      y: this.player.y + dv.y * 16,
      timer: 1.35,
      maxTimer: 1.35,
    });
    this.emitHud();
  }

  triggerDash() {
    if (this.paused || this.player.dashCooldown > 0 || this.player.stamina < 20) return;
    this.sound.unlock();
    this.player.stamina -= 20;
    this.player.dashTimer = 0.18;
    this.player.dashCooldown = 0.52;
    this.player.invuln = Math.max(this.player.invuln, 0.24);
    this.sound.dash();
    this.emitHud();
  }

  triggerPotion() {
    if (this.paused) return;
    if (this.player.potions <= 0) {
      this.pushFloatText(this.player.x, this.player.y - 18, "Potion Habis!", "#fda4af");
      return;
    }
    if (this.player.hp >= this.player.maxHp) {
      this.pushFloatText(this.player.x, this.player.y - 18, "HP Penuh", "#67e8f9");
      return;
    }
    this.sound.unlock();
    this.player.potions -= 1;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 8);
    this.sound.heal();
    this.spawnBurst(this.player.x, this.player.y, "#34d399", 14);
    this.pushFloatText(this.player.x, this.player.y - 20, "+4 Hati", "#4ade80");
    this.emitHud();
  }

  triggerInteract() {
    if (this.paused || !this.nearbyAction) return;
    this.sound.unlock();
    const act = this.nearbyAction;

    if (act.kind === "npc") {
      if (act.npc.healsPlayer) {
        this.player.hp = this.player.maxHp;
        this.player.stamina = this.player.maxStamina;
        this.sound.heal();
        this.spawnBurst(this.player.x, this.player.y, "#38bdf8", 16);
      }
      this.cb.onDialogue?.(act.npc);
      this.emitHud();
      return;
    }

    if (act.kind === "forge") {
      this.cb.onOpenForge?.();
      return;
    }

    if (act.kind === "fountain") {
      this.player.hp = this.player.maxHp;
      this.player.stamina = this.player.maxStamina;
      this.sound.heal();
      this.spawnBurst(this.player.x, this.player.y, "#22d3ee", 20);
      this.pushFloatText(this.player.x, this.player.y - 22, "HP & Stamina Pulih!", "#67e8f9");
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (act.kind === "sign") {
      this.cb.onDialogue?.({
        name: act.sign.title,
        role: "Prasasti Wilayah",
        lines: [act.sign.text],
      });
      return;
    }

    if (act.kind === "chest") {
      const ch = act.chest;
      this.world.openedChests.add(ch.id);
      this.setTile(ch.tx, ch.ty, TILE.CHEST_OPEN);
      this.player.shards += ch.shards;
      this.player.potions = Math.min(9, this.player.potions + ch.potion);
      if (ch.heartRelic) {
        this.player.maxHp += 2;
        this.player.hp = this.player.maxHp;
      }
      this.sound.chestOpen();
      this.spawnBurst(ch.tx * TILE_SIZE + 16, ch.ty * TILE_SIZE + 16, "#facc15", 22);
      this.cb.onToast?.(`Peti Terbuka: ${ch.label}`);
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (act.kind === "warp") {
      const wp = act.warp;
      const wasNew = !this.world.unlockedWarps.has(wp.id);
      this.world.unlockedWarps.add(wp.id);
      this.setTile(wp.tx, wp.ty, TILE.WARP_ON);
      if (wasNew) {
        this.sound.shrineActivate();
        this.spawnBurst(wp.tx * TILE_SIZE + 16, wp.ty * TILE_SIZE + 16, "#38bdf8", 20);
        this.cb.onToast?.(`Obelisk Aktif: ${wp.name}`);
        this.saveProgress();
      }
      this.cb.onOpenMap?.();
      this.emitHud();
      return;
    }

    if (act.kind === "shrine") {
      const sh = act.shrine;
      const guardAlive = this.guardians.some((g) => g.shrineId === sh.id && g.hp > 0);
      if (guardAlive) {
        this.cb.onToast?.(`Kalahkan ${sh.guardianName} terlebih dahulu untuk menyalakan Kuil!`);
        return;
      }
      this.world.activatedShrines.add(sh.id);
      this.setTile(sh.tx, sh.ty, TILE.SHRINE_ON);
      this.player.shards += 80;
      this.player.maxHp += 2;
      this.player.hp = this.player.maxHp;
      this.sound.shrineActivate();
      this.shake(0.35, 5);
      this.spawnBurst(sh.tx * TILE_SIZE + 16, sh.ty * TILE_SIZE + 16, "#00f2ff", 32);

      if (this.world.activatedShrines.size >= 3 && !this.gateOpen) {
        this.unlockCitadelGate();
        this.cb.onToast?.(`${sh.name} Aktif! Ketiga Segel Terbuka — Gerbang Benteng Gerhana Terbuka!`);
      } else {
        this.cb.onToast?.(`${sh.name} Aktif! (+80 Shard & +1 Max Hati) [${this.world.activatedShrines.size}/3 Segel]`);
      }
      this.buildStaticMinimapBase();
      this.saveProgress();
      this.emitHud();
    }
  }

  unlockCitadelGate() {
    this.gateOpen = true;
    for (let x = 82; x <= 86; x++) {
      this.setTile(x, 36, TILE.CITADEL_CARPET);
    }
  }

  warpTo(warpId, forceEvaluatorUnlock = false) {
    if (warpId === "evaluator_boss_sanctum") {
      this.unlockCitadelGate();
      this.world.unlockedWarps.add("warp_citadel");
      this.setTile(84, 42, TILE.WARP_ON);
      this.player.x = 84 * TILE_SIZE + 16;
      this.player.y = 31 * TILE_SIZE + 16;
      this.sound.warp();
      this.spawnBurst(this.player.x, this.player.y, "#c084fc", 26);
      this.checkRegionTransition(true);
      this.saveProgress();
      this.emitHud();
      return true;
    }

    const wp = WARP_POINTS.find((w) => w.id === warpId);
    if (!wp) return false;
    if (!this.world.unlockedWarps.has(wp.id) && !forceEvaluatorUnlock) {
      return false;
    }
    this.world.unlockedWarps.add(wp.id);
    this.setTile(wp.tx, wp.ty, TILE.WARP_ON);
    this.player.x = wp.spawnX * TILE_SIZE + 16;
    this.player.y = wp.spawnY * TILE_SIZE;
    this.sound.warp();
    this.spawnBurst(this.player.x, this.player.y, "#00f2ff", 24);
    this.checkRegionTransition(true);
    this.saveProgress();
    this.emitHud();
    return true;
  }

  applyMeleeHitbox(hx, hy, radius, dmg) {
    const checkTarget = (t) => {
      if (!t || t.dead || t.hp <= 0) return;
      const dist = Math.hypot(t.x - hx, t.y - hy);
      if (dist <= radius + (t.radius || 12)) {
        this.damageEnemy(t, dmg, hx, hy);
      }
    };

    for (const m of this.mobs) checkTarget(m);
    for (const g of this.guardians) checkTarget(g);
    if (this.boss) checkTarget(this.boss);

    const tx0 = Math.floor((hx - radius) / TILE_SIZE);
    const tx1 = Math.floor((hx + radius) / TILE_SIZE);
    const ty0 = Math.floor((hy - radius) / TILE_SIZE);
    const ty1 = Math.floor((hy + radius) / TILE_SIZE);
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (this.getTile(tx, ty) === TILE.DUMMY_TARGET) {
          const cx = tx * TILE_SIZE + 16;
          const cy = ty * TILE_SIZE + 16;
          this.sound.hitEnemy();
          this.spawnBurst(cx, cy, "#facc15", 8);
          this.pushFloatText(cx, cy - 14, `${dmg}`, "#fde047");
        }
      }
    }
  }

  cutPropsNear(cx, cy, radius) {
    const tx0 = Math.floor((cx - radius) / TILE_SIZE);
    const tx1 = Math.floor((cx + radius) / TILE_SIZE);
    const ty0 = Math.floor((cy - radius) / TILE_SIZE);
    const ty1 = Math.floor((cy + radius) / TILE_SIZE);

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = this.getTile(tx, ty);
        if (t === TILE.BUSH || t === TILE.POT) {
          const reg = getRegionAt(tx, ty).id;
          this.setTile(tx, ty, reg === "sanctuary" && t === TILE.POT ? TILE.GRASS : TILE.GRASS);
          this.sound.bushCut();
          const px = tx * TILE_SIZE + 16;
          const py = ty * TILE_SIZE + 16;
          this.spawnBurst(px, py, t === TILE.BUSH ? "#34d399" : "#fb923c", 8);
          if (Math.random() < (t === TILE.POT ? 0.85 : 0.48)) {
            const dropKind = Math.random() < 0.25 ? "heart" : "shard";
            this.drops.push({
              kind: dropKind,
              val: dropKind === "shard" ? (t === TILE.POT ? 8 : 4) : 2,
              x: px,
              y: py,
              life: 16,
            });
          }
        }
      }
    }
  }

  damageEnemy(enemy, amount, srcX, srcY) {
    enemy.hp -= amount;
    enemy.hurtTimer = 0.16;
    this.sound.hitEnemy();
    this.spawnBurst(enemy.x, enemy.y, "#00f2ff", 10);
    this.pushFloatText(enemy.x, enemy.y - 18, `${amount}`, "#67e8f9");

    const ang = Math.atan2(enemy.y - srcY, enemy.x - srcX);
    const kb = enemy.kind === "malakor" ? 6 : enemy.kind === "guardian" ? 10 : 18;
    this.moveEntityWithSlide(enemy, Math.cos(ang) * kb, Math.sin(ang) * kb, enemy.radius || 12);

    if (enemy.hp <= 0) {
      this.handleEnemyDefeat(enemy);
    } else if (enemy.kind === "malakor" && enemy.phase === 1 && enemy.hp <= enemy.maxHp * 0.5) {
      enemy.phase = 2;
      this.sound.bossRoar();
      this.shake(0.4, 6);
      this.spawnBurst(enemy.x, enemy.y, "#f43f5e", 30);
      this.cb.onToast?.("Malakor memasuki Fase 2: ECLIPSE OVERDRIVE!");
    }
  }

  handleEnemyDefeat(enemy) {
    this.player.kills += 1;
    this.spawnBurst(enemy.x, enemy.y, "#e879f9", 20);
    this.shake(0.15, 3);

    if (enemy.kind === "mob") {
      enemy.dead = true;
      enemy.respawnTimer = 28;
      this.drops.push({ kind: "shard", val: enemy.shards, x: enemy.x, y: enemy.y, life: 20 });
      if (Math.random() < 0.35) {
        this.drops.push({ kind: "heart", val: 2, x: enemy.x + 10, y: enemy.y, life: 20 });
      }
    } else if (enemy.kind === "guardian") {
      this.guardians = this.guardians.filter((g) => g.id !== enemy.id);
      this.drops.push({ kind: "shard", val: enemy.shards, x: enemy.x, y: enemy.y, life: 30 });
      this.drops.push({ kind: "heart", val: 4, x: enemy.x + 14, y: enemy.y, life: 30 });
      this.cb.onToast?.(`${enemy.name} tumbang! Dekati Altar Kuil dan tekan [F] untuk menyalakannya!`);
      this.saveProgress();
    } else if (enemy.kind === "malakor") {
      this.boss = null;
      this.bossDefeated = true;
      this.player.shards += 250;
      this.sound.victory();
      this.sound.setTheme("victory");
      this.shake(0.6, 8);
      this.spawnBurst(enemy.x, enemy.y, "#facc15", 45);
      this.saveProgress();
      this.cb.onVictory?.({
        shards: this.player.shards,
        kills: this.player.kills,
        bladeLevel: this.player.bladeLevel,
        shrines: this.world.activatedShrines.size,
      });
    }
    this.emitHud();
  }

  hurtPlayer(dmg, srcX, srcY) {
    if (this.player.invuln > 0 || this.paused) return;
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.player.invuln = 0.85;
    this.sound.playerHurt();
    this.shake(0.22, 5);
    this.spawnBurst(this.player.x, this.player.y, "#fb7185", 14);
    this.pushFloatText(this.player.x, this.player.y - 18, `-${dmg}`, "#fb7185");

    const ang = Math.atan2(this.player.y - srcY, this.player.x - srcX);
    this.moveEntityWithSlide(this.player, Math.cos(ang) * 16, Math.sin(ang) * 16, 9);

    if (this.player.hp <= 0) {
      this.player.hp = this.player.maxHp;
      this.player.stamina = this.player.maxStamina;
      this.player.x = 55 * TILE_SIZE + 16;
      this.player.y = 58.5 * TILE_SIZE;
      if (this.boss) {
        this.boss.hp = this.boss.maxHp;
        this.boss.phase = 1;
        this.boss.engaged = false;
        this.boss.x = this.boss.homeX;
        this.boss.y = this.boss.homeY;
      }
      this.projectiles = [];
      this.cb.onToast?.("Cahaya Astral memulihkanmu kembali di Nza Haven Sanctuary!");
      this.checkRegionTransition(true);
      this.saveProgress();
    }
    this.emitHud();
  }

  shake(duration, mag) {
    this.shakeTime = Math.max(this.shakeTime, duration);
    this.shakeMag = Math.max(this.shakeMag, mag);
  }

  spawnBurst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 95;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 2 + Math.floor(Math.random() * 2),
        life: 0.25 + Math.random() * 0.35,
        maxLife: 0.6,
      });
    }
  }

  pushFloatText(x, y, text, color = "#ffffff") {
    this.floatTexts.push({ x, y, text, color, life: 0.75 });
  }

  pollGamepadVector() {
    if (!navigator.getGamepads) return { x: 0, y: 0 };
    const pads = navigator.getGamepads();
    const gp = pads && pads[0];
    if (!gp) return { x: 0, y: 0 };
    const ax = Math.abs(gp.axes[0] || 0) > 0.22 ? gp.axes[0] : 0;
    const ay = Math.abs(gp.axes[1] || 0) > 0.22 ? gp.axes[1] : 0;
    if (gp.buttons[0]?.pressed) this.triggerSlash();
    if (gp.buttons[1]?.pressed) this.triggerDash();
    if (gp.buttons[2]?.pressed) this.triggerBow();
    if (gp.buttons[3]?.pressed) this.triggerSpinSlash();
    return { x: ax, y: ay };
  }

  update(dt) {
    this.time += dt;
    const p = this.player;

    p.attackTimer = Math.max(0, p.attackTimer - dt);
    p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    p.comboWindow = Math.max(0, p.comboWindow - dt);
    p.spinTimer = Math.max(0, p.spinTimer - dt);
    p.bowTimer = Math.max(0, p.bowTimer - dt);
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.bombCooldown = Math.max(0, p.bombCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    this.shakeTime = Math.max(0, this.shakeTime - dt);

    if (p.stamina < p.maxStamina && p.dashTimer <= 0 && p.spinTimer <= 0) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 26 * dt);
    }

    let ix = 0;
    let iy = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) ix -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) ix += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) iy -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) iy += 1;

    if (Math.hypot(this.touchVec.x, this.touchVec.y) > 0.1) {
      ix = this.touchVec.x;
      iy = this.touchVec.y;
    } else {
      const gpv = this.pollGamepadVector();
      if (Math.hypot(gpv.x, gpv.y) > 0.1) {
        ix = gpv.x;
        iy = gpv.y;
      }
    }

    const mag = Math.hypot(ix, iy);
    if (mag > 0.01) {
      ix /= mag;
      iy /= mag;
      if (p.attackTimer <= 0) {
        if (Math.abs(ix) > Math.abs(iy)) {
          p.dir = ix < 0 ? "left" : "right";
        } else {
          p.dir = iy < 0 ? "up" : "down";
        }
      }
      p.walkCycle += dt * 9;
    } else {
      p.walkCycle = 0;
    }

    const standingTile = this.getTile(Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE));
    const iceMult = standingTile === TILE.ICE ? 1.24 : 1.0;

    if (p.dashTimer > 0) {
      const dv = mag > 0.05 ? { x: ix, y: iy } : DIR_VECS[p.dir];
      this.moveEntityWithSlide(p, dv.x * 340 * dt, dv.y * 340 * dt, 9);
      this.afterimages.push({ x: p.x, y: p.y, dir: p.dir, life: 0.16 });
    } else if (mag > 0.01) {
      const moveSpd = p.speed * iceMult * (p.attackTimer > 0 ? 0.45 : 1);
      this.moveEntityWithSlide(p, ix * moveSpd * dt, iy * moveSpd * dt, 9);
    }

    this.updateBombs(dt);
    this.updateProjectiles(dt);
    this.updateMobs(dt);
    this.updateGuardians(dt);
    this.updateBoss(dt);
    this.updateDrops(dt);
    this.updateEffects(dt);
    this.updateNearbyInteract();
    this.checkRegionTransition(false);

    const targetCamX = p.x - this.viewW / 2;
    const targetCamY = p.y - this.viewH / 2;
    this.camera.x += (targetCamX - this.camera.x) * Math.min(1, dt * 10);
    this.camera.y += (targetCamY - this.camera.y) * Math.min(1, dt * 10);
    this.clampCamera();

    this.minimapTimer += dt;
    if (this.minimapTimer >= 0.12) {
      this.minimapTimer = 0;
      this.renderMinimap();
      this.emitHud();
    }
  }

  clampCamera() {
    const maxCamX = WORLD_W * TILE_SIZE - this.viewW;
    const maxCamY = WORLD_H * TILE_SIZE - this.viewH;
    this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));
  }

  updateBombs(dt) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.timer -= dt;
      if (b.timer <= 0) {
        this.bombs.splice(i, 1);
        this.sound.explosion();
        this.shake(0.28, 6);
        this.spawnBurst(b.x, b.y, "#fb923c", 24);
        this.spawnBurst(b.x, b.y, "#00f2ff", 14);
        this.slashes.push({
          x: b.x,
          y: b.y,
          dir: "down",
          explosion: true,
          timer: 0.26,
          maxTimer: 0.26,
          scale: 1.9,
        });

        const blastDmg = Math.round(this.getBladeDamage() * 2.5);
        this.applyMeleeHitbox(b.x, b.y, 54, blastDmg);
        this.cutPropsNear(b.x, b.y, 52);

        const tx0 = Math.floor((b.x - 54) / TILE_SIZE);
        const tx1 = Math.floor((b.x + 54) / TILE_SIZE);
        const ty0 = Math.floor((b.y - 54) / TILE_SIZE);
        const ty1 = Math.floor((b.y + 54) / TILE_SIZE);
        for (let ty = ty0; ty <= ty1; ty++) {
          for (let tx = tx0; tx <= tx1; tx++) {
            if (this.getTile(tx, ty) === TILE.CRACKED_WALL) {
              this.setTile(tx, ty, TILE.STONE_FLOOR);
              this.spawnBurst(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, "#facc15", 20);
              this.cb.onToast?.("Dinding Rahasia Hancur! Jalan Terbuka!");
            }
          }
        }
      }
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;

      const t = this.getTile(Math.floor(pr.x / TILE_SIZE), Math.floor(pr.y / TILE_SIZE));
      const blocked =
        SOLID_TILES.has(t) &&
        t !== TILE.WATER_0 &&
        t !== TILE.WATER_1 &&
        t !== TILE.LAVA_0 &&
        t !== TILE.LAVA_1;

      if (pr.life <= 0 || blocked) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.fromPlayer) {
        let hit = false;
        const targets = [...this.mobs, ...this.guardians, ...(this.boss ? [this.boss] : [])];
        for (const en of targets) {
          if (en.dead || en.hp <= 0) continue;
          if (Math.hypot(en.x - pr.x, en.y - pr.y) <= (en.radius || 12) + pr.radius) {
            this.damageEnemy(en, pr.dmg, pr.x, pr.y);
            hit = true;
            break;
          }
        }
        if (hit) this.projectiles.splice(i, 1);
      } else if (Math.hypot(this.player.x - pr.x, this.player.y - pr.y) <= 10 + pr.radius) {
        this.hurtPlayer(pr.dmg, pr.x, pr.y);
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateMobs(dt) {
    const p = this.player;
    for (const m of this.mobs) {
      if (m.dead) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0 && Math.hypot(p.x - m.homeX, p.y - m.homeY) > 260) {
          m.dead = false;
          m.hp = m.maxHp;
          m.x = m.homeX;
          m.y = m.homeY;
        }
        continue;
      }

      m.hurtTimer = Math.max(0, m.hurtTimer - dt);
      m.atkCooldown = Math.max(0, m.atkCooldown - dt);
      m.pounceTimer = Math.max(0, m.pounceTimer - dt);
      m.anim += dt * 6;

      const dx = p.x - m.x;
      const dy = p.y - m.y;
      const dist = Math.hypot(dx, dy);

      if (dist < m.aggro && getRegionAt(Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE)).id !== "sanctuary") {
        const nx = dx / Math.max(1, dist);
        const ny = dy / Math.max(1, dist);

        if (m.type === "void_hound" && dist < 115 && m.atkCooldown <= 0) {
          m.pounceTimer = 0.26;
          m.atkCooldown = 1.65;
          m.vx = nx * 215;
          m.vy = ny * 215;
        }

        if (m.pounceTimer > 0) {
          this.moveEntityWithSlide(m, m.vx * dt, m.vy * dt, 10);
        } else if (m.ranged) {
          if (dist > 110) {
            this.moveEntityWithSlide(m, nx * m.speed * dt, ny * m.speed * dt, 10);
          } else if (dist < 72) {
            this.moveEntityWithSlide(m, -nx * m.speed * 0.7 * dt, -ny * m.speed * 0.7 * dt, 10);
          }
          if (m.atkCooldown <= 0) {
            m.atkCooldown = m.ranged === "magma" ? 2.1 : 1.75;
            const baseAng = Math.atan2(dy, dx);
            const angles = m.ranged === "magma" ? [baseAng - 0.24, baseAng, baseAng + 0.24] : [baseAng];
            for (const a of angles) {
              this.projectiles.push({
                fromPlayer: false,
                kind: m.ranged,
                x: m.x,
                y: m.y,
                vx: Math.cos(a) * 165,
                vy: Math.sin(a) * 165,
                dmg: m.dmg,
                life: 2.0,
                radius: 6,
              });
            }
          }
        } else {
          this.moveEntityWithSlide(m, nx * m.speed * dt, ny * m.speed * dt, 10);
        }

        if (dist < 19) {
          this.hurtPlayer(m.dmg, m.x, m.y);
        }
      } else {
        m.aiTimer -= dt;
        if (m.aiTimer <= 0) {
          m.aiTimer = 1.2 + Math.random() * 1.6;
          const homeDist = Math.hypot(m.homeX - m.x, m.homeY - m.y);
          if (homeDist > 72) {
            const ang = Math.atan2(m.homeY - m.y, m.homeX - m.x);
            m.vx = Math.cos(ang) * m.speed * 0.55;
            m.vy = Math.sin(ang) * m.speed * 0.55;
          } else if (Math.random() < 0.5) {
            m.vx = 0;
            m.vy = 0;
          } else {
            const ang = Math.random() * Math.PI * 2;
            m.vx = Math.cos(ang) * m.speed * 0.45;
            m.vy = Math.sin(ang) * m.speed * 0.45;
          }
        }
        this.moveEntityWithSlide(m, m.vx * dt, m.vy * dt, 10);
      }
    }
  }

  updateGuardians(dt) {
    const p = this.player;
    for (const g of this.guardians) {
      g.hurtTimer = Math.max(0, g.hurtTimer - dt);
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= g.aggro) {
        const nx = dx / Math.max(1, dist);
        const ny = dy / Math.max(1, dist);
        this.moveEntityWithSlide(g, nx * g.speed * dt, ny * g.speed * dt, 16);
        g.frame = Math.floor(this.time * 4) % 2;

        g.shotTimer -= dt;
        if (g.shotTimer <= 0) {
          g.shotTimer = 2.2;
          g.frame = 2;
          for (let k = 0; k < 6; k++) {
            const ang = (Math.PI * 2 * k) / 6 + this.time * 0.5;
            this.projectiles.push({
              fromPlayer: false,
              kind: "frost",
              x: g.x,
              y: g.y,
              vx: Math.cos(ang) * 145,
              vy: Math.sin(ang) * 145,
              dmg: g.dmg,
              life: 2.2,
              radius: 7,
            });
          }
        }
        if (dist < 26) {
          this.hurtPlayer(g.dmg, g.x, g.y);
        }
      }
    }
  }

  updateBoss(dt) {
    const b = this.boss;
    if (!b) return;
    b.hurtTimer = Math.max(0, b.hurtTimer - dt);

    const p = this.player;
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const dist = Math.hypot(dx, dy);

    const inArena = p.x >= 70 * TILE_SIZE && p.x <= 99 * TILE_SIZE && p.y >= 7 * TILE_SIZE && p.y <= 36 * TILE_SIZE;
    if (!inArena && !b.engaged) return;

    if (!b.engaged && dist < 340) {
      b.engaged = true;
      this.sound.bossRoar();
      this.sound.setTheme("boss");
      this.cb.onToast?.("BOSS DUNIA: Malakor, Sang Penguasa Gerhana!");
    }

    if (!b.engaged) return;

    b.actionTimer -= dt;
    if (b.dashVec) {
      this.moveEntityWithSlide(b, b.dashVec.x * dt, b.dashVec.y * dt, 20);
      b.dashVec.t -= dt;
      if (b.dashVec.t <= 0) b.dashVec = null;
    } else if (dist > 85) {
      const spd = b.phase === 2 ? b.speed * 1.32 : b.speed;
      this.moveEntityWithSlide(b, (dx / dist) * spd * dt, (dy / dist) * spd * dt, 20);
    }

    if (b.actionTimer <= 0) {
      b.actionTimer = b.phase === 2 ? 1.35 : 1.95;
      const baseAng = Math.atan2(dy, dx);
      if (Math.random() < 0.55) {
        const count = b.phase === 2 ? 8 : 5;
        for (let i = 0; i < count; i++) {
          const spread = b.phase === 2 ? (Math.PI * 2 * i) / count + this.time : baseAng + (i - 2) * 0.22;
          this.projectiles.push({
            fromPlayer: false,
            kind: "void",
            x: b.x,
            y: b.y,
            vx: Math.cos(spread) * (b.phase === 2 ? 195 : 170),
            vy: Math.sin(spread) * (b.phase === 2 ? 195 : 170),
            dmg: b.dmg,
            life: 2.6,
            radius: 7,
          });
        }
      } else {
        b.dashVec = {
          x: Math.cos(baseAng) * (b.phase === 2 ? 275 : 230),
          y: Math.sin(baseAng) * (b.phase === 2 ? 275 : 230),
          t: 0.34,
        };
      }
    }

    if (dist < 30) {
      this.hurtPlayer(b.dmg, b.x, b.y);
    }
  }

  updateDrops(dt) {
    const p = this.player;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.life -= dt;
      if (d.life <= 0) {
        this.drops.splice(i, 1);
        continue;
      }
      const dist = Math.hypot(p.x - d.x, p.y - d.y);
      if (dist < 56) {
        d.x += ((p.x - d.x) / Math.max(1, dist)) * 150 * dt;
        d.y += ((p.y - d.y) / Math.max(1, dist)) * 150 * dt;
      }
      if (dist < 16) {
        if (d.kind === "shard") {
          p.shards += d.val;
          this.sound.pickupShard();
          this.pushFloatText(p.x, p.y - 16, `+${d.val} Shard`, "#38bdf8");
        } else {
          p.hp = Math.min(p.maxHp, p.hp + d.val);
          this.sound.pickupHeart();
          this.pushFloatText(p.x, p.y - 16, "+Hati", "#fb7185");
        }
        this.drops.splice(i, 1);
        this.emitHud();
      }
    }
  }

  updateEffects(dt) {
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      this.slashes[i].timer -= dt;
      if (this.slashes[i].timer <= 0) this.slashes.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.y -= 22 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatTexts.splice(i, 1);
    }
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].life -= dt;
      if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
    }
  }

  updateNearbyInteract() {
    const px = this.player.x;
    const py = this.player.y;
    this.nearbyAction = null;

    for (const npc of NPCS) {
      const nx = npc.tx * TILE_SIZE + 16;
      const ny = npc.ty * TILE_SIZE + 16;
      if (Math.hypot(px - nx, py - ny) < 42) {
        this.nearbyAction = { kind: "npc", label: `[F] Bicara: ${npc.name}`, npc, x: nx, y: ny - 22 };
        return;
      }
    }

    if (Math.hypot(px - (49 * TILE_SIZE + 16), py - (55 * TILE_SIZE + 16)) < 44) {
      this.nearbyAction = { kind: "forge", label: "[F] Tempa Senjata & Upgrade", x: 49 * TILE_SIZE + 16, y: 55 * TILE_SIZE - 8 };
      return;
    }

    if (Math.hypot(px - (55 * TILE_SIZE + 16), py - (56 * TILE_SIZE + 16)) < 44) {
      this.nearbyAction = { kind: "fountain", label: "[F] Mata Air Astral (Pulihkan HP)", x: 55 * TILE_SIZE + 16, y: 56 * TILE_SIZE - 8 };
      return;
    }

    for (const ch of this.world.chests) {
      if (this.world.openedChests.has(ch.id)) continue;
      const cx = ch.tx * TILE_SIZE + 16;
      const cy = ch.ty * TILE_SIZE + 16;
      if (Math.hypot(px - cx, py - cy) < 42) {
        this.nearbyAction = { kind: "chest", label: "[F] Buka Peti Kuno", chest: ch, x: cx, y: cy - 18 };
        return;
      }
    }

    for (const sh of SHRINES) {
      if (this.world.activatedShrines.has(sh.id)) continue;
      const sx = sh.tx * TILE_SIZE + 16;
      const sy = sh.ty * TILE_SIZE + 16;
      if (Math.hypot(px - sx, py - sy) < 48) {
        this.nearbyAction = { kind: "shrine", label: `[F] Aktifkan ${sh.name}`, shrine: sh, x: sx, y: sy - 20 };
        return;
      }
    }

    for (const wp of WARP_POINTS) {
      const wx = wp.tx * TILE_SIZE + 16;
      const wy = wp.ty * TILE_SIZE + 16;
      if (Math.hypot(px - wx, py - wy) < 44) {
        this.nearbyAction = {
          kind: "warp",
          label: this.world.unlockedWarps.has(wp.id) ? "[F] Peta Fast Travel" : `[F] Aktifkan Obelisk ${wp.name}`,
          warp: wp,
          x: wx,
          y: wy - 20,
        };
        return;
      }
    }

    for (const s of this.world.signs) {
      const sx = s.tx * TILE_SIZE + 16;
      const sy = s.ty * TILE_SIZE + 16;
      if (Math.hypot(px - sx, py - sy) < 42) {
        this.nearbyAction = { kind: "sign", label: "[F] Baca Prasasti", sign: s, x: sx, y: sy - 18 };
        return;
      }
    }
  }

  checkRegionTransition(silent = false) {
    const reg = getRegionAt(Math.floor(this.player.x / TILE_SIZE), Math.floor(this.player.y / TILE_SIZE));
    if (reg.id !== this.currentRegionId) {
      this.currentRegionId = reg.id;
      if (!this.boss?.engaged && !this.bossDefeated) {
        this.sound.setTheme(reg.theme);
      }
      if (!silent) {
        this.cb.onRegionChange?.(reg);
      }
    }
  }

  getActiveBossBanner() {
    if (this.boss && this.boss.engaged) {
      return { name: this.boss.name, hp: this.boss.hp, maxHp: this.boss.maxHp, phase: this.boss.phase };
    }
    for (const g of this.guardians) {
      if (Math.hypot(this.player.x - g.x, this.player.y - g.y) <= g.aggro) {
        return { name: g.name, hp: g.hp, maxHp: g.maxHp, phase: 1 };
      }
    }
    return null;
  }

  emitHud() {
    const reg = getRegionAt(Math.floor(this.player.x / TILE_SIZE), Math.floor(this.player.y / TILE_SIZE));
    this.cb.onHudUpdate?.({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      stamina: this.player.stamina,
      maxStamina: this.player.maxStamina,
      shards: this.player.shards,
      potions: this.player.potions,
      bladeLevel: this.player.bladeLevel,
      shrinesDone: this.world.activatedShrines.size,
      gateOpen: this.gateOpen,
      bossDefeated: this.bossDefeated,
      regionName: reg.name,
      regionColor: reg.color,
      bossBanner: this.getActiveBossBanner(),
      nearbyLabel: this.nearbyAction?.label || "",
      unlockedWarps: Array.from(this.world.unlockedWarps),
      activatedShrines: Array.from(this.world.activatedShrines),
    });
  }

  buildStaticMinimapBase() {
    const off = document.createElement("canvas");
    off.width = WORLD_W;
    off.height = WORLD_H;
    const octx = off.getContext("2d");
    const img = octx.createImageData(WORLD_W, WORLD_H);

    const colorFor = (t) => {
      switch (t) {
        case TILE.WATER_0:
        case TILE.WATER_1:
          return [20, 130, 190];
        case TILE.LAVA_0:
        case TILE.LAVA_1:
          return [235, 72, 24];
        case TILE.SNOW:
          return [214, 232, 248];
        case TILE.ICE:
          return [125, 211, 252];
        case TILE.SNOW_TREE:
        case TILE.CRYSTAL_ROCK:
          return [56, 132, 168];
        case TILE.ASH_GROUND:
        case TILE.MAGMA_CRACK:
          return [74, 54, 60];
        case TILE.OBSIDIAN_WALL:
        case TILE.CITADEL_WALL:
          return [32, 22, 48];
        case TILE.CITADEL_FLOOR:
          return [58, 42, 96];
        case TILE.CITADEL_CARPET:
          return [190, 36, 92];
        case TILE.DIRT_PATH:
        case TILE.BRIDGE:
          return [176, 142, 98];
        case TILE.STONE_FLOOR:
          return [122, 134, 154];
        case TILE.TREE:
          return [24, 92, 54];
        default:
          return [48, 138, 80];
      }
    };

    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const [r, g, b] = colorFor(this.getTile(x, y));
        const p = (y * WORLD_W + x) * 4;
        img.data[p] = r;
        img.data[p + 1] = g;
        img.data[p + 2] = b;
        img.data[p + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    this.minimapBase = off;
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.minimapBase) return;
    const mc = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    mc.imageSmoothingEnabled = false;
    mc.clearRect(0, 0, w, h);
    mc.drawImage(this.minimapBase, 0, 0, w, h);

    const sx = w / WORLD_W;
    const sy = h / WORLD_H;

    for (const sh of SHRINES) {
      mc.fillStyle = this.world.activatedShrines.has(sh.id) ? "#00f2ff" : "#facc15";
      mc.fillRect(sh.tx * sx - 2, sh.ty * sy - 2, 4, 4);
    }

    if (!this.bossDefeated) {
      mc.fillStyle = "#f43f5e";
      mc.fillRect(84 * sx - 2.5, 18 * sy - 2.5, 5, 5);
    }

    const px = (this.player.x / TILE_SIZE) * sx;
    const py = (this.player.y / TILE_SIZE) * sy;
    mc.fillStyle = "#ffffff";
    mc.beginPath();
    mc.arc(px, py, 3, 0, Math.PI * 2);
    mc.fill();
    mc.strokeStyle = "#00f2ff";
    mc.lineWidth = 1.5;
    mc.stroke();
  }

  drawTileSprite(tileId, destX, destY) {
    let tid = tileId;
    const animWave = Math.floor(this.time * 2.6) % 2 === 1;
    if (tid === TILE.WATER_0 && animWave) tid = TILE.WATER_1;
    if (tid === TILE.LAVA_0 && animWave) tid = TILE.LAVA_1;

    const sx = (tid % 8) * 32;
    const sy = Math.floor(tid / 8) * 32;
    this.ctx.drawImage(this.assets.tiles, sx, sy, 32, 32, destX, destY, 32, 32);
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    let camX = Math.round(this.camera.x);
    let camY = Math.round(this.camera.y);
    if (this.shakeTime > 0) {
      camX += Math.round((Math.random() * 2 - 1) * this.shakeMag);
      camY += Math.round((Math.random() * 2 - 1) * this.shakeMag);
    }

    const startTx = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const endTx = Math.min(WORLD_W - 1, Math.ceil((camX + this.viewW) / TILE_SIZE) + 1);
    const startTy = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
    const endTy = Math.min(WORLD_H - 1, Math.ceil((camY + this.viewH) / TILE_SIZE) + 1);

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        this.drawTileSprite(this.getTile(tx, ty), tx * TILE_SIZE - camX, ty * TILE_SIZE - camY);
      }
    }

    for (const d of this.drops) {
      const bob = Math.sin(this.time * 6 + d.x) * 2.5;
      const col = d.kind === "heart" ? 3 : 4;
      ctx.drawImage(this.assets.fx, col * 32, 32, 32, 32, Math.round(d.x - 12 - camX), Math.round(d.y - 12 + bob - camY), 24, 24);
    }

    for (const b of this.bombs) {
      const pulse = 1 + Math.sin(this.time * 18) * 0.12;
      const sz = Math.round(28 * pulse);
      ctx.drawImage(this.assets.fx, 6 * 32, 0, 32, 32, Math.round(b.x - sz / 2 - camX), Math.round(b.y - sz / 2 - camY), sz, sz);
    }

    for (const npc of NPCS) {
      const nx = Math.round(npc.tx * TILE_SIZE - camX);
      const ny = Math.round(npc.ty * TILE_SIZE - camY);
      ctx.drawImage(this.assets.mobs, npc.spriteCol * 32, 5 * 32, 32, 32, nx, ny, 32, 32);

      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(8, 12, 26, 0.78)";
      ctx.fillRect(nx + 16 - 34, ny - 11, 68, 11);
      ctx.fillStyle = "#67e8f9";
      ctx.fillText(npc.name, nx + 16, ny - 3);
    }

    for (const m of this.mobs) {
      if (m.dead) continue;
      if (m.x < camX - 48 || m.x > camX + this.viewW + 48 || m.y < camY - 48 || m.y > camY + this.viewH + 48) continue;

      const col = m.pounceTimer > 0 ? 3 : Math.floor(m.anim) % 3;
      ctx.save();
      if (m.hurtTimer > 0) ctx.filter = "brightness(2.4)";
      ctx.drawImage(this.assets.mobs, col * 32, m.row * 32, 32, 32, Math.round(m.x - 16 - camX), Math.round(m.y - 16 - camY), 32, 32);
      ctx.restore();

      if (m.hp < m.maxHp) {
        const bw = 26;
        const bx = Math.round(m.x - bw / 2 - camX);
        const by = Math.round(m.y - 22 - camY);
        ctx.fillStyle = "rgba(10, 12, 24, 0.85)";
        ctx.fillRect(bx, by, bw, 4);
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(bx, by, Math.max(2, Math.round((m.hp / m.maxHp) * bw)), 4);
      }
    }

    for (const g of this.guardians) {
      ctx.save();
      if (g.hurtTimer > 0) ctx.filter = "brightness(2.4)";
      ctx.drawImage(this.assets.boss, g.frame * 64, 64, 64, 64, Math.round(g.x - 32 - camX), Math.round(g.y - 36 - camY), 64, 64);
      ctx.restore();
    }

    if (this.boss) {
      const b = this.boss;
      const bCol = b.phase === 2 ? 3 : b.dashVec ? 2 : Math.floor(this.time * 4) % 2;
      ctx.save();
      if (b.hurtTimer > 0) ctx.filter = "brightness(2.4)";
      ctx.drawImage(this.assets.boss, bCol * 64, 0, 64, 64, Math.round(b.x - 32 - camX), Math.round(b.y - 38 - camY), 64, 64);
      ctx.restore();
    }

    for (const ai of this.afterimages) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ai.life * 3.2);
      const row = DIR_VECS[ai.dir].row;
      ctx.drawImage(this.assets.hero, 4 * 32, row * 32, 32, 32, Math.round(ai.x - 16 - camX), Math.round(ai.y - 18 - camY), 32, 32);
      ctx.restore();
    }

    this.renderPlayer(camX, camY);

    for (const sl of this.slashes) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sl.timer / sl.maxTimer);
      let fxCol = 0;
      if (sl.explosion) fxCol = 7;
      else if (sl.spin) fxCol = 4;
      else if (sl.dir === "up") fxCol = 1;
      else if (sl.dir === "left") fxCol = 2;
      else if (sl.dir === "right") fxCol = 3;

      const sz = Math.round(32 * sl.scale);
      ctx.drawImage(this.assets.fx, fxCol * 32, 0, 32, 32, Math.round(sl.x - sz / 2 - camX), Math.round(sl.y - sz / 2 - camY), sz, sz);
      ctx.restore();
    }

    for (const pr of this.projectiles) {
      const sx = Math.round(pr.x - camX);
      const sy = Math.round(pr.y - camY);
      if (pr.kind === "arrow") {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.atan2(pr.vy, pr.vx));
        ctx.drawImage(this.assets.fx, 5 * 32, 0, 32, 32, -14, -14, 28, 28);
        ctx.restore();
      } else {
        const orbCol = pr.kind === "frost" ? 1 : pr.kind === "magma" ? 2 : 0;
        ctx.drawImage(this.assets.fx, orbCol * 32, 32, 32, 32, sx - 12, sy - 12, 24, 24);
      }
    }

    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y - camY), pt.size, pt.size);
    }

    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    for (const ft of this.floatTexts) {
      ctx.fillStyle = "#090d16";
      ctx.fillText(ft.text, Math.round(ft.x - camX) + 1, Math.round(ft.y - camY) + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x - camX), Math.round(ft.y - camY));
    }

    if (this.nearbyAction) {
      const ax = Math.round(this.nearbyAction.x - camX);
      const ay = Math.round(this.nearbyAction.y - camY);
      ctx.font = "bold 10px sans-serif";
      const tw = ctx.measureText(this.nearbyAction.label).width + 14;
      ctx.fillStyle = "rgba(8, 15, 32, 0.88)";
      ctx.fillRect(ax - tw / 2, ay - 12, tw, 17);
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1;
      ctx.strokeRect(ax - tw / 2, ay - 12, tw, 17);
      ctx.fillStyle = "#ecfeff";
      ctx.fillText(this.nearbyAction.label, ax, ay);
    }

    ctx.restore();
  }

  renderPlayer(camX, camY) {
    const p = this.player;
    if (p.invuln > 0 && Math.floor(this.time * 20) % 2 === 0) return;

    const row = DIR_VECS[p.dir].row;
    let col = 0;
    if (p.dashTimer > 0) col = 4;
    else if (p.attackTimer > 0) col = 3;
    else if (p.bowTimer > 0) col = 5;
    else if (p.walkCycle > 0) col = (Math.floor(p.walkCycle) % 2) + 1;

    const dx = Math.round(p.x - 16 - camX);
    const dy = Math.round(p.y - 18 - camY);

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    this.ctx.beginPath();
    this.ctx.ellipse(dx + 16, dy + 27, 8, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.drawImage(this.assets.hero, col * 32, row * 32, 32, 32, dx, dy, 32, 32);
  }
}
