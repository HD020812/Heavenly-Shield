import { StoryChapter } from './types';
import { Mission } from '../types/game';
import { Language } from '../i18n/translations';

export const chapterToMission = (
  chapter: StoryChapter,
  language: Language = 'uk'
): Mission => {
  const title =
    language === 'en'
      ? chapter.title.en
      : language === 'ru'
      ? chapter.title.ru
      : chapter.title.uk;

  const subtitle =
    language === 'en'
      ? chapter.subtitle.en
      : language === 'ru'
      ? chapter.subtitle.ru
      : chapter.subtitle.uk;

  const description =
    language === 'en'
      ? chapter.narrativeBriefing.en
      : language === 'ru'
      ? chapter.narrativeBriefing.ru
      : chapter.narrativeBriefing.uk;

  return {
    id: chapter.id,
    number: chapter.number,
    title,
    subtitle,
    description,
    difficulty: chapter.difficulty,
    targetTypes: chapter.targetTypes,
    totalTargets: chapter.totalTargets,
    citySectors: chapter.citySectors,
    durationSeconds: chapter.durationSeconds,
    unlockedWeapons: chapter.unlockedWeapons,
    hasBoss: chapter.hasBoss,
    environment: {
      fogDensity: 0.18,
      cloudCover: 0.65,
      ambientLight: 0.05,
    },
  };
};
