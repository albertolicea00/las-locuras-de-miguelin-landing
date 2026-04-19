// ============================================
// Real Social Media Links
// ============================================

export const SHOW_SOCIALS = {
  youtube: "https://www.youtube.com/@laslocurasdemiguelin4300",
  facebook: "https://www.facebook.com/locurasdemiguelin",
  instagram: "https://www.instagram.com/miguelindavid/",
  stats: {
    youtube: "124K",
    facebook: "480K",
    instagram: "645K",
  }
} as const;

export const CHARACTER_SOCIALS: Record<string, { instagram: string; tiktok: string; youtube?: string; facebook?: string }> = {
  miguelin: {
    instagram: "https://www.instagram.com/miguelindavid/",
    tiktok: "#",
    youtube: "https://www.youtube.com/@laslocurasdemiguelin4300",
  },
  "la-flaca-veronica": {
    instagram: "https://www.instagram.com/la_flaca_veronica_/",
    tiktok: "#",
  },
  laurita: {
    instagram: "https://www.instagram.com/laurita___06/",
    tiktok: "#",
  },
  "el-moreno": {
    instagram: "https://www.instagram.com/el_moreno83/",
    tiktok: "#",
  },
  "la-melliza": {
    instagram: "https://www.instagram.com/la.melliza/",
    tiktok: "#",
  },
  ernesto: {
    instagram: "https://www.instagram.com/ernesto_behind_the_scenes/",
    tiktok: "#",
  },
} as const;

// Instagram usernames for embeds
export const INSTAGRAM_HANDLES: Record<string, string> = {
  miguelin: "miguelindavid",
  "la-flaca-veronica": "la_flaca_veronica_",
  laurita: "laurita___06",
  "el-moreno": "el_moreno83",
  "la-melliza": "la.melliza",
  ernesto: "ernesto_behind_the_scenes",
};
