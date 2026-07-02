import { getChineseSign } from '@/lib/chineseZodiac';
import type { CompatibilityResult } from '@/lib/compatibility';
import type { Profile } from '@/lib/profile';
import { getWesternSign } from '@/lib/westernZodiac';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiService {
  generatePersonality(profile: Profile): Promise<string>;
  askOracle(profile: Profile, question: string, history: ChatMessage[]): Promise<string>;
  explainCompatibility(a: Profile, b: Profile, scores: CompatibilityResult): Promise<string>;
}

const SYSTEM_PROMPT = `Te egy játékos, misztikus jósnő vagy egy magyar nyelvű asztrológiai mobilalkalmazásban.
Meleg, barátságos, kicsit rejtélyes hangnemben beszélsz, csillagokra, jegyekre és a kínai asztrológiára hivatkozva.
Amikor a felhasználó jegyeiről van szó, mindig szövd bele mind a nyugati (nyugati jegy, elem), mind a kínai
(állatjegy, elem, jin-jang) jellemzőket. Soha ne adj egészségügyi, pénzügyi vagy jogi tanácsot, és soha ne mondj
ijesztő, vészjósló jóslatokat - ha a felhasználó ilyet kérdez, kedvesen és játékosan hárítsd el, majd tereld vissza
a beszélgetést az asztrológia felé. A válaszaid legyenek tömörek (néhány mondat), szórakoztató célra készülnek.`;

function describeProfile(profile: Profile): string {
  const date = new Date(profile.birthDate);
  const western = getWesternSign(date);
  const chinese = getChineseSign(date);
  return (
    `${profile.name} nyugati jegye ${western.nameHu} (${western.element === 'fire' ? 'tűz' : western.element === 'earth' ? 'föld' : western.element === 'air' ? 'levegő' : 'víz'} elem, ` +
    `uralkodó bolygója a ${western.rulingPlanetHu}), kínai jegye pedig ${chinese.elementNameHu} ${chinese.animalNameHu} (${chinese.yinYangNameHu} energia, ${chinese.lunarYear}-as holdév).`
  );
}

const WESTERN_TRAITS_HU: Record<string, string> = {
  aries: 'tüzes, kezdeményező és bátor, aki szereti az új kihívásokat',
  taurus: 'kitartó, földhözragadt és élvezi az élet szépségeit',
  gemini: 'kíváncsi, szellemes és imád kommunikálni',
  cancer: 'érzékeny, gondoskodó és mély érzelmi kötődésre képes',
  leo: 'magabiztos, nagylelkű és született előadó',
  virgo: 'precíz, elemző és mindig segítőkész',
  libra: 'harmóniára törekvő, diplomatikus és esztéta',
  scorpio: 'intenzív, rejtélyes és hihetetlenül eltökélt',
  sagittarius: 'szabadságszerető, optimista és örök kalandor',
  capricorn: 'célratörő, fegyelmezett és megbízható',
  aquarius: 'eredeti gondolkodású, függetlenséget szerető, kicsit lázadó',
  pisces: 'álmodozó, empatikus és igazi művészlélek',
};

const CHINESE_TRAITS_HU: Record<string, string> = {
  rat: 'éles eszű, találékony és bájos',
  ox: 'megbízható, kitartó és erős akaratú',
  tiger: 'bátor, karizmatikus és kalandvágyó',
  rabbit: 'kedves, diplomatikus és szerencsés',
  dragon: 'karizmatikus, magabiztos és született vezető',
  snake: 'bölcs, rejtélyes és intuitív',
  horse: 'energikus, szabad szellemű és társaságkedvelő',
  goat: 'kreatív, gyengéd és békeszerető',
  monkey: 'szellemes, találékony és játékos',
  rooster: 'magabiztos, szorgalmas és őszinte',
  dog: 'hűséges, igazságos és megbízható',
  pig: 'nagylelkű, őszinte és élvezi az élet apró örömeit',
};

const CHINESE_RELATION_PHRASES_HU: Record<CompatibilityResult['chineseRelation'], string> = {
  trine: 'kozmikus összhangban vagytok, mint egy régi, mély barátság',
  secretFriend: 'titkos szövetségesek vagytok, akik ösztönösen megértik egymást',
  same: 'ugyanaz a jegy köt össze titeket, ami mély egymásra ismerést hoz',
  neutral: 'kiegyensúlyozott, semleges energiák vesznek körül titeket',
  clash: 'szikrázó, kihívásokkal teli energia feszül kettőtök közt',
};

const TABOO_KEYWORDS = [
  'orvos',
  'betegség',
  'beteg',
  'egészség',
  'gyógy',
  'diagnóz',
  'pénz',
  'befektet',
  'tőzsde',
  'hitel',
  'válni fog',
  'meghal',
  'hal meg',
  'halál',
  'jogi',
  'ügyvéd',
  'per ',
  'bíróság',
];

function containsTabooTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return TABOO_KEYWORDS.some((keyword) => lower.includes(keyword));
}

