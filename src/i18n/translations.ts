export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // App header
    appName: 'UniPocket',
    appTagline: 'Campus & Lifestyle Map',
    
    // Search
    searchPlaceholder: 'Tìm phòng ban, tòa nhà, hoặc quán ngon...',
    
    // Categories
    categoryBuilding: 'Tòa nhà',
    categoryFood: 'Ăn uống',
    categoryHousing: 'Nhà trọ',
    categoryJob: 'Việc làm',
    
    // Bottom sheet
    reviews: 'Đánh giá',
    departments: 'Phòng ban',
    floor: 'Tầng',
    room: 'Phòng',
    roomShort: 'P.',
    seeMore: 'Xem thêm',
    directions: 'Chỉ đường',
    sponsored: 'Được tài trợ',
    viewNow: 'Xem ngay',
    reviewCount: '{count} đánh giá',
    
    // Directions panel
    navigatingTo: 'Đang chỉ đường đến',
    calculatingRoute: 'Đang tính toán tuyến đường...',
    hideInstructions: 'Ẩn hướng dẫn',
    viewSteps: 'Xem {count} bước hướng dẫn',
    continueStright: 'Tiếp tục đi thẳng',
    youAreHere: '← Bạn đang ở đây',
    next: 'Tiếp theo:',
    continue: 'Tiếp tục',
    accuracy: 'Độ chính xác',
    remaining: 'Còn',
    
    // Transport modes
    walking: 'Đi bộ',
    cycling: 'Xe máy',
    driving: 'Ô tô',
    
    // Route preferences
    shortest: 'Ngắn nhất',
    fastest: 'Nhanh nhất',
    
    // Time/Distance
    minutes: 'phút',
    hours: 'giờ',
    meters: 'm',
    kilometers: 'km',
    
    // Errors
    locationError: 'Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.',
    browserNoLocation: 'Trình duyệt không hỗ trợ định vị',
    offRouteWarning: 'Bạn đã đi lệch tuyến đường. Đang tính toán lại...',
    tokenNotConfigured: 'Mapbox Token chưa được cấu hình',
    
    // Mapbox token prompt
    mapboxTokenRequired: 'Cần Mapbox Token để xem bản đồ',
    mapboxTokenInstructions: 'Dán Access Token của bạn (public token) để chạy demo ngay.',
    tokenPlaceholder: 'pk.eyJ1Ijoi...',
    saveTokenAndLoad: 'Lưu token & tải bản đồ',
    tokenSavedInBrowser: 'Token sẽ được lưu trong trình duyệt (localStorage).',
    tokenEmptyError: 'Vui lòng dán Mapbox Access Token',
    tokenTooShortError: 'Token có vẻ chưa đúng (quá ngắn)',
    
    // Language
    language: 'Ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
  },
  en: {
    // App header
    appName: 'UniPocket',
    appTagline: 'Campus & Lifestyle Map',
    
    // Search
    searchPlaceholder: 'Search departments, buildings, or restaurants...',
    
    // Categories
    categoryBuilding: 'Buildings',
    categoryFood: 'Food & Drink',
    categoryHousing: 'Housing',
    categoryJob: 'Jobs',
    
    // Bottom sheet
    reviews: 'Reviews',
    departments: 'Departments',
    floor: 'Floor',
    room: 'Room',
    roomShort: 'R.',
    seeMore: 'See more',
    directions: 'Directions',
    sponsored: 'Sponsored',
    viewNow: 'View now',
    reviewCount: '{count} reviews',
    
    // Directions panel
    navigatingTo: 'Navigating to',
    calculatingRoute: 'Calculating route...',
    hideInstructions: 'Hide instructions',
    viewSteps: 'View {count} steps',
    continueStright: 'Continue straight',
    youAreHere: '← You are here',
    next: 'Next:',
    continue: 'Continue',
    accuracy: 'Accuracy',
    remaining: 'Remaining',
    
    // Transport modes
    walking: 'Walk',
    cycling: 'Bike',
    driving: 'Drive',
    
    // Route preferences
    shortest: 'Shortest',
    fastest: 'Fastest',
    
    // Time/Distance
    minutes: 'min',
    hours: 'hr',
    meters: 'm',
    kilometers: 'km',
    
    // Errors
    locationError: 'Unable to get your location. Please allow location access.',
    browserNoLocation: 'Browser does not support geolocation',
    offRouteWarning: 'You are off route. Recalculating...',
    tokenNotConfigured: 'Mapbox Token not configured',
    
    // Mapbox token prompt
    mapboxTokenRequired: 'Mapbox Token required to view the map',
    mapboxTokenInstructions: 'Paste your Access Token (public token) to run the demo.',
    tokenPlaceholder: 'pk.eyJ1Ijoi...',
    saveTokenAndLoad: 'Save token & load map',
    tokenSavedInBrowser: 'Token will be saved in browser (localStorage).',
    tokenEmptyError: 'Please paste your Mapbox Access Token',
    tokenTooShortError: 'Token seems invalid (too short)',
    
    // Language
    language: 'Language',
    vietnamese: 'Tiếng Việt',
    english: 'English',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
