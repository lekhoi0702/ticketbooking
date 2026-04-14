export const STATIC_ADS = {
    HOME_BETWEEN_SECTIONS: [
        {
            ad_id: 1,
            image: '/uploads/misc/ad_20260124_085241_fc9737.jpg',
            url: '#',
            position: 'HOME_BETWEEN_SECTIONS',
        },
    ],
    EVENT_DETAIL_SIDEBAR: [
        {
            ad_id: 2,
            image: '/uploads/misc/quangcaoshopee.png',
            url: 'https://shopee.vn',
            position: 'EVENT_DETAIL_SIDEBAR',
        },
    ],
    HOME_TOP: [
        {
            ad_id: 3,
            image: '/uploads/misc/ad_20260124_085241_fc9737.jpg',
            url: '#',
            position: 'HOME_TOP',
        },
    ],
    HOME_BOTTOM: [
        {
            ad_id: 4,
            image: '/uploads/misc/quangcaoshopee.png',
            url: 'https://shopee.vn',
            position: 'HOME_BOTTOM',
        },
    ],
};

export const getStaticAdsByPosition = (position, limit = null) => {
    const ads = STATIC_ADS[position] || [];
    if (!limit || limit <= 0) {
        return ads;
    }
    return ads.slice(0, limit);
};

