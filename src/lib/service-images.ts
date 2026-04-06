import defaultServiceImageDark from '../assets/sem-imagem-dark.png';
import defaultServiceImageLight from '../assets/sem-imagem-light.png';
import type { ThemeName } from '../components/theme/ThemeProvider';

export function getDefaultServiceImage(theme: ThemeName) {
  return theme === 'dark' ? defaultServiceImageDark.src : defaultServiceImageLight.src;
}

export function getServiceImageSources(images: string[] | undefined, theme: ThemeName) {
  const normalizedImages = (images || []).filter((image): image is string => Boolean(image?.trim()));

  if (normalizedImages.length) {
    return normalizedImages;
  }

  return [getDefaultServiceImage(theme)];
}