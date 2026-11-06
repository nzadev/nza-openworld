import { loadGameAssets } from "./assets.js";
import { SoundEngine } from "./audio.js";
import { OpenWorldEngine } from "./engine.js";
import { WARP_POINTS, SHRINES, WORLD_W, WORLD_H, TILE_SIZE } from "./world.js";

const $ = (id) => document.getElementById(id);

async function boot() {
  const sound = new SoundEngine();
  const loadFill = $("loadProgressFill");
  const loadText = $("loadStatusText");
  const btnStartNew = $("btnStartNew");
  const btnContinue = $("btnContinueSave");
  const btnQuickRealm = $("btnQuickRealm");

  let assets;
  try {
    assets = await loadGameAssets((ratio) => {
      const pct = Math.round(ratio * 100);
      if (loadFill) loadFill.style.width = `${pct}%`;
      if (loadText) loadText.textContent = `Memuat dunia 16-bit & karakter Nza... ${pct}%`;
    });
  } catch (err) {
    if (loadText) loadText.textContent = err.message;
    return;
  }

  if (loadText) loadText.textContent = "Siap dimainkan — Tanpa login, langsung pakai!";
  btnStartNew.disabled = false;
  btnQuickRealm.disabled = false;

  let toastTimer = null;
  const showToast = (msg) => {
    const el = $("toastBanner");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 3400);
  };

  let engine = null;

  const closeAllModals = () => {
    $("dialogueModal").classList.add("hidden");
    $("forgeModal").classList.add("hidden");
    $("mapModal").classList.add("hidden");
    $("victoryModal").classList.add("hidden");
    if (engine && $("titleModal").classList.contains("hidden")) {
      engine.setPaused(false);
    }
  };

  const openDialogue = (npc) => {
    if (!engine) return;
    engine.setPaused(true);
    $("dlgName").textContent = npc.name;
    $("dlgRole").textContent = npc.role || "Penduduk Astral";
    $("dlgBody").innerHTML = (npc.lines || []).map((l) => `<p>${l}</p>`).join("");
    const forgeBtn = $("btnDlgOpenForge");
    if (npc.opensForge) {
      forgeBtn.classList.remove("hidden");
    } else {
      forgeBtn.classList.add("hidden");
    }
    $("dialogueModal").classList.remove("hidden");
  };

  const renderForgeUI = () => {
    if (!engine) return;
    const costs = engine.getUpgradeCosts();
    const p = engine.player;
    $("forgeShardBalance").textContent = `${p.shards} Shard`;

    const items = [
      {
        key: "blade",
        title: `Plasma Katana Nza (Lv.${p.bladeLevel})`,
        desc: `Damage tebasan & Sword Beam naik (${engine.getBladeDamage()} -> ${engine.getBladeDamage() + 6})`,
        cost: costs.blade,
      },
      {
        key: "heart",
        title: `Inti Hati Astral (${p.maxHp / 2} Hati)`,
        desc: "Tambah +1 Kapasitas Hati Maksimum & pulihkan seluruh HP",
        cost: costs.heart,
      },
      {
        key: "stamina",
        title: `Cyber-Core Stamina (${p.maxStamina})`,
        desc: "Tambah +25 Stamina untuk Spin Slash, Chakram, Perisai, Panah & Bom",
        cost: costs.stamina,
      },
      {
        key: "potion",
        title: `Nano-Potion (${p.potions}/9)`,
        desc: "Pulihkan +4 Hati secara instan saat bertarung [Tombol H]",
        cost: costs.potion,
      },
    ];

    const list = $("forgeItemsList");
    list.innerHTML = "";
    for (const it of items) {
      const card = document.createElement("div");
      card.className = "forge-card";
      const canBuy = it.cost !== null && p.shards >= it.cost;
      card.innerHTML = `
        <div class="forge-info">
          <strong>${it.title}</strong>
          <span>${it.desc}</span>
        </div>
        <button class="btn-upgrade" ${!canBuy ? "disabled" : ""} data-up="${it.key}">
          ${it.cost === null ? "MAX" : `${it.cost} Shard`}
        </button>
      `;
      card.querySelector("button").addEventListener("click", () => {
        const res = engine.buyUpgrade(it.key);
        $("forgeFeedback").textContent = res.msg;
        renderForgeUI();
      });
      list.appendChild(card);
    }
  };

  const openForge = () => {
    if (!engine) return;
    closeAllModals();
    engine.setPaused(true);
    $("forgeFeedback").textContent = "Pilih peningkatan perlengkapan Cyber-Ronin Nza:";
    renderForgeUI();
    $("forgeModal").classList.remove("hidden");
  };

  const openWorldMap = () => {
    if (!engine) return;
    closeAllModals();
    engine.setPaused(true);

    const big = $("worldMapLargeCanvas");
    const bctx = big.getContext("2d");
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, big.width, big.height);
    if (engine.minimapBase) {
      bctx.drawImage(engine.minimapBase, 0, 0, big.width, big.height);
    }

    const sx = big.width / WORLD_W;
    const sy = big.height / WORLD_H;

    for (const sh of SHRINES) {
      const active = engine.world.activatedShrines.has(sh.id);
      bctx.fillStyle = active ? "#00f2ff" : "#facc15";
      bctx.beginPath();
      bctx.arc(sh.tx * sx, sh.ty * sy, 5, 0, Math.PI * 2);
      bctx.fill();
      bctx.strokeStyle = "#090d16";
      bctx.lineWidth = 1.5;
      bctx.stroke();
    }

    if (!engine.bossDefeated) {
      bctx.fillStyle = "#f43f5e";
      bctx.beginPath();
      bctx.arc(84 * sx, 18 * sy, 6, 0, Math.PI * 2);
      bctx.fill();
    }

    const px = (engine.player.x / TILE_SIZE) * sx;
    const py = (engine.player.y / TILE_SIZE) * sy;
    bctx.fillStyle = "#ffffff";
    bctx.beginPath();
    bctx.arc(px, py, 5, 0, Math.PI * 2);
    bctx.fill();
    bctx.strokeStyle = "#00f2ff";
    bctx.lineWidth = 2;
    bctx.stroke();

    const evalMode = $("chkEvalFastTravel").checked;
    const wList = $("warpList");
    wList.innerHTML = "";

    for (const wp of WARP_POINTS) {
      const unlocked = engine.world.unlockedWarps.has(wp.id) || evalMode;
      const row = document.createElement("div");
      row.className = "warp-item";
      row.innerHTML = `
        <div>
          <strong>${wp.name}</strong>
          <small>${wp.subtitle}</small>
        </div>
        <button class="btn-warp" ${!unlocked ? "disabled" : ""}>
          ${unlocked ? "Teleport" : "Terkunci"}
        </button>
      `;
      row.querySelector("button").addEventListener("click", () => {
        if (engine.warpTo(wp.id, evalMode)) {
          closeAllModals();
          showToast(`Fast Travel -> ${wp.name}`);
        }
      });
      wList.appendChild(row);
    }

    if (evalMode) {
      const bossRow = document.createElement("div");
      bossRow.className = "warp-item boss-warp";
      bossRow.innerHTML = `
        <div>
          <strong>Sanctum Boss Malakor (Langsung Buka Segel)</strong>
          <small>Pintasan Uji Coba Langsung ke Arena Boss Terakhir</small>
        </div>
        <button class="btn-warp">Teleport Boss</button>
      `;
      bossRow.querySelector("button").addEventListener("click", () => {
        engine.warpTo("evaluator_boss_sanctum", true);
        closeAllModals();
        showToast("Mode Uji Cepat: Langsung masuk Sanctum Malakor!");
      });
      wList.appendChild(bossRow);
    }

    $("mapModal").classList.remove("hidden");
  };

  $("chkEvalFastTravel").addEventListener("change", () => {
    if (!$("mapModal").classList.contains("hidden")) {
      openWorldMap();
    }
  });

  const updateHud = (st) => {
    const heartsEl = $("heartsRow");
    const totalHearts = Math.ceil(st.maxHp / 2);
    let hHtml = "";
    for (let i = 0; i < totalHearts; i++) {
      const rem = st.hp - i * 2;
      const cls = rem >= 2 ? "heart full" : rem === 1 ? "heart half" : "heart empty";
      hHtml += `<span class="${cls}" aria-hidden="true"></span>`;
    }
    heartsEl.innerHTML = hHtml;

    $("staminaFill").style.width = `${Math.round((st.stamina / st.maxStamina) * 100)}%`;
    $("shardCount").textContent = st.shards;
    $("potionCount").textContent = st.potions;
    $("bladeLv").textContent = `Lv.${st.bladeLevel}`;

    const regBadge = $("regionBadge");
    regBadge.textContent = st.regionName;
    regBadge.style.borderColor = st.regionColor;
    regBadge.style.color = st.regionColor;

    const qt = $("questTracker");
    if (st.bossDefeated) {
      qt.textContent = "Misi Tuntas: Malakor Dikalahkan! (Free-Roam Open World)";
    } else if (st.gateOpen) {
      qt.textContent = "Segel Terbuka! Masuki Eclipse Citadel (Timur Laut) & kalahkan Malakor!";
    } else {
      qt.textContent = `Segel Kuil Astral: ${st.shrinesDone}/3 Aktif — Peta [M]`;
    }

    const bossHud = $("bossHud");
    if (st.bossBanner) {
      bossHud.classList.remove("hidden");
      $("bossNameText").textContent =
        st.bossBanner.phase === 2 ? `${st.bossBanner.name} [OVERDRIVE]` : st.bossBanner.name;
      $("bossHpFill").style.width = `${Math.max(0, Math.round((st.bossBanner.hp / st.bossBanner.maxHp) * 100))}%`;
    } else {
      bossHud.classList.add("hidden");
    }

    const actBtn = $("btnTouchInteract");
    if (actBtn) {
      actBtn.classList.toggle("glow", Boolean(st.nearbyLabel));
    }
  };

  engine = new OpenWorldEngine({
    canvas: $("gameCanvas"),
    minimapCanvas: $("minimapCanvas"),
    assets,
    sound,
    callbacks: {
      onHudUpdate: updateHud,
      onRegionChange: (reg) => showToast(`Wilayah: ${reg.name}`),
      onToast: showToast,
      onDialogue: openDialogue,
      onOpenForge: openForge,
      onOpenMap: openWorldMap,
      onVictory: (stats) => {
        engine.setPaused(true);
        $("vicStats").innerHTML = `
          <li>Total Aether Shard: <strong>${stats.shards}</strong></li>
          <li>Monster & Kolosus Dikalahkan: <strong>${stats.kills}</strong></li>
          <li>Level Plasma Katana Nza: <strong>Lv.${stats.bladeLevel}</strong></li>
          <li>Kuil Elemen Aktif: <strong>${stats.shrines}/3</strong></li>
        `;
        $("victoryModal").classList.remove("hidden");
      },
    },
  });

  if (engine.hasSaveData()) {
    btnContinue.classList.remove("hidden");
  }

  const startSession = (useSave, openRealmPicker = false) => {
    sound.unlock();
    engine.initNewOrSaved(useSave);
    $("titleModal").classList.add("hidden");
    engine.setPaused(false);
    engine.start();
    if (openRealmPicker) {
      $("chkEvalFastTravel").checked = true;
      openWorldMap();
    } else {
      showToast(useSave ? "Save berhasil dimuat! Selamat berpetualang, Nza!" : "Selamat datang di Nza Haven Sanctuary!");
    }
  };

  btnStartNew.addEventListener("click", () => startSession(false, false));
  btnContinue.addEventListener("click", () => startSession(true, false));
  btnQuickRealm.addEventListener("click", () => startSession(false, true));

  $("btnCloseDialogue").addEventListener("click", closeAllModals);
  $("btnDlgOpenForge").addEventListener("click", openForge);
  $("btnCloseForge").addEventListener("click", closeAllModals);
  $("btnCloseMap").addEventListener("click", closeAllModals);
  $("btnVicContinue").addEventListener("click", closeAllModals);
  $("btnVicRestart").addEventListener("click", () => {
    closeAllModals();
    startSession(false, false);
  });

  $("btnHudPotion").addEventListener("click", () => engine.triggerPotion());
  $("btnHudForge").addEventListener("click", openForge);
  $("btnHudMap").addEventListener("click", openWorldMap);
  $("minimapWrap").addEventListener("click", openWorldMap);

  $("btnHudMute").addEventListener("click", () => {
    sound.unlock();
    const on = sound.toggleMute();
    $("btnHudMute").textContent = on ? "Suara: ON" : "Suara: OFF";
  });

  $("btnHudFs").addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  const gameCanvas = $("gameCanvas");
  gameCanvas.addEventListener("contextmenu", (e) => e.preventDefault());
  gameCanvas.addEventListener("mousedown", (e) => {
    if (!$("titleModal").classList.contains("hidden") || engine.paused) return;
    sound.unlock();
    if (e.button === 0) engine.setAttackHeld(true);
    else if (e.button === 2) engine.setShieldHeld(true);
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) engine.setAttackHeld(false);
    else if (e.button === 2) engine.setShieldHeld(false);
  });

  window.addEventListener("keydown", (e) => {
    if (!$("titleModal").classList.contains("hidden")) {
      if (e.code === "Enter") startSession(engine.hasSaveData(), false);
      return;
    }

    if (e.code === "Escape") {
      closeAllModals();
      return;
    }
    if (e.code === "KeyM") {
      e.preventDefault();
      if ($("mapModal").classList.contains("hidden")) openWorldMap();
      else closeAllModals();
      return;
    }
    if (e.code === "KeyB") {
      e.preventDefault();
      if ($("forgeModal").classList.contains("hidden")) openForge();
      else closeAllModals();
      return;
    }

    if (engine.paused) {
      if (e.code === "KeyF" || e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        closeAllModals();
      }
      return;
    }

    engine.keys.add(e.code);

    if (e.code === "KeyJ" || e.code === "Space" || e.code === "KeyZ") {
      e.preventDefault();
      if (!e.repeat) engine.setAttackHeld(true);
    } else if (e.code === "KeyE") {
      e.preventDefault();
      engine.triggerSpinSlash(false);
    } else if (e.code === "KeyU") {
      e.preventDefault();
      engine.triggerChakram();
    } else if (e.code === "KeyI" || e.code === "KeyV") {
      e.preventDefault();
      engine.setShieldHeld(true);
    } else if (e.code === "KeyK" || e.code === "KeyX") {
      e.preventDefault();
      engine.triggerBow();
    } else if (e.code === "KeyL" || e.code === "KeyC") {
      e.preventDefault();
      engine.triggerBomb();
    } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      e.preventDefault();
      engine.triggerDash();
    } else if (e.code === "KeyH" || e.code === "KeyQ") {
      e.preventDefault();
      engine.triggerPotion();
    } else if (e.code === "KeyF" || e.code === "Enter") {
      e.preventDefault();
      engine.triggerInteract();
    }
  });

  window.addEventListener("keyup", (e) => {
    engine.keys.delete(e.code);
    if (e.code === "KeyJ" || e.code === "Space" || e.code === "KeyZ") {
      engine.setAttackHeld(false);
    } else if (e.code === "KeyI" || e.code === "KeyV") {
      engine.setShieldHeld(false);
    }
  });

  window.addEventListener("blur", () => {
    engine.keys.clear();
    engine.setAttackHeld(false);
    engine.setShieldHeld(false);
  });

  const joyZone = $("joyZone");
  const joyKnob = $("joyKnob");
  if (joyZone && joyKnob) {
    let activeId = null;
    const maxR = 38;
    const updateStick = (clientX, clientY) => {
      const rect = joyZone.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      engine.touchVec.x = dx / maxR;
      engine.touchVec.y = dy / maxR;
    };
    const resetStick = () => {
      activeId = null;
      joyKnob.style.transform = "translate(0px, 0px)";
      engine.touchVec.x = 0;
      engine.touchVec.y = 0;
    };

    joyZone.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sound.unlock();
      activeId = e.pointerId;
      joyZone.setPointerCapture(e.pointerId);
      updateStick(e.clientX, e.clientY);
    });
    joyZone.addEventListener("pointermove", (e) => {
      if (e.pointerId === activeId) updateStick(e.clientX, e.clientY);
    });
    joyZone.addEventListener("pointerup", resetStick);
    joyZone.addEventListener("pointercancel", resetStick);
  }

  const slashTouch = $("btnTouchSlash");
  if (slashTouch) {
    slashTouch.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sound.unlock();
      engine.setAttackHeld(true);
    });
    slashTouch.addEventListener("pointerup", () => engine.setAttackHeld(false));
    slashTouch.addEventListener("pointercancel", () => engine.setAttackHeld(false));
  }

  const shieldTouch = $("btnTouchShield");
  if (shieldTouch) {
    shieldTouch.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sound.unlock();
      engine.setShieldHeld(true);
    });
    shieldTouch.addEventListener("pointerup", () => engine.setShieldHeld(false));
    shieldTouch.addEventListener("pointercancel", () => engine.setShieldHeld(false));
  }

  const bindTouchBtn = (id, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sound.unlock();
      fn();
    });
  };
  bindTouchBtn("btnTouchChakram", () => engine.triggerChakram());
  bindTouchBtn("btnTouchBow", () => engine.triggerBow());
  bindTouchBtn("btnTouchBomb", () => engine.triggerBomb());
  bindTouchBtn("btnTouchInteract", () => engine.triggerInteract());
}

boot();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
