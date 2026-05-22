export const STATIC_ADS = {
    HOME_BETWEEN_SECTIONS: [],
    EVENT_DETAIL_SIDEBAR: [],
    HOME_TOP: [],
    HOME_BOTTOM: [],
};

export const getStaticAdsByPosition = (position, limit = null) => {
    const ads = STATIC_ADS[position] || [];
    if (!limit || limit <= 0) {
        return ads;
    }
    return ads.slice(0, limit);
};

