module.exports = {
  // Preload the hero image so it paints first.
  preload_image: data => (data.hero && data.hero.image) || data.preload_image,
};
