export const isCampaignExpired = (endDateStr: string | undefined): boolean => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return now > end;
};

export const getDaysLeft = (endDateStr: string | undefined): number | null => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    if (now > end) return 0;
    
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
