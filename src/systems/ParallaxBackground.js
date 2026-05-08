// ParallaxBackground creates depth by moving visual layers at different speeds.
// Lower scrollFactor values feel farther away because they drift more slowly.
export default class ParallaxBackground {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];
  }

  build(layers, worldWidth, gameHeight) {
    this.layers = layers.map((layerConfig, index) =>
      this.createLayer(layerConfig, index, worldWidth, gameHeight)
    );
  }

  update() {
    const camera = this.scene.cameras.main;

    this.layers.forEach(({ image, scrollFactor }) => {
      if (image?.tilePositionX !== undefined) {
        image.tilePositionX = camera.scrollX * scrollFactor;
      }
    });
  }

  createLayer(layerConfig, index, worldWidth, gameHeight) {
    const scrollFactor = layerConfig.scrollFactor ?? 1;

    if (this.scene.textures.exists(layerConfig.key)) {
      const image = this.scene.add
        .tileSprite(0, 0, this.scene.scale.width, gameHeight, layerConfig.key)
        .setOrigin(0)
        .setScrollFactor(0)
        // Background layers all stay behind gameplay objects.
        .setDepth(0);

      return { image, scrollFactor };
    }

    console.warn(`ParallaxBackground: missing texture "${layerConfig.key}". Using fallback layer.`);

    const fallbackColors = [0xb9d7ea, 0x8fb8d8, 0x6f9dbf];
    const layerHeight = gameHeight;
    const layer = this.scene.add
      .rectangle(
        worldWidth / 2,
        gameHeight / 2,
        worldWidth,
        layerHeight,
        fallbackColors[index % fallbackColors.length]
      )
      .setScrollFactor(scrollFactor)
      // Background layers all stay behind gameplay objects.
      .setDepth(0);

    return { image: layer, scrollFactor };
  }
}