const TABOO_DEFLECTION_HU =
  'Ó, ebbe a kristálygömb nem lát bele - ilyesmiben orvost, szakértőt vagy jogászt kérdezz, nem egy jósnőt! ' +
  'De ha a csillagokról vagy a jegyedről szeretnél beszélgetni, szívesen mesélek tovább. ✨';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAiService implements AiService {
  private static readonly RESPONSE_DELAY_MS = 500;

  private static readonly ORACLE_RESPONSES_HU = [
    'A csillagok most különös fényben pompáznak feletted... érzem, hogy nagy változás közeleg az életedben.',
    'Hmm, a kristálygömb ködbe borul, majd kitisztul - egy régi ismerős hamarosan visszatér az életedbe.',
    'A holdév energiái most különösen erősek benned. Bízz az ösztöneidben a következő napokban!',
    'Látom, ahogy a csillagok táncot járnak körülötted - kedvező időszak vár rád a kapcsolataidban.',
    'A tenyered vonalai... nos, csak képletesen mondom, de érzem: kreatív energia árad belőled mostanában.',
    'A kínai állatöv jelenlegi ura most rád mosolyog - merj nagyot álmodni!',
  ];

  async generatePersonality(profile: Profile): Promise<string> {
    await delay(MockAiService.RESPONSE_DELAY_MS);
    const date = new Date(profile.birthDate);
    const western = getWesternSign(date);
    const chinese = getChineseSign(date);
    return (
      `${profile.name}, a csillagok szerint ${western.nameHu} vagy, ami azt jelenti, hogy ${WESTERN_TRAITS_HU[western.id]}. ` +
      `A kínai asztrológia szerint ${chinese.elementNameHu} ${chinese.animalNameHu} vagy, ${chinese.yinYangNameHu} energiával, ` +
      `így az is jellemez, hogy ${CHINESE_TRAITS_HU[chinese.animal]}. Ez a kettősség egy igazán egyedi, magával ragadó személyiséget rajzol ki.`
    );
  }

  async askOracle(profile: Profile, question: string, history: ChatMessage[]): Promise<string> {
    await delay(MockAiService.RESPONSE_DELAY_MS);
    if (containsTabooTopic(question)) {
      return TABOO_DEFLECTION_HU;
    }
    const pool = MockAiService.ORACLE_RESPONSES_HU;
    const response = pool[history.length % pool.length];
    return `${response} (${profile.name}, ezt üzenik ma a csillagok neked.)`;
  }

  async explainCompatibility(a: Profile, b: Profile, scores: CompatibilityResult): Promise<string> {
    await delay(MockAiService.RESPONSE_DELAY_MS);
    const relationPhrase = CHINESE_RELATION_PHRASES_HU[scores.chineseRelation];
    return (
      `${a.name} és ${b.name} kapcsolatában ${relationPhrase}. A nyugati elemek egymásra hatása is izgalmas ` +
      `színt visz a kapcsolatotokba. Mindent összevetve ${scores.overallScore}/100 pontos kozmikus egyezést mértünk köztetek.`
    );
  }
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  content: AnthropicContentBlock[];
}

// TODO: FONTOS - store release előtt ezt a közvetlen kliensoldali Anthropic API hívást
// KÖTELEZŐ egy backend proxy mögé rakni, hogy az API kulcs ne kerülhessen ki az app
// bundle-jéből! Az EXPO_PUBLIC_* env változók a kliens kódba égnek, bárki kiolvashatja.
export class AnthropicAiService implements AiService {
  private static readonly MODEL = 'claude-haiku-4-5-20251001';
  private static readonly MAX_TOKENS = 1024;
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';

  private async callAnthropic(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
    const response = await fetch(AnthropicAiService.API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: AnthropicAiService.MODEL,
        max_tokens: AnthropicAiService.MAX_TOKENS,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const textBlock = data.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      throw new Error('Anthropic API returned no text content');
    }
    return textBlock.text;
  }

  async generatePersonality(profile: Profile): Promise<string> {
    const prompt =
      `${describeProfile(profile)}\n\n` +
      'Írj egy 4-6 mondatos, játékos, misztikus hangvételű, magyar nyelvű személyleírást, ' +
      'amely mind a nyugati, mind a kínai jegy jellemzőit összefonja.';
    return this.callAnthropic(SYSTEM_PROMPT, [{ role: 'user', content: prompt }]);
  }

  async askOracle(profile: Profile, question: string, history: ChatMessage[]): Promise<string> {
    const system = `${SYSTEM_PROMPT}\n\nA beszélgetőpartnered: ${describeProfile(profile)}`;
    return this.callAnthropic(system, [...history, { role: 'user', content: question }]);
  }

  async explainCompatibility(a: Profile, b: Profile, scores: CompatibilityResult): Promise<string> {
    const prompt =
      `Első személy - ${describeProfile(a)}\n` +
      `Második személy - ${describeProfile(b)}\n\n` +
      `A determinisztikus kompatibilitás-számítás eredménye: összesített pontszám ${scores.overallScore}/100 ` +
      `(kínai zodiákus rész-pontszám: ${scores.chineseScore}/100, a kapcsolat jellege: ${CHINESE_RELATION_PHRASES_HU[scores.chineseRelation]}; ` +
      `nyugati elem rész-pontszám: ${scores.westernScore}/100).\n\n` +
      'Írj egy rövid, játékos, magyar nyelvű magyarázatot arról, hogy a csillagok és a kínai asztrológia szerint ' +
      'miért alakult ki ez az egyezés. Ne találj ki új pontszámot, csak magyarázd a fentit.';
    return this.callAnthropic(SYSTEM_PROMPT, [{ role: 'user', content: prompt }]);
  }
}

let cachedService: AiService | undefined;

export function getAiService(): AiService {
  if (!cachedService) {
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
    cachedService = apiKey ? new AnthropicAiService() : new MockAiService();
  }
  return cachedService;
}

export const aiService: AiService = getAiService();
