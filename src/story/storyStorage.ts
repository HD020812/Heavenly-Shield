import { CampaignProgress, ChapterRecord } from './types';
import { STORY_CHAPTERS } from './storyData';

const CAMPAIGN_STORAGE_KEY = 'sky_defender_campaign_v2';

const DEFAULT_CAMPAIGN_PROGRESS: CampaignProgress = {
  unlockedChapters: [STORY_CHAPTERS[0].id],
  chapterRecords: {},
  unlockedMedals: [],
  lastPlayedChapterId: STORY_CHAPTERS[0].id,
};

export const loadCampaignProgress = (): CampaignProgress => {
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return DEFAULT_CAMPAIGN_PROGRESS;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.unlockedChapters)) {
      // Ensure at least chapter 1 is unlocked
      if (!parsed.unlockedChapters.includes(STORY_CHAPTERS[0].id)) {
        parsed.unlockedChapters.unshift(STORY_CHAPTERS[0].id);
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CAMPAIGN_PROGRESS;
};

export const saveCampaignProgress = (progress: CampaignProgress): void => {
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

export const recordChapterClear = (
  chapterId: string,
  stats: {
    score: number;
    cityIntegrityRemaining: number;
    bossDefeated?: boolean;
    targetsDestroyed: Record<string, number>;
  }
): { progress: CampaignProgress; newMedals: string[]; unlockedNextChapterId?: string } => {
  const current = loadCampaignProgress();

  // Calculate stars (1, 2, or 3)
  // 3 stars: city >= 75%
  // 2 stars: city >= 40%
  // 1 star: completed
  let stars = 1;
  if (stats.cityIntegrityRemaining >= 75) {
    stars = 3;
  } else if (stats.cityIntegrityRemaining >= 40) {
    stars = 2;
  }

  const rank = stars === 3 ? 'S' : stars === 2 ? 'A' : 'B';

  const newRecord: ChapterRecord = {
    stars,
    score: stats.score,
    rank,
    clearedAt: new Date().toISOString(),
    cityIntegrityRemaining: stats.cityIntegrityRemaining,
  };

  const existing = current.chapterRecords[chapterId];
  if (!existing || stars > existing.stars || stats.score > existing.score) {
    current.chapterRecords[chapterId] = newRecord;
  }

  // Unlock next chapter if exists
  const currentIndex = STORY_CHAPTERS.findIndex((c) => c.id === chapterId);
  let unlockedNextChapterId: string | undefined = undefined;

  if (currentIndex !== -1 && currentIndex + 1 < STORY_CHAPTERS.length) {
    const nextChapter = STORY_CHAPTERS[currentIndex + 1];
    if (!current.unlockedChapters.includes(nextChapter.id)) {
      current.unlockedChapters.push(nextChapter.id);
      unlockedNextChapterId = nextChapter.id;
    }
  }

  current.lastPlayedChapterId = chapterId;

  // Check medals
  const newMedals: string[] = [];

  const grantMedal = (medalId: string) => {
    if (!current.unlockedMedals.includes(medalId)) {
      current.unlockedMedals.push(medalId);
      newMedals.push(medalId);
    }
  };

  if (chapterId === 'ch1_night_watch' && stats.cityIntegrityRemaining >= 60) {
    grantMedal('first_blood');
  }

  if ((stats.targetsDestroyed.geran2 || 0) >= 6 || chapterId === 'ch2_shahed_horde') {
    grantMedal('shahed_hunter');
  }

  if (chapterId === 'ch3_jet_seekers') {
    grantMedal('jet_ace');
  }

  if (chapterId === 'ch4_cruise_barrier' && stats.cityIntegrityRemaining >= 70) {
    grantMedal('cruise_interceptor');
  }

  if (chapterId === 'ch5_ballistic_storm') {
    grantMedal('hypersonic_shield');
  }

  if (chapterId === 'ch6_oreshnik_reckoning' && stats.bossDefeated) {
    grantMedal('oreshnik_conqueror');
  }

  // Check 3-stars on all chapters
  const allCompletedWith3Stars = STORY_CHAPTERS.every(
    (c) => current.chapterRecords[c.id] && current.chapterRecords[c.id].stars === 3
  );
  if (allCompletedWith3Stars) {
    grantMedal('campaign_legend');
  }

  saveCampaignProgress(current);

  return { progress: current, newMedals, unlockedNextChapterId };
};

export const resetCampaignProgress = (): CampaignProgress => {
  saveCampaignProgress(DEFAULT_CAMPAIGN_PROGRESS);
  return DEFAULT_CAMPAIGN_PROGRESS;
};
