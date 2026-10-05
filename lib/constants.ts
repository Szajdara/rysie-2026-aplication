import { CategoryDefinition, CategoryId, VotesData } from './types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'forrest-gump',
    title: 'Forrest Gump',
    shortTitle: 'Forrest Gump',
    tagline: '„Biegnij Forrest!”',
    description: 'Niewyczerpane pokłady energii, dobre serce, cierpliwość i gotowość do pomocy w każdej chwili.',
    iconName: 'Zap',
    badgeColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 'terminator',
    title: 'Terminator',
    shortTitle: 'Terminator',
    tagline: '„I’ll be back”',
    description: 'Żelazne zasady, niespotykana konsekwencja, dyscyplina i nieustępliwość w dążeniu do wiedzy.',
    iconName: 'Shield',
    badgeColor: 'from-red-500 to-rose-700',
  },
  {
    id: 'sherlock-holmes',
    title: 'Sherlock Holmes',
    shortTitle: 'Sherlock Holmes',
    tagline: '„Elementarne, drogi Watsonie”',
    description: 'Przenikliwy umysł, natychmiastowe wyłapywanie ściąg i mistrzowskie dedukowanie każdego problemu.',
    iconName: 'Search',
    badgeColor: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'darth-vader',
    title: 'Darth Vader / Anakin Skywalker',
    shortTitle: 'Darth Vader',
    tagline: '„Nie lekceważ potęgi Mocy”',
    description: 'Budzący respekt autorytet, potężna charyzma i niezaprzeczalna siła charakteru.',
    iconName: 'Flame',
    badgeColor: 'from-purple-500 to-red-600',
  },
  {
    id: 'gandalf',
    title: 'Gandalf',
    shortTitle: 'Gandalf',
    tagline: '„Nie przejdziesz!” ...chyba że z 5-tką',
    description: 'Oaza spokoju, życiowa mądrość, wyrozumiałość i prawdziwa magia przekazywania wiedzy.',
    iconName: 'Sparkles',
    badgeColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'vito-corleone',
    title: 'Vito Corleone',
    shortTitle: 'Vito Corleone',
    tagline: '„Propozycja nie do odrzucenia”',
    description: 'Klasa, elegancja, szacunek całej społeczności i bezwzględny autorytet na szkolnych korytarzach.',
    iconName: 'Crown',
    badgeColor: 'from-yellow-400 to-amber-600',
  },
];

export const INITIAL_VOTES_DATA: VotesData = {
  'forrest-gump': [],
  'terminator': [],
  'sherlock-holmes': [],
  'darth-vader': [],
  'gandalf': [],
  'vito-corleone': [],
};

export const DEFAULT_AUTH_CREDENTIALS = {
  login: 'organizator',
  altLogin: 'organizator_rysi_2026',
  password: 'rysie2026',
  altPassword: 'Rysie26org@niz@tor',
};

export const STORAGE_KEY_VOTES = 'rysie_2026_votes_data_v1';
export const STORAGE_KEY_AUTH = 'rysie_2026_auth_session_v1';
export const STORAGE_KEY_CUSTOM_TEACHERS = 'rysie_2026_all_teachers_registry_v1';
export const STORAGE_KEY_SYNC_MODE = 'rysie_2026_sync_mode_v1';


export const DEFAULT_TEACHER_NAMES: string[] = [
  'Adam Szewczyczak',
  'Agata Wojcieszak',
  'Alicja Gizelska',
  'Artur Pietrzak',
  'Cezary Knast',
  'Dorota Renk',
  'Ewa Tarabasz',
  'Filip Napierała',
  'Iwona Smierzchalska',
  'Jagoda Bachanek',
  'Jakub Rabenda',
  'Jerzy Janicki',
  'Justyna Andrzejak',
  'Kamil Giżyński',
  'Kamila Kościelniak',
  'Kamilla Jakubowska',
  'Katarzyna Prętka',
  'Krzysztof Niedbała',
  'Magdalena Śliwa',
  'Małgorzata Rękoś',
  'Marcin Witczak',
  'Marek Nowak',
  'Marta Kryjom',
  'Marta Wawrzyniak',
  'Mikołaj Kutozow',
  'Norbert Mocek',
  'Paweł Thomas',
  'Piotr Piechocki',
  'Piotr Szulada',
  'Rafał Kocik',
  'Renata Mikołajczak',
  'Sebastian Kubica',
  'Sławomir Wartacz',
  'Tobiasz Michalak',
  'Urszula Skrzypek',
  'Wiesława Metello-Kasprzyk',
  'Wojciech Kowalewski',
];

