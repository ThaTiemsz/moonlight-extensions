const imageFilenameRegex = /(?=[\S])[^\\\/:*?"<>|]+\.(?:png|jpe?g|webp|gif)/i;
const gifEmbedProviders = ["tenor.com", "imgur.com", "giphy.com"];

export function handle(src: string) {
  const showFullUrl = moonlight.getConfigOption<boolean>("imgTitle", "showFullUrl");
  return (
    (showFullUrl || gifEmbedProviders.some((provider) => src.includes(provider))
      ? src
      : src.match(imageFilenameRegex)?.[0]) ?? ""
  );
}
