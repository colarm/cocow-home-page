export type ThemeId = "coconut" | "ocean" | "forest" | "sunset" | "midnight";

export interface Theme {
  id: ThemeId;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgHover: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    borderLight: string;
    border: string;
    borderDark: string;
  };
}

// 从全局配置读取主题颜色
const themeConfig = (window as any).__THEME_CONFIG__;

export const themes: Theme[] = [
  {
    id: "coconut",
    colors: themeConfig.coconut,
  },
  {
    id: "ocean",
    colors: themeConfig.ocean,
  },
  {
    id: "forest",
    colors: themeConfig.forest,
  },
  {
    id: "sunset",
    colors: themeConfig.sunset,
  },
  {
    id: "midnight",
    colors: themeConfig.midnight,
  },
];

export function getTheme(id: ThemeId): Theme {
  return themes.find((theme) => theme.id === id) || themes[0];
}
