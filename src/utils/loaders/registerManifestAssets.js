// Queues assets from public/data/asset_manifest.json into Phaser's loader.
// This utility only registers assets; scenes decide when to start or change.
export function registerManifestAssets(scene, manifest = {}) {
  const images = manifest.images ?? [];
  const spritesheets = manifest.spritesheets ?? [];
  const audio = manifest.audio ?? [];
  const json = manifest.json ?? [];

  images.forEach((asset) => {
    scene.load.image(asset.key, asset.path);
  });

  spritesheets.forEach((asset) => {
    scene.load.spritesheet(asset.key, asset.path, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight
    });
  });

  audio.forEach((asset) => {
    scene.load.audio(asset.key, asset.path);
  });

  json.forEach((asset) => {
    scene.load.json(asset.key, asset.path);
  });

  return images.length + spritesheets.length + audio.length + json.length;
}
