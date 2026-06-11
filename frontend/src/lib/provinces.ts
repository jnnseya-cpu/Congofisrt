// Le Congo D'Abord — All 26 DRC Provinces with territories data

import { Province, Territory } from './types';

export const DRC_PROVINCES: Province[] = [
  {
    id: 'kinshasa',
    name: 'Kinshasa',
    capital: 'Kinshasa',
    region: 'Kinshasa',
    population: 17071000,
    territories: [
      { id: 'kin-funa', name: 'Funa', provinceId: 'kinshasa', communes: ['Bumbu', 'Kalamu', 'Kasa-Vubu', 'Makala', 'Selembao'] },
      { id: 'kin-lukunga', name: 'Lukunga', provinceId: 'kinshasa', communes: ['Gombe', 'Kintambo', 'Lingwala', 'Mont-Ngafula', 'Ngaliema'] },
      { id: 'kin-mont-amba', name: 'Mont-Amba', provinceId: 'kinshasa', communes: ['Lemba', 'Limete', 'Matete', 'Ngaba', 'Nzale'] },
      { id: 'kin-tshangu', name: 'Tshangu', provinceId: 'kinshasa', communes: ['Kimbanseke', 'Kisenso', 'Maluku', "Masina", 'Ndjili', 'Nsele'] },
    ],
    memberCount: 4250,
    activeContributors: 3180,
    leaderName: 'Coordinateur National',
    electionReadiness: 78,
  },
  {
    id: 'kongo-central',
    name: 'Kongo Central',
    capital: 'Matadi',
    region: 'Kongo',
    population: 6142000,
    territories: [
      { id: 'kc-boma', name: 'Boma', provinceId: 'kongo-central', communes: ['Boma Rural', 'Boma Ville'] },
      { id: 'kc-matadi', name: 'Matadi', provinceId: 'kongo-central', communes: ['Matadi Ville', 'Nzanza'] },
      { id: 'kc-mbanza-ngungu', name: 'Mbanza-Ngungu', provinceId: 'kongo-central', communes: ['Mbanza-Ngungu', 'Kivunda'] },
      { id: 'kc-lukula', name: 'Lukula', provinceId: 'kongo-central', communes: ['Lukula', 'Tshela'] },
      { id: 'kc-songololo', name: 'Songololo', provinceId: 'kongo-central', communes: ['Gombe-Matadi', 'Kasangulu', 'Seke-Banza'] },
      { id: 'kc-cataractes', name: 'Cataractes', provinceId: 'kongo-central', communes: ['Sona-Bata', 'Luozi'] },
    ],
    memberCount: 1850,
    activeContributors: 1340,
    leaderName: 'Coordinateur Provincial',
    electionReadiness: 62,
  },
  {
    id: 'kwango',
    name: 'Kwango',
    capital: 'Kenge',
    region: 'Bandundu',
    population: 2612000,
    territories: [
      { id: 'kw-kenge', name: 'Kenge', provinceId: 'kwango', communes: ['Kenge', 'Popokabaka'] },
      { id: 'kw-kasongo-lunda', name: 'Kasongo-Lunda', provinceId: 'kwango', communes: ['Kasongo-Lunda'] },
      { id: 'kw-feshi', name: 'Feshi', provinceId: 'kwango', communes: ['Feshi'] },
      { id: 'kw-kahemba', name: 'Kahemba', provinceId: 'kwango', communes: ['Kahemba'] },
    ],
    memberCount: 760,
    activeContributors: 540,
    electionReadiness: 45,
  },
  {
    id: 'kwilu',
    name: 'Kwilu',
    capital: 'Bandundu',
    region: 'Bandundu',
    population: 5835000,
    territories: [
      { id: 'kl-bandundu', name: 'Bandundu', provinceId: 'kwilu', communes: ['Bandundu Ville', 'Bagata'] },
      { id: 'kl-bulungu', name: 'Bulungu', provinceId: 'kwilu', communes: ['Bulungu', 'Mosango'] },
      { id: 'kl-idiofa', name: 'Idiofa', provinceId: 'kwilu', communes: ['Idiofa', 'Gungu'] },
      { id: 'kl-kikwit', name: 'Kikwit', provinceId: 'kwilu', communes: ['Kikwit', 'Masi-Manimba'] },
    ],
    memberCount: 1680,
    activeContributors: 1230,
    electionReadiness: 55,
  },
  {
    id: 'mai-ndombe',
    name: 'Mai-Ndombe',
    capital: 'Inongo',
    region: 'Bandundu',
    population: 2279000,
    territories: [
      { id: 'mn-inongo', name: 'Inongo', provinceId: 'mai-ndombe', communes: ['Inongo'] },
      { id: 'mn-kutu', name: 'Kutu', provinceId: 'mai-ndombe', communes: ['Kutu', 'Kiri'] },
      { id: 'mn-bolobo', name: 'Bolobo', provinceId: 'mai-ndombe', communes: ['Bolobo'] },
      { id: 'mn-oshwe', name: 'Oshwe', provinceId: 'mai-ndombe', communes: ['Oshwe'] },
    ],
    memberCount: 640,
    activeContributors: 445,
    electionReadiness: 38,
  },
  {
    id: 'equateur',
    name: 'Équateur',
    capital: 'Mbandaka',
    region: 'Equateur',
    population: 1889000,
    territories: [
      { id: 'eq-mbandaka', name: 'Mbandaka', provinceId: 'equateur', communes: ['Mbandaka Ville', 'Bikoro'] },
      { id: 'eq-bomongo', name: 'Bomongo', provinceId: 'equateur', communes: ['Bomongo'] },
      { id: 'eq-bolomba', name: 'Bolomba', provinceId: 'equateur', communes: ['Bolomba'] },
      { id: 'eq-lukolela', name: 'Lukolela', provinceId: 'equateur', communes: ['Lukolela'] },
    ],
    memberCount: 540,
    activeContributors: 380,
    electionReadiness: 42,
  },
  {
    id: 'mongala',
    name: 'Mongala',
    capital: 'Lisala',
    region: 'Equateur',
    population: 1867000,
    territories: [
      { id: 'mo-lisala', name: 'Lisala', provinceId: 'mongala', communes: ['Lisala', 'Bumba'] },
      { id: 'mo-bongandanga', name: 'Bongandanga', provinceId: 'mongala', communes: ['Bongandanga'] },
    ],
    memberCount: 520,
    activeContributors: 360,
    electionReadiness: 36,
  },
  {
    id: 'nord-ubangi',
    name: 'Nord-Ubangi',
    capital: 'Gbadolite',
    region: 'Equateur',
    population: 1160000,
    territories: [
      { id: 'nu-gbadolite', name: 'Gbadolite', provinceId: 'nord-ubangi', communes: ['Gbadolite', 'Yakoma'] },
      { id: 'nu-mobayi-mbongo', name: 'Mobayi-Mbongo', provinceId: 'nord-ubangi', communes: ['Mobayi-Mbongo'] },
    ],
    memberCount: 310,
    activeContributors: 215,
    electionReadiness: 30,
  },
  {
    id: 'sud-ubangi',
    name: 'Sud-Ubangi',
    capital: 'Gemena',
    region: 'Equateur',
    population: 2122000,
    territories: [
      { id: 'su-gemena', name: 'Gemena', provinceId: 'sud-ubangi', communes: ['Gemena', 'Kungu'] },
      { id: 'su-budjala', name: 'Budjala', provinceId: 'sud-ubangi', communes: ['Budjala', 'Libenge'] },
    ],
    memberCount: 560,
    activeContributors: 395,
    electionReadiness: 40,
  },
  {
    id: 'tshuapa',
    name: 'Tshuapa',
    capital: 'Boende',
    region: 'Equateur',
    population: 1344000,
    territories: [
      { id: 'ts-boende', name: 'Boende', provinceId: 'tshuapa', communes: ['Boende', 'Ikela'] },
      { id: 'ts-befale', name: 'Befale', provinceId: 'tshuapa', communes: ['Befale'] },
    ],
    memberCount: 340,
    activeContributors: 235,
    electionReadiness: 32,
  },
  {
    id: 'kasai',
    name: 'Kasaï',
    capital: 'Luebo',
    region: 'Kasai',
    population: 2161000,
    territories: [
      { id: 'ka-luebo', name: 'Luebo', provinceId: 'kasai', communes: ['Luebo', 'Mweka'] },
      { id: 'ka-tshikapa', name: 'Tshikapa', provinceId: 'kasai', communes: ['Tshikapa'] },
      { id: 'ka-ilebo', name: 'Ilebo', provinceId: 'kasai', communes: ['Ilebo'] },
    ],
    memberCount: 620,
    activeContributors: 450,
    electionReadiness: 48,
  },
  {
    id: 'kasai-central',
    name: 'Kasaï-Central',
    capital: 'Kananga',
    region: 'Kasai',
    population: 4147000,
    territories: [
      { id: 'kc-kananga', name: 'Kananga', provinceId: 'kasai-central', communes: ['Kananga Ville', 'Dibaya'] },
      { id: 'kc-demba', name: 'Demba', provinceId: 'kasai-central', communes: ['Demba', 'Dimbelenge'] },
      { id: 'kc-kazumba', name: 'Kazumba', provinceId: 'kasai-central', communes: ['Kazumba', 'Luiza'] },
    ],
    memberCount: 1140,
    activeContributors: 830,
    electionReadiness: 53,
  },
  {
    id: 'kasai-oriental',
    name: 'Kasaï-Oriental',
    capital: 'Mbuji-Mayi',
    region: 'Kasai',
    population: 4490000,
    territories: [
      { id: 'ko-mbuji-mayi', name: 'Mbuji-Mayi', provinceId: 'kasai-oriental', communes: ['Dibindi', 'Kanshi', 'Katanda', 'Muya', 'Bipemba'] },
      { id: 'ko-tshilenge', name: 'Tshilenge', provinceId: 'kasai-oriental', communes: ['Tshilenge', 'Kabeya-Kamwanga'] },
      { id: 'ko-miabi', name: 'Miabi', provinceId: 'kasai-oriental', communes: ['Miabi', 'Katanda'] },
    ],
    memberCount: 1280,
    activeContributors: 950,
    electionReadiness: 60,
  },
  {
    id: 'lomami',
    name: 'Lomami',
    capital: 'Kabinda',
    region: 'Kasai',
    population: 2477000,
    territories: [
      { id: 'lo-kabinda', name: 'Kabinda', provinceId: 'lomami', communes: ['Kabinda', 'Lubao'] },
      { id: 'lo-ngandajika', name: 'Ngandajika', provinceId: 'lomami', communes: ['Ngandajika'] },
    ],
    memberCount: 690,
    activeContributors: 490,
    electionReadiness: 44,
  },
  {
    id: 'sankuru',
    name: 'Sankuru',
    capital: 'Lodja',
    region: 'Kasai',
    population: 1756000,
    territories: [
      { id: 'sa-lodja', name: 'Lodja', provinceId: 'sankuru', communes: ['Lodja', 'Katako-Kombe'] },
      { id: 'sa-kole', name: 'Kole', provinceId: 'sankuru', communes: ['Kole', 'Lusambo'] },
    ],
    memberCount: 480,
    activeContributors: 335,
    electionReadiness: 35,
  },
  {
    id: 'maniema',
    name: 'Maniema',
    capital: 'Kindu',
    region: 'Maniema',
    population: 2228000,
    territories: [
      { id: 'ma-kindu', name: 'Kindu', provinceId: 'maniema', communes: ['Kindu Ville', 'Kailo'] },
      { id: 'ma-pangi', name: 'Pangi', provinceId: 'maniema', communes: ['Pangi', 'Kasongo'] },
      { id: 'ma-shabunda', name: 'Shabunda', provinceId: 'maniema', communes: ['Shabunda'] },
    ],
    memberCount: 580,
    activeContributors: 410,
    electionReadiness: 40,
  },
  {
    id: 'sud-kivu',
    name: 'Sud-Kivu',
    capital: 'Bukavu',
    region: 'Kivu',
    population: 5693000,
    territories: [
      { id: 'sk-bukavu', name: 'Bukavu', provinceId: 'sud-kivu', communes: ['Ibanda', 'Kadutu', 'Bagira', 'Ndendere'] },
      { id: 'sk-uvira', name: 'Uvira', provinceId: 'sud-kivu', communes: ['Uvira', 'Fizi'] },
      { id: 'sk-mwenga', name: 'Mwenga', provinceId: 'sud-kivu', communes: ['Mwenga', 'Shabunda'] },
    ],
    memberCount: 1620,
    activeContributors: 1180,
    electionReadiness: 58,
  },
  {
    id: 'nord-kivu',
    name: 'Nord-Kivu',
    capital: 'Goma',
    region: 'Kivu',
    population: 7020000,
    territories: [
      { id: 'nk-goma', name: 'Goma', provinceId: 'nord-kivu', communes: ['Goma Ville', 'Karisimbi', 'Nyiragongo'] },
      { id: 'nk-butembo', name: 'Butembo', provinceId: 'nord-kivu', communes: ['Butembo Ville', 'Lubero'] },
      { id: 'nk-beni', name: 'Beni', provinceId: 'nord-kivu', communes: ['Beni Ville', 'Oicha'] },
      { id: 'nk-rutshuru', name: 'Rutshuru', provinceId: 'nord-kivu', communes: ['Rutshuru', 'Kiwanja'] },
    ],
    memberCount: 2140,
    activeContributors: 1550,
    leaderName: 'Coordinateur Provincial',
    electionReadiness: 55,
  },
  {
    id: 'ituri',
    name: 'Ituri',
    capital: 'Bunia',
    region: 'Oriental',
    population: 5266000,
    territories: [
      { id: 'it-bunia', name: 'Bunia', provinceId: 'ituri', communes: ['Bunia Ville', 'Rwampara'] },
      { id: 'it-irumu', name: 'Irumu', provinceId: 'ituri', communes: ['Irumu', 'Komanda'] },
      { id: 'it-djugu', name: 'Djugu', provinceId: 'ituri', communes: ['Djugu', 'Fataki'] },
    ],
    memberCount: 1480,
    activeContributors: 1070,
    electionReadiness: 50,
  },
  {
    id: 'haut-uele',
    name: 'Haut-Uele',
    capital: 'Isiro',
    region: 'Oriental',
    population: 2233000,
    territories: [
      { id: 'hu-isiro', name: 'Isiro', provinceId: 'haut-uele', communes: ['Isiro', 'Niangara'] },
      { id: 'hu-dungu', name: 'Dungu', provinceId: 'haut-uele', communes: ['Dungu'] },
    ],
    memberCount: 590,
    activeContributors: 415,
    electionReadiness: 38,
  },
  {
    id: 'bas-uele',
    name: 'Bas-Uele',
    capital: 'Buta',
    region: 'Oriental',
    population: 1312000,
    territories: [
      { id: 'bu-buta', name: 'Buta', provinceId: 'bas-uele', communes: ['Buta', 'Aketi'] },
      { id: 'bu-bondo', name: 'Bondo', provinceId: 'bas-uele', communes: ['Bondo'] },
    ],
    memberCount: 350,
    activeContributors: 245,
    electionReadiness: 32,
  },
  {
    id: 'tshopo',
    name: 'Tshopo',
    capital: 'Kisangani',
    region: 'Oriental',
    population: 3105000,
    territories: [
      { id: 'tp-kisangani', name: 'Kisangani', provinceId: 'tshopo', communes: ['Kisangani Ville', 'Tshopo Rural', 'Lubunga', 'Makiso', 'Mangobo', 'Kabondo-Dianda'] },
      { id: 'tp-basoko', name: 'Basoko', provinceId: 'tshopo', communes: ['Basoko', 'Isangi'] },
      { id: 'tp-ubundu', name: 'Ubundu', provinceId: 'tshopo', communes: ['Ubundu', 'Opala'] },
    ],
    memberCount: 880,
    activeContributors: 635,
    electionReadiness: 47,
  },
  {
    id: 'tanganyika',
    name: 'Tanganyika',
    capital: 'Kalemie',
    region: 'Katanga',
    population: 2681000,
    territories: [
      { id: 'ta-kalemie', name: 'Kalemie', provinceId: 'tanganyika', communes: ['Kalemie Ville', 'Nyemba'] },
      { id: 'ta-kongolo', name: 'Kongolo', provinceId: 'tanganyika', communes: ['Kongolo', 'Kabalo'] },
      { id: 'ta-moba', name: 'Moba', provinceId: 'tanganyika', communes: ['Moba'] },
    ],
    memberCount: 720,
    activeContributors: 510,
    electionReadiness: 43,
  },
  {
    id: 'haut-lomami',
    name: 'Haut-Lomami',
    capital: 'Kamina',
    region: 'Katanga',
    population: 2651000,
    territories: [
      { id: 'hl-kamina', name: 'Kamina', provinceId: 'haut-lomami', communes: ['Kamina Ville', 'Bukama'] },
      { id: 'hl-malemba-nkulu', name: 'Malemba-Nkulu', provinceId: 'haut-lomami', communes: ['Malemba-Nkulu', 'Kinkondja'] },
    ],
    memberCount: 730,
    activeContributors: 515,
    electionReadiness: 45,
  },
  {
    id: 'lualaba',
    name: 'Lualaba',
    capital: 'Kolwezi',
    region: 'Katanga',
    population: 2524000,
    territories: [
      { id: 'lu-kolwezi', name: 'Kolwezi', provinceId: 'lualaba', communes: ['Kolwezi Ville', 'Dilala', 'Manika'] },
      { id: 'lu-mutshatsha', name: 'Mutshatsha', provinceId: 'lualaba', communes: ['Mutshatsha', 'Kapanga'] },
    ],
    memberCount: 840,
    activeContributors: 620,
    electionReadiness: 52,
  },
  {
    id: 'haut-katanga',
    name: 'Haut-Katanga',
    capital: 'Lubumbashi',
    region: 'Katanga',
    population: 4580000,
    territories: [
      { id: 'hk-lubumbashi', name: 'Lubumbashi', provinceId: 'haut-katanga', communes: ['Annexe', 'Kamalondo', 'Kampemba', 'Katuba', 'Kenya', 'Lubumbashi Ville', 'Rwashi'] },
      { id: 'hk-likasi', name: 'Likasi', provinceId: 'haut-katanga', communes: ['Likasi Ville', 'Kambove'] },
      { id: 'hk-kipushi', name: 'Kipushi', provinceId: 'haut-katanga', communes: ['Kipushi'] },
      { id: 'hk-sakania', name: 'Sakania', provinceId: 'haut-katanga', communes: ['Sakania'] },
    ],
    memberCount: 2380,
    activeContributors: 1750,
    leaderName: 'Coordinateur Provincial',
    electionReadiness: 72,
  },
];

