import type { Locale } from "../i18n/utils";
import { CHARACTER_SOCIALS, SHOW_SOCIALS } from "./social";

// ============================================
// Types
// ============================================

export interface Character {
  id: string;
  name: string;
  fullName: string;
  role: string;
  quote: string;
  bio: string;
  photo: string;
  episodeCount: number;
  color: string;
  instagram: string;
  tiktok: string;
  youtube?: string;
  facebook?: string;
  famousPhrases: string[];
  bestMoments: { title: string; episode: number; views: string }[];
  featuredEpisodes: { number: number; title: string; topic: string }[];
}

export interface Episode {
  number: number;
  title: string;
  guest: string;
  topic: string;
  duration: string;
  thumbnail: string;
}

export interface ViralEpisode {
  number: number;
  title: string;
  guest: string;
  views: string;
  thumbnail: string;
}

export interface Guest {
  name: string;
  photo: string;
}

export interface Event {
  title: string;
  venue: string;
  city: string;
  date: string;
  description: string;
  link: string;
}

export interface MerchItem {
  name: string;
  price: string;
  img: string;
  link: string;
}

export interface SoundboardItem {
  text: string;
  emoji: string;
}

export interface ViralClip {
  title: string;
  views: string;
  thumbnail: string;
}

// ============================================
// Localized Data
// ============================================

