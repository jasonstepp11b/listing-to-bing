export type Keyword = {
  text: string;
  matchType: 'phrase' | 'exact';
  intentScore: number; // 1–10
};

export type CampaignResponse = {
  strategy: {
    campaignType: 'buyer' | 'seller';
    targetAudience: string;
    budgetRecommendation: string;
    deviceTargeting: string;
    geoTargeting: string;
  };
  keywords: {
    buyer: Keyword[];
    seller: Keyword[];
  };
  negativeKeywords: {
    list: string[];
    rationale: string;
  };
  adCopy: {
    headlines: string[];
    descriptions: string[];
  };
  landingPage: {
    headline: string;
    subheadline: string;
    cta: string;
    bullets: string[];
    trustElements: string[];
  };
  wastedSpendTips: {
    avoidSearches: string[];
    budgetWarnings: string[];
    commonMistakes: string[];
  };
};
