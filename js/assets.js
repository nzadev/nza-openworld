export async function loadGameAssets(onProgress = () => {}) {
  const manifest = [
    ["hero", "./assets/sprites/hero_nza.png"],
    ["mobs", "./assets/sprites/mobs.png"],
    ["boss", "./assets/sprites/boss_malakor.png"],
    ["tiles", "./assets/sprites/world_tiles.png"],
    ["fx", "./assets/sprites/fx_items.png"],
    ["banner", "./assets/ui/hero_banner.png"],
    ["icon", "./assets/ui/game_icon.png"],
  ];

  const loaded = {};
  let count = 0;

  await Promise.all(
    manifest.map(
      ([key, src]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            loaded[key] = img;
            count += 1;
            onProgress(count / manifest.length);
            resolve();
          };
          img.onerror = () => reject(new Error(`Gagal memuat aset: ${src}`));
          img.src = src;
        })
    )
  );

  return loaded;
}