const DATA_ES = {
  characters: [
    {
      id: "miguelin",
      name: "Miguelín",
      fullName: "Miguel David Estévez",
      role: "El Host",
      quote: '"¡Asere, esto es una locura!"',
      bio: "Miguel David Estévez, conocido como Miguelín, es el creador y host del podcast más loco de Miami. Con su carisma inigualable y su humor sin filtros, ha logrado crear una comunidad de miles de fans que no se pierden ni un episodio.",
      photo: "/images/crew/miguelin.jpg",
      episodeCount: 65,
      color: "#FF0055",
      ...CHARACTER_SOCIALS["miguelin"],
      famousPhrases: [
        '"¡Asere, esto es una locura!"',
        '"Oye pero déjame hablar"',
        '"La cosa está fea mi gente"',
        '"Asere qué bolá"',
      ],
      bestMoments: [
        { title: "El día que se cayó la mesa", episode: 23, views: "2.1M" },
        { title: "Miguelín vs El Moreno rap battle", episode: 41, views: "1.8M" },
        { title: "La confesión inesperada", episode: 55, views: "3.2M" },
      ],
      featuredEpisodes: [
        { number: 1, title: "El comienzo de las locuras", topic: "Piloto" },
        { number: 23, title: "Se cayó la mesa en vivo", topic: "Caos total" },
        { number: 55, title: "La confesión que nadie esperaba", topic: "Confesiones" },
        { number: 65, title: "65 episodios de locura", topic: "Especial aniversario" },
      ],
    },
    {
      id: "la-flaca-veronica",
      name: "La Flaca Verónica",
      fullName: "Verónica",
      role: "La Polémica",
      quote: '"Yo digo lo que me da la gana"',
      bio: 'La Flaca Verónica es uno de los personajes más explosivos del podcast "Las Locuras de Miguelín". Con su personalidad directa y sin filtros, se ha convertido en una de las favoritas del público.',
      photo: "/images/crew/la-flaca-veronica.jpg",
      episodeCount: 32,
      color: "#FF0055",
      ...CHARACTER_SOCIALS["la-flaca-veronica"],
      famousPhrases: [
        '"Yo digo lo que me da la gana"',
        '"Eso no fue así"',
        '"Aquí nadie se salva"',
        '"A mí no me vengan con cuentos"',
      ],
      bestMoments: [
        { title: "El debate explosivo", episode: 45, views: "1.5M" },
        { title: "El chisme de Miami", episode: 52, views: "2.3M" },
        { title: "El episodio viral", episode: 60, views: "4.1M" },
      ],
      featuredEpisodes: [
        { number: 45, title: "Debate explosivo", topic: "Polémica" },
        { number: 52, title: "El chisme de Miami", topic: "Chismes" },
        { number: 60, title: "El episodio viral", topic: "Viral" },
        { number: 63, title: "Verónica sin censura", topic: "Sin filtros" },
      ],
    },
    {
      id: "laurita",
      name: "Laurita",
      fullName: "Laura",
      role: "La Voz de la Razón",
      quote: '"Esto se está saliendo de control"',
      bio: "Laurita es el balance perfecto del show. Cuando las locuras se desbordan, ella intenta poner orden... aunque no siempre lo logra. Su sentido del humor inteligente y sus reacciones genuinas la han convertido en la favorita de quienes buscan un poco de cordura en medio del caos.",
      photo: "/images/crew/laurita.jpg",
      episodeCount: 48,
      color: "#00E5FF",
      ...CHARACTER_SOCIALS["laurita"],
      famousPhrases: [
        '"Esto se está saliendo de control"',
        '"Yo no dije eso"',
        '"Espérate, espérate..."',
        '"Miguelín, por favor"',
      ],
      bestMoments: [
        { title: "Laurita pierde la paciencia", episode: 30, views: "1.2M" },
        { title: "El regaño épico a Miguelín", episode: 44, views: "900K" },
        { title: "Laurita y Verónica discutiendo", episode: 51, views: "2.7M" },
      ],
      featuredEpisodes: [
        { number: 30, title: "Laurita pierde la paciencia", topic: "Drama" },
        { number: 44, title: "El regaño épico", topic: "Comedia" },
        { number: 51, title: "Laurita vs Verónica", topic: "Debate" },
        { number: 58, title: "La razón tiene nombre", topic: "Especial" },
      ],
    },
    {
      id: "el-moreno",
      name: "El Moreno",
      fullName: "El Moreno",
      role: "El Showman",
      quote: '"Dale que la vida es una"',
      bio: "El Moreno es pura energía. Cada vez que aparece en el podcast, sube el nivel de las locuras al máximo. Sus historias, su flow y su personalidad lo hacen uno de los personajes más queridos del show.",
      photo: "/images/crew/el-moreno.jpg",
      episodeCount: 28,
      color: "#FFD600",
      ...CHARACTER_SOCIALS["el-moreno"],
      famousPhrases: [
        '"Dale que la vida es una"',
        '"Eso es mentira, bro"',
        '"Tú no estás claro"',
        '"Vamos pa\'l mambo"',
      ],
      bestMoments: [
        { title: "El freestyle épico", episode: 41, views: "1.9M" },
        { title: "La historia del barrio", episode: 37, views: "800K" },
        { title: "El Moreno se emociona", episode: 59, views: "1.1M" },
      ],
      featuredEpisodes: [
        { number: 37, title: "Historias del barrio", topic: "Storytelling" },
        { number: 41, title: "Rap battle en el podcast", topic: "Freestyle" },
        { number: 53, title: "El Moreno habla serio", topic: "Real talk" },
        { number: 59, title: "El momento emotivo", topic: "Emotivo" },
      ],
    },
    {
      id: "la-melliza",
      name: "La Melliza",
      fullName: "Yainelis Ramires",
      role: "La Plomera",
      quote: '"Ay no, ¿qué está pasando aquí?"',
      bio: "La Melliza es el factor sorpresa del show. Nunca sabes qué va a decir o hacer. Su espontaneidad y sus reacciones inesperadas generan algunos de los momentos más cómicos del podcast.",
      photo: "/images/crew/la-melliza.jpg",
      episodeCount: 22,
      color: "#E040FB",
      ...CHARACTER_SOCIALS["la-melliza"],
      famousPhrases: [
        '"Ay no, ¿qué está pasando aquí?"',
        '"Yo no fui"',
        '"¿Pero eso es verdad?"',
        '"Me voy de aquí"',
      ],
      bestMoments: [
        { title: "La reacción que rompió internet", episode: 35, views: "2.5M" },
        { title: "La Melliza canta en vivo", episode: 48, views: "700K" },
        { title: "El malentendido épico", episode: 56, views: "1.3M" },
      ],
      featuredEpisodes: [
        { number: 35, title: "La reacción viral", topic: "Viral" },
        { number: 48, title: "Karaoke en el podcast", topic: "Musical" },
        { number: 56, title: "El malentendido", topic: "Comedia" },
        { number: 62, title: "Melliza al mando", topic: "Especial" },
      ],
    },
    {
      id: "ernesto",
      name: "Ernesto",
      fullName: "Ernesto Jose Lopez Hernandez",
      role: "Behind the Scenes",
      quote: '"Sin mí esto no sale al aire"',
      bio: "Ernesto es el cerebro detrás de las cámaras. Sin él, las locuras no llegarían a tu pantalla. Se encarga de la producción, la edición y de que todo funcione como un reloj... o al menos lo intenta cuando el crew se descontrola.",
      photo: "/images/crew/ernesto.jpg",
      episodeCount: 65,
      color: "#4CAF50",
      ...CHARACTER_SOCIALS["ernesto"],
      famousPhrases: [
        '"Sin mí esto no sale al aire"',
        '"Oigan que estamos grabando"',
        '"Eso hay que editarlo"',
        '"Pongan las luces bien"',
      ],
      bestMoments: [
        { title: "Ernesto aparece en cámara por error", episode: 20, views: "1.4M" },
        { title: "El día que se cayó el set", episode: 38, views: "900K" },
        { title: "Ernesto pierde la paciencia", episode: 50, views: "1.1M" },
      ],
      featuredEpisodes: [
        { number: 20, title: "Error en cámara", topic: "Bloopers" },
        { number: 38, title: "Se cayó el set", topic: "Caos" },
        { number: 50, title: "Ernesto al límite", topic: "Behind the scenes" },
        { number: 64, title: "El hombre detrás del show", topic: "Especial" },
      ],
    },
  ] satisfies Character[],

  latestEpisode: {
    number: 65,
    title: "65 episodios de locura pura",
    guest: "Todo el Crew",
    topic: "Especial aniversario - Los mejores momentos",
    duration: "1h 45min",
    thumbnail: "https://placehold.co/800x450/111111/FF0055?text=EP+65+%7C+ESPECIAL",
  } satisfies Episode,

  viralEpisodes: [
    { number: 60, title: "El episodio viral de Verónica", guest: "La Flaca Verónica", views: "4.1M", thumbnail: "https://placehold.co/400x225/111111/FF0055?text=EP+60" },
    { number: 55, title: "La confesión inesperada", guest: "Miguelín", views: "3.2M", thumbnail: "https://placehold.co/400x225/111111/00E5FF?text=EP+55" },
    { number: 51, title: "Laurita vs Verónica", guest: "Laurita & Verónica", views: "2.7M", thumbnail: "https://placehold.co/400x225/111111/FFD600?text=EP+51" },
    { number: 48, title: "Karaoke en el podcast", guest: "La Melliza", views: "2.5M", thumbnail: "https://placehold.co/400x225/111111/E040FB?text=EP+48" },
    { number: 45, title: "Debate explosivo", guest: "La Flaca Verónica", views: "1.5M", thumbnail: "https://placehold.co/400x225/111111/FF0055?text=EP+45" },
    { number: 41, title: "Rap battle en el podcast", guest: "El Moreno", views: "1.9M", thumbnail: "https://placehold.co/400x225/111111/FFD600?text=EP+41" },
  ] satisfies ViralEpisode[],

  guests: [
    { name: "El Taiger", photo: "https://placehold.co/200x200/111111/FF0055?text=El+Taiger" },
    { name: "Jacob Forever", photo: "https://placehold.co/200x200/111111/00E5FF?text=Jacob+Forever" },
    { name: "Otaola", photo: "https://placehold.co/200x200/111111/FFD600?text=Otaola" },
    { name: "La Diosa", photo: "https://placehold.co/200x200/111111/E040FB?text=La+Diosa" },
    { name: "Descemer Bueno", photo: "https://placehold.co/200x200/111111/FF0055?text=Descemer" },
    { name: "El Chacal", photo: "https://placehold.co/200x200/111111/00E5FF?text=El+Chacal" },
    { name: "Lenier", photo: "https://placehold.co/200x200/111111/FFD600?text=Lenier" },
    { name: "Yomil", photo: "https://placehold.co/200x200/111111/E040FB?text=Yomil" },
  ] satisfies Guest[],

  nextEvent: {
    title: "Las Locuras EN VIVO",
    venue: "Miami-Dade County Auditorium",
    city: "Miami, FL",
    date: "Abril 2026",
    description: "El podcast en vivo con todo el crew y invitados sorpresa. Una noche de locuras, risas y mucho más.",
    link: "#",
  } satisfies Event,

  soundboard: [
    { text: "ASERE", emoji: "🔥" },
    { text: "QUE BOLÁ", emoji: "😎" },
    { text: "LA COSA ESTÁ FEA", emoji: "😱" },
    { text: "ESO NO FUE ASÍ", emoji: "🙅" },
    { text: "DALE", emoji: "💪" },
    { text: "AY NO", emoji: "😂" },
    { text: "ESPÉRATE", emoji: "✋" },
    { text: "ME VOY", emoji: "🚶" },
  ] satisfies SoundboardItem[],

  viralClips: [
    { title: "Miguelín se cae de la silla", views: "5.2M", thumbnail: "https://placehold.co/300x535/111111/FF0055?text=CLIP+1" },
    { title: "Verónica dice la verdad", views: "3.8M", thumbnail: "https://placehold.co/300x535/111111/00E5FF?text=CLIP+2" },
    { title: "El Moreno freestyle", views: "2.9M", thumbnail: "https://placehold.co/300x535/111111/FFD600?text=CLIP+3" },
    { title: "La Melliza reacciona", views: "4.1M", thumbnail: "https://placehold.co/300x535/111111/E040FB?text=CLIP+4" },
  ] satisfies ViralClip[],
};

const DATA_EN = {
  ...DATA_ES,
  latestEpisode: {
    ...DATA_ES.latestEpisode,
    title: "65 episodes of pure craziness",
    guest: "The whole Crew",
    topic: "Anniversary special - The best moments",
  },
  nextEvent: {
    ...DATA_ES.nextEvent,
    title: "Las Locuras LIVE",
    date: "April 2026",
    description: "The live podcast with the whole crew and surprise guests. A night of craziness, laughs and much more.",
  },
};

export function getSiteData(locale: Locale) {
  return locale === "en" ? DATA_EN : DATA_ES;
}

export function getCharacterById(id: string): Character | undefined {
  return DATA_ES.characters.find((c) => c.id === id);
}

export function getAllCharacterIds(): string[] {
  return DATA_ES.characters.map((c) => c.id);
}