export function getProvinceById(id: string): Province | undefined {
  return DRC_PROVINCES.find(p => p.id === id);
}

export function getProvinceByName(name: string): Province | undefined {
  return DRC_PROVINCES.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getTotalMembers(): number {
  return DRC_PROVINCES.reduce((sum, p) => sum + (p.memberCount || 0), 0);
}

export function getTotalActiveContributors(): number {
  return DRC_PROVINCES.reduce((sum, p) => sum + (p.activeContributors || 0), 0);
}

export function getTopProvincesByMembers(limit = 5): Province[] {
  return [...DRC_PROVINCES]
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
    .slice(0, limit);
}

export const PROVINCE_NAMES = DRC_PROVINCES.map(p => p.name);

export const CONTINENTS = [
  'Afrique',
  'Europe',
  'Amérique du Nord',
  'Amérique du Sud',
  'Asie',
  'Océanie',
];

export const AFRICAN_COUNTRIES = [
  'RD Congo', 'Congo-Brazzaville', 'Angola', 'Zambie', 'Zimbabwe',
  'Rwanda', 'Burundi', 'Ouganda', 'Tanzanie', 'Kenya',
  'Afrique du Sud', 'Mozambique', 'Malawi', 'Cameroun', 'Nigeria',
  'Ghana', 'Côte d\'Ivoire', 'Sénégal', 'Maroc', 'Algérie',
  'Égypte', 'Éthiopie', 'Soudan', 'Gabon', 'Guinée Équatoriale',
];
