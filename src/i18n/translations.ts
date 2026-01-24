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
    
    // Multi-stop
    multiStopRoute: 'Lộ trình nhiều điểm',
    stops: 'điểm dừng',
    addStop: 'Thêm điểm dừng',
    selectPointOnMap: 'Chọn điểm trên bản đồ...',
    total: 'Tổng cộng',
    startMultiStop: 'Đi nhiều điểm',
    
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
    
    // Direction instructions (for translating Mapbox)
    turnLeft: 'Rẽ trái',
    turnRight: 'Rẽ phải',
    turnSlightLeft: 'Rẽ nhẹ sang trái',
    turnSlightRight: 'Rẽ nhẹ sang phải',
    turnSharpLeft: 'Rẽ gấp sang trái',
    turnSharpRight: 'Rẽ gấp sang phải',
    continueOn: 'Tiếp tục đi',
    arrive: 'Đến nơi',
    arriveDestination: 'Bạn đã đến điểm đích',
    depart: 'Bắt đầu',
    straight: 'Đi thẳng',
    uturn: 'Quay đầu',
    roundabout: 'Đi vòng xuyến',
    merge: 'Nhập làn',
    fork: 'Rẽ ngã ba',
    endOfRoad: 'Cuối đường',
    newName: 'Tiếp tục theo',
    onThe: 'ở phía',
    left: 'trái',
    right: 'phải',
    
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
    
    // Voucher texts
    voucherDiscount20Student: 'Giảm 20% cho sinh viên',
    voucherBuy2Get1: 'Mua 2 tặng 1',
    voucherDiscount500kFirstMonth: 'Giảm 500k tháng đầu',
    voucherFreeDrink: 'Tặng nước uống',
    voucherBogo: 'Mua 1 tặng 1 (T2-T4)',
    
    // Location descriptions
    lectureHall: 'Giảng đường',
    dormitory: 'Ký túc xá',
    student: 'Sinh viên',
    parking: 'Nhà xe',
    gate: 'Cổng',
    entrance: 'Lối vào',
    security: 'Bảo vệ',
    safetyGuard: 'An ninh',
    sports: 'Thể thao',
    health: 'Sức khỏe',
    medical: 'Y tế',
    administration: 'Hành chính',
    innovation: 'Đổi mới',
    startup: 'Khởi nghiệp',
    bank: 'Ngân hàng',
    atm: 'ATM',
    lake: 'Hồ',
    relaxation: 'Thư giãn',
    landscape: 'Cảnh quan',
    sportsField: 'Sân bóng',
    carParking: 'Đỗ xe ô tô',
    checkin: 'Check-in',
    lecture_hall: 'Giảng đường',
    office: 'Văn phòng',
    cafe: 'Café',
    entertainment: 'Vui chơi',
    food: 'Quán ăn',
    building: 'Tòa nhà',
    job: 'Việc làm',
    housing: 'Nhà trọ',
    // Food related
    coffee: 'Cà phê',
    studySpace: 'Không gian học tập',
    wifi: 'Wifi',
    pastry: 'Bánh ngọt',
    group: 'Nhóm',
    milkTea: 'Trà sữa',
    cheap: 'Giá rẻ',
    nearSchool: 'Gần trường',
    aesthetic: 'Sống ảo',
    
    // Housing
    safe: 'An ninh',
    // Jobs
    partTime: 'Part-time',
    sales: 'Bán hàng',
    evening: 'Tối',
    selectCategory: 'Chọn danh mục',
    category: 'Danh mục',
    save: 'Lưu thông tin',
    cancel: 'Hủy',
    premium: 'VIP',
  },
  en: {
    lecture_hall: 'Lecture Hall',
    checkin: 'Check-in',
    office: 'Office',
    cafe: 'Cafe',
    entertainment: 'Entertainment',
    food: 'Food',
    building: 'Building',
    job: 'Job',
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
    category: 'Category',
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
    
    // Multi-stop
    multiStopRoute: 'Multi-stop Route',
    stops: 'stops',
    addStop: 'Add stop',
    selectPointOnMap: 'Select point on map...',
    total: 'Total',
    startMultiStop: 'Multi-stop',
    
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
    
    // Direction instructions
    turnLeft: 'Turn left',
    turnRight: 'Turn right',
    turnSlightLeft: 'Turn slight left',
    turnSlightRight: 'Turn slight right',
    turnSharpLeft: 'Turn sharp left',
    turnSharpRight: 'Turn sharp right',
    continueOn: 'Continue on',
    arrive: 'Arrive',
    arriveDestination: 'You have arrived at your destination',
    depart: 'Depart',
    straight: 'Go straight',
    uturn: 'Make a U-turn',
    roundabout: 'Enter roundabout',
    merge: 'Merge',
    fork: 'Take fork',
    endOfRoad: 'End of road',
    newName: 'Continue onto',
    onThe: 'on the',
    left: 'left',
    right: 'right',
    
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
    
    // Voucher texts
    voucherDiscount20Student: '20% off for students',
    voucherBuy2Get1: 'Buy 2 get 1 free',
    voucherDiscount500kFirstMonth: '500k off first month',
    voucherFreeDrink: 'Free drink included',
    voucherBogo: 'Buy 1 get 1 free (Mon-Wed)',
    
    // Location descriptions
    lectureHall: 'Lecture Hall',
    dormitory: 'Dormitory',
    student: 'Student',
    parking: 'Parking',
    gate: 'Gate',
    entrance: 'Entrance',
    security: 'Security',
    safetyGuard: 'Safety Guard',
    sports: 'Sports',
    health: 'Health',
    medical: 'Medical',
    administration: 'Administration',
    innovation: 'Innovation',
    startup: 'Startup',
    bank: 'Bank',
    atm: 'ATM',
    lake: 'Lake',
    relaxation: 'Relaxation',
    landscape: 'Landscape',
    sportsField: 'Sports Field',
    carParking: 'Car Parking',
    
    // Food related
    coffee: 'Coffee',
    studySpace: 'Study Space',
    wifi: 'WiFi',
    pastry: 'Pastry',
    group: 'Group',
    milkTea: 'Milk Tea',
    cheap: 'Budget-friendly',
    nearSchool: 'Near Campus',
    aesthetic: 'Aesthetic',
    
    // Housing
    housing: 'Housing',
    safe: 'Safe',
    
    // Jobs
    partTime: 'Part-time',
    sales: 'Sales',
    evening: 'Evening',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
