import json

content = """export type Category =
  | 'Tech'
  | 'Art'
  | 'Sports'
  | 'Charity'
  | 'Music'
  | 'Business'
  | 'Debate'

export type Club = {
  id: string
  name: string
  category: Category
  faculty: string
  members: number
  tagline: string
  description: string
  image: string
  achievements: string[]
  events: { title: string; date: string; location: string }[]
  openRoles: string[]
}

export const categories = {
  en: ['Tech', 'Art', 'Sports', 'Charity', 'Music', 'Business', 'Debate'],
  ar: ['تكنولوجيا', 'فنون', 'رياضة', 'أعمال خيرية', 'موسيقى', 'أعمال', 'مناظرات']
}

export const faculties = {
  en: [
    'Medicine',
    'Dentistry',
    'Pharmacy - PharmD Manchester',
    'Clinical Pharmacy',
    'Engineering',
    'Nursing',
    'Applied Health Sciences Technology',
    'Business & Economics',
    'Arts & Humanities',
    'Physical Therapy',
  ],
  ar: [
    'كلية الطب البشري',
    'كلية طب الأسنان',
    'كلية الصيدلة – فارم دي مانشستر',
    'كلية الصيدلة الإكلينيكية',
    'كلية الهندسة',
    'كلية التمريض',
    'كلية تكنولوجيا العلوم الصحية التطبيقية',
    'كلية الاقتصاد والعلوم الإدارية',
    'كلية الآداب والعلوم الإنسانية',
    'كلية العلاج الطبيعي',
  ]
}

export const clubs = {
  en: [
    {
      id: 'robotics',
      name: 'Robotics & AI Society',
      category: 'Tech' as Category,
      faculty: 'Engineering',
      members: 842,
      tagline: 'Build the machines of tomorrow, today.',
      description: 'A community of makers, coders, and dreamers building autonomous robots, competing in national challenges, and running weekly hardware + AI workshops for all skill levels.',
      image: '/clubs/robotics.png',
      achievements: ['1st place — National Robotics Championship 2025', 'Published 3 papers at the Student AI Symposium', 'Built the campus autonomous delivery bot'],
      events: [{ title: 'Intro to ROS 2 Workshop', date: 'Mar 12', location: 'Eng. Lab B4' }, { title: 'Battle Bots Night', date: 'Mar 24', location: 'Main Arena' }],
      openRoles: ['Firmware Engineer', 'ML Researcher', 'Design Lead'],
    },
    {
      id: 'fine-arts',
      name: 'Canvas Collective',
      category: 'Art' as Category,
      faculty: 'Arts & Humanities',
      members: 415,
      tagline: 'Where every idea finds a color.',
      description: 'From digital illustration to gallery exhibitions, Canvas Collective is the creative home for painters, designers, and visual storytellers on campus.',
      image: '/clubs/art.png',
      achievements: ['Hosted the annual Spring Student Gallery', 'Mural commission for the new Student Union', 'Featured in the City Young Artists Fair'],
      events: [{ title: 'Live Life Drawing', date: 'Mar 15', location: 'Studio 2' }, { title: 'Digital Art Jam', date: 'Mar 28', location: 'Design Hub' }],
      openRoles: ['Exhibition Curator', 'Social Media Artist'],
    },
    {
      id: 'athletics',
      name: 'Velocity Athletics',
      category: 'Sports' as Category,
      faculty: 'Applied Health Sciences Technology',
      members: 1203,
      tagline: 'Faster. Stronger. Together.',
      description: 'The largest multi-sport club on campus, running training squads, inter-university leagues, and fitness socials across athletics, football, and more.',
      image: '/clubs/sports.png',
      achievements: ['Regional League Champions 2025', 'Sent 12 athletes to the National Games', 'Raised the campus fitness participation by 40%'],
      events: [{ title: 'Track Trials', date: 'Mar 10', location: 'Athletics Field' }, { title: 'Inter-Faculty Cup', date: 'Apr 02', location: 'Main Stadium' }],
      openRoles: ['Team Captain', 'Fitness Coach', 'Events Coordinator'],
    },
    {
      id: 'charity',
      name: 'Impact Volunteers',
      category: 'Charity' as Category,
      faculty: 'Medicine',
      members: 567,
      tagline: 'Small actions, campus-wide change.',
      description: 'A student-led charity network organising community drives, fundraising campaigns, and volunteering placements that make a measurable local impact.',
      image: '/clubs/charity.png',
      achievements: ['Raised $85k for local shelters in 2025', 'Ran 20+ community volunteering days', 'Winner of the University Social Impact Award'],
      events: [{ title: 'Charity Bake Sale', date: 'Mar 18', location: 'Central Quad' }, { title: 'Community Clean-up', date: 'Mar 30', location: 'Riverside Park' }],
      openRoles: ['Fundraising Lead', 'Community Liaison'],
    },
    {
      id: 'music',
      name: 'Amplitude Music Club',
      category: 'Music' as Category,
      faculty: 'Arts & Humanities',
      members: 389,
      tagline: 'Turn the campus up to eleven.',
      description: 'Bands, producers, DJs and vocalists collaborating on live gigs, open mics, and a student-run recording studio open every week.',
      image: '/clubs/music.png',
      achievements: ['Headlined the Summer Campus Festival', 'Released a 10-track student compilation album', 'Opened a free student recording studio'],
      events: [{ title: 'Open Mic Night', date: 'Mar 14', location: 'The Basement' }, { title: 'Producer Meetup', date: 'Mar 26', location: 'Studio A' }],
      openRoles: ['Sound Engineer', 'Event Host', 'Studio Manager'],
    },
    {
      id: 'business',
      name: 'Founders Guild',
      category: 'Business' as Category,
      faculty: 'Business & Economics',
      members: 731,
      tagline: 'From dorm room to boardroom.',
      description: 'An entrepreneurship community running pitch nights, startup accelerators, and mentorship with alumni founders and venture partners.',
      image: '/clubs/business.png',
      achievements: ['4 student startups funded in 2025', 'Ran the campus $10k pitch competition', 'Mentorship from 30+ alumni founders'],
      events: [{ title: 'Pitch Perfect Night', date: 'Mar 20', location: 'Business Atrium' }, { title: 'Founder Fireside', date: 'Apr 05', location: 'Lecture Hall 1' }],
      openRoles: ['Growth Lead', 'Partnerships Manager'],
    },
    {
      id: 'debate',
      name: 'Oxford Debate Union',
      category: 'Debate' as Category,
      faculty: 'Business & Economics',
      members: 298,
      tagline: 'Sharpen your mind, own the room.',
      description: 'Competitive and casual debating, public speaking coaching, and a weekly forum on the ideas shaping the world.',
      image: '/clubs/debate.png',
      achievements: ['National Debate Semi-finalists 2025', 'Hosted 3 inter-university tournaments', 'Public speaking bootcamp for 200+ students'],
      events: [{ title: 'Weekly Motion Debate', date: 'Mar 13', location: 'Moot Court' }, { title: 'Rhetoric Workshop', date: 'Mar 27', location: 'Law Room 3' }],
      openRoles: ['Head of Debating', 'Coaching Lead'],
    }
  ],
  ar: [
    {
      id: 'robotics',
      name: 'نادي الروبوتات والذكاء الاصطناعي',
      category: 'Tech' as Category,
      faculty: 'كلية الهندسة',
      members: 842,
      tagline: 'ابنِ آلات الغد، اليوم.',
      description: 'مجتمع من المبدعين والمبرمجين والحالمين الذين يبنون روبوتات ذاتية القيادة، ويتنافسون في تحديات وطنية، ويديرون ورش عمل أسبوعية للعتاد والذكاء الاصطناعي لجميع المستويات.',
      image: '/clubs/robotics.png',
      achievements: ['المركز الأول — البطولة الوطنية للروبوتات 2025', 'نشر 3 أبحاث في ندوة الذكاء الاصطناعي للطلاب', 'بناء روبوت توصيل ذاتي القيادة داخل الحرم الجامعي'],
      events: [{ title: 'مقدمة في ROS 2', date: '12 مارس', location: 'معمل الهندسة B4' }, { title: 'ليلة معارك الروبوتات', date: '24 مارس', location: 'الساحة الرئيسية' }],
      openRoles: ['مهندس أنظمة مدمجة', 'باحث تعلم آلي', 'قائد تصميم'],
    },
    {
      id: 'fine-arts',
      name: 'تجمع اللوحات الفنية',
      category: 'Art' as Category,
      faculty: 'كلية الآداب والعلوم الإنسانية',
      members: 415,
      tagline: 'حيث تجد كل فكرة لونها.',
      description: 'من الرسم الرقمي إلى معارض الصالات، يعتبر هذا التجمع الموطن الإبداعي للرسامين والمصممين ورواة القصص البصرية في الحرم الجامعي.',
      image: '/clubs/art.png',
      achievements: ['استضافة معرض الربيع الطلابي السنوي', 'تكليف برسم جدارية لاتحاد الطلاب الجديد', 'مشاركة في معرض المدينة للفنانين الشباب'],
      events: [{ title: 'رسم حي مباشر', date: '15 مارس', location: 'استوديو 2' }, { title: 'ملتقى الفن الرقمي', date: '28 مارس', location: 'مركز التصميم' }],
      openRoles: ['منسق معارض', 'فنان وسائل التواصل الاجتماعي'],
    },
    {
      id: 'athletics',
      name: 'فريق ألعاب القوى',
      category: 'Sports' as Category,
      faculty: 'كلية تكنولوجيا العلوم الصحية التطبيقية',
      members: 1203,
      tagline: 'أسرع. أقوى. معاً.',
      description: 'أكبر نادٍ رياضي متعدد الرياضات في الحرم الجامعي، يدير فرق تدريب وبطولات بين الجامعات وفعاليات لياقة بدنية عبر ألعاب القوى وكرة القدم والمزيد.',
      image: '/clubs/sports.png',
      achievements: ['أبطال الدوري الإقليمي 2025', 'إرسال 12 رياضياً للألعاب الوطنية', 'زيادة المشاركة في اللياقة البدنية بالحرم الجامعي بنسبة 40%'],
      events: [{ title: 'تجارب المضمار', date: '10 مارس', location: 'ميدان ألعاب القوى' }, { title: 'كأس الكليات', date: '02 أبريل', location: 'الملعب الرئيسي' }],
      openRoles: ['كابتن الفريق', 'مدرب لياقة بدنية', 'منسق فعاليات'],
    },
    {
      id: 'charity',
      name: 'متطوعو الأثر',
      category: 'Charity' as Category,
      faculty: 'كلية الطب البشري',
      members: 567,
      tagline: 'أفعال صغيرة، تغيير يشمل الحرم الجامعي.',
      description: 'شبكة خيرية يقودها الطلاب تنظم حملات مجتمعية، وحملات لجمع التبرعات، وتدريبات تطوعية تحدث أثراً محلياً ملموساً.',
      image: '/clubs/charity.png',
      achievements: ['جمع 85 ألف دولار للملاجئ المحلية في 2025', 'إدارة أكثر من 20 يوم عمل تطوعي مجتمعي', 'الفائز بجائزة التأثير الاجتماعي الجامعي'],
      events: [{ title: 'بيع المخبوزات الخيري', date: '18 مارس', location: 'الساحة المركزية' }, { title: 'حملة تنظيف المجتمع', date: '30 مارس', location: 'حديقة النهر' }],
      openRoles: ['مسؤول جمع التبرعات', 'مسؤول العلاقات المجتمعية'],
    },
    {
      id: 'music',
      name: 'نادي السعة الموسيقية',
      category: 'Music' as Category,
      faculty: 'كلية الآداب والعلوم الإنسانية',
      members: 389,
      tagline: 'ارفع صوت الحرم الجامعي إلى أقصى حد.',
      description: 'فرق موسيقية، ومنتجون، ومنسقو موسيقى، ومغنون يتعاونون في حفلات حية، وليالي الميكروفون المفتوح، واستوديو تسجيل يديره الطلاب مفتوح كل أسبوع.',
      image: '/clubs/music.png',
      achievements: ['إحياء مهرجان الحرم الجامعي الصيفي', 'إصدار ألبوم طلابي من 10 مقاطع', 'افتتاح استوديو تسجيل طلابي مجاني'],
      events: [{ title: 'ليلة الميكروفون المفتوح', date: '14 مارس', location: 'القبو' }, { title: 'ملتقى المنتجين', date: '26 مارس', location: 'استوديو A' }],
      openRoles: ['مهندس صوت', 'مقدم فعاليات', 'مدير استوديو'],
    },
    {
      id: 'business',
      name: 'رابطة المؤسسين',
      category: 'Business' as Category,
      faculty: 'كلية الاقتصاد والعلوم الإدارية',
      members: 731,
      tagline: 'من غرفة السكن إلى قاعة مجلس الإدارة.',
      description: 'مجتمع ريادة أعمال يدير ليالي عرض المشاريع، ومسرعات الشركات الناشئة، وإرشاد من مؤسسين خريجين وشركاء استثمار.',
      image: '/clubs/business.png',
      achievements: ['تمويل 4 شركات طلابية ناشئة في 2025', 'إدارة مسابقة العروض التقديمية بقيمة 10 آلاف دولار', 'إرشاد من أكثر من 30 مؤسس خريج'],
      events: [{ title: 'ليلة العروض التقديمية', date: '20 مارس', location: 'ردهة الأعمال' }, { title: 'لقاء المؤسسين', date: '05 أبريل', location: 'قاعة المحاضرات 1' }],
      openRoles: ['قائد نمو', 'مدير شراكات'],
    },
    {
      id: 'debate',
      name: 'اتحاد أكسفورد للمناظرات',
      category: 'Debate' as Category,
      faculty: 'كلية الاقتصاد والعلوم الإدارية',
      members: 298,
      tagline: 'شحذ عقلك، وامتلك الغرفة.',
      description: 'مناظرات تنافسية وودية، تدريب على التحدث أمام الجمهور، ومنتدى أسبوعي حول الأفكار التي تشكل العالم.',
      image: '/clubs/debate.png',
      achievements: ['المتأهلون لنصف نهائي المناظرات الوطنية 2025', 'استضافة 3 بطولات بين الجامعات', 'معسكر تدريبي للتحدث أمام الجمهور لأكثر من 200 طالب'],
      events: [{ title: 'مناظرة الاقتراح الأسبوعية', date: '13 مارس', location: 'قاعة المحكمة الصورية' }, { title: 'ورشة فن الخطابة', date: '27 مارس', location: 'غرفة القانون 3' }],
      openRoles: ['رئيس المناظرات', 'قائد التدريب'],
    }
  ]
}

export type ApplicationStatus = 'Pending' | 'Interview Scheduled' | 'Accepted' | 'Reviewing'

export type StudentApplication = {
  id: string
  clubId: string
  clubName: string
  role: string
  submitted: string
  status: Exclude<ApplicationStatus, 'Reviewing'>
  note: string
}

export const studentApplications = {
  en: [
    { id: 'a1', clubId: 'robotics', clubName: 'Robotics & AI Society', role: 'ML Researcher', submitted: 'Mar 2, 2026', status: 'Interview Scheduled' as any, note: 'Interview on Mar 16, 3:00 PM — Eng. Lab B4' },
    { id: 'a2', clubId: 'business', clubName: 'Founders Guild', role: 'Growth Lead', submitted: 'Feb 28, 2026', status: 'Accepted' as any, note: 'Welcome aboard! Onboarding kit sent to your inbox.' },
    { id: 'a3', clubId: 'music', clubName: 'Amplitude Music Club', role: 'Sound Engineer', submitted: 'Mar 4, 2026', status: 'Pending' as any, note: 'Application under review by the recruitment team.' },
  ],
  ar: [
    { id: 'a1', clubId: 'robotics', clubName: 'نادي الروبوتات والذكاء الاصطناعي', role: 'باحث تعلم آلي', submitted: '2 مارس 2026', status: 'Interview Scheduled' as any, note: 'المقابلة يوم 16 مارس، 3:00 م — معمل الهندسة B4' },
    { id: 'a2', clubId: 'business', clubName: 'رابطة المؤسسين', role: 'قائد نمو', submitted: '28 فبراير 2026', status: 'Accepted' as any, note: 'مرحباً بك معنا! تم إرسال حزمة الترحيب إلى بريدك الإلكتروني.' },
    { id: 'a3', clubId: 'music', clubName: 'نادي السعة الموسيقية', role: 'مهندس صوت', submitted: '4 مارس 2026', status: 'Pending' as any, note: 'الطلب قيد المراجعة من قبل فريق التوظيف.' },
  ]
}

export type Applicant = {
  id: string
  name: string
  faculty: string
  year: string
  role: string
  stage: 'Reviewing' | 'Interview' | 'Accepted'
  score: number
  portfolio: string
  cvLink?: string
  motivation?: string
  email?: string
  whatsapp?: string
  studentId?: string
  submittedAt?: string
}

export const applicants = {
  en: [
    { id: 'p1', name: 'Maya Chen', faculty: 'Engineering', year: 'Year 2', role: 'Firmware Engineer', stage: 'Reviewing' as any, score: 88, portfolio: 'github.com/mayac' },
    { id: 'p2', name: 'Liam Okafor', faculty: 'Applied Health Sciences Technology', year: 'Year 3', role: 'ML Researcher', stage: 'Reviewing' as any, score: 91, portfolio: 'liam.dev' },
    { id: 'p3', name: 'Sofia Ramos', faculty: 'Engineering', year: 'Year 1', role: 'Design Lead', stage: 'Interview' as any, score: 84, portfolio: 'dribbble.com/sofiar' },
    { id: 'p4', name: 'Noah Patel', faculty: 'Business & Economics', year: 'Year 2', role: 'ML Researcher', stage: 'Interview' as any, score: 79, portfolio: 'noahp.io' },
    { id: 'p5', name: 'Emma Wright', faculty: 'Applied Health Sciences Technology', year: 'Year 4', role: 'Firmware Engineer', stage: 'Accepted' as any, score: 95, portfolio: 'github.com/emmaw' },
  ],
  ar: [
    { id: 'p1', name: 'مايا تشين', faculty: 'كلية الهندسة', year: 'السنة الثانية', role: 'مهندس أنظمة مدمجة', stage: 'Reviewing' as any, score: 88, portfolio: 'github.com/mayac' },
    { id: 'p2', name: 'ليام أوكافور', faculty: 'كلية تكنولوجيا العلوم الصحية التطبيقية', year: 'السنة الثالثة', role: 'باحث تعلم آلي', stage: 'Reviewing' as any, score: 91, portfolio: 'liam.dev' },
    { id: 'p3', name: 'صوفيا راموس', faculty: 'كلية الهندسة', year: 'السنة الأولى', role: 'قائد تصميم', stage: 'Interview' as any, score: 84, portfolio: 'dribbble.com/sofiar' },
    { id: 'p4', name: 'نوح باتيل', faculty: 'كلية الاقتصاد والعلوم الإدارية', year: 'السنة الثانية', role: 'باحث تعلم آلي', stage: 'Interview' as any, score: 79, portfolio: 'noahp.io' },
    { id: 'p5', name: 'إيما رايت', faculty: 'كلية تكنولوجيا العلوم الصحية التطبيقية', year: 'السنة الرابعة', role: 'مهندس أنظمة مدمجة', stage: 'Accepted' as any, score: 95, portfolio: 'github.com/emmaw' },
  ]
}

export const pipelineStages = {
  en: ['Reviewing', 'Interview', 'Accepted'],
  ar: ['قيد المراجعة', 'مقابلة', 'مقبول']
}

export type TeamRole = 'Leader' | 'Vice Leader' | 'Member'

export type Member = {
  id: string
  name: string
  initials: string
  department: string
  role: TeamRole
  joined: string
  attendance: number
  tasksDone: number
  email?: string
  phone?: string
  userId?: string
}

export const activeTeam = {
  en: { name: 'Robotics & AI Society', handle: '@robotics', faculty: 'Engineering' },
  ar: { name: 'نادي الروبوتات والذكاء الاصطناعي', handle: '@robotics', faculty: 'كلية الهندسة' }
}

export const members = {
  en: [
    { id: 'm1', name: 'Adam Hafez', initials: 'AH', department: 'Software', role: 'Leader' as TeamRole, joined: 'Sep 2023', attendance: 98, tasksDone: 64 },
    { id: 'm2', name: 'Nour El-Sayed', initials: 'NE', department: 'Recruitment', role: 'Vice Leader' as TeamRole, joined: 'Oct 2023', attendance: 95, tasksDone: 51 },
    { id: 'm3', name: 'Yassin Fouad', initials: 'YF', department: 'Hardware', role: 'Vice Leader' as TeamRole, joined: 'Jan 2024', attendance: 90, tasksDone: 47 },
    { id: 'm4', name: 'Salma Adel', initials: 'SA', department: 'Machine Learning', role: 'Member' as TeamRole, joined: 'Feb 2024', attendance: 88, tasksDone: 33 },
    { id: 'm5', name: 'Karim Mostafa', initials: 'KM', department: 'Software', role: 'Member' as TeamRole, joined: 'Feb 2024', attendance: 76, tasksDone: 21 },
    { id: 'm6', name: 'Habiba Tarek', initials: 'HT', department: 'Design', role: 'Member' as TeamRole, joined: 'Mar 2024', attendance: 82, tasksDone: 18 },
    { id: 'm7', name: 'Omar Zaki', initials: 'OZ', department: 'Hardware', role: 'Member' as TeamRole, joined: 'Mar 2024', attendance: 71, tasksDone: 14 },
  ],
  ar: [
    { id: 'm1', name: 'آدم حافظ', initials: 'آح', department: 'البرمجيات', role: 'Leader' as TeamRole, joined: 'سبتمبر 2023', attendance: 98, tasksDone: 64 },
    { id: 'm2', name: 'نور السيد', initials: 'نس', department: 'التوظيف', role: 'Vice Leader' as TeamRole, joined: 'أكتوبر 2023', attendance: 95, tasksDone: 51 },
    { id: 'm3', name: 'ياسين فؤاد', initials: 'يف', department: 'العتاد', role: 'Vice Leader' as TeamRole, joined: 'يناير 2024', attendance: 90, tasksDone: 47 },
    { id: 'm4', name: 'سلمى عادل', initials: 'سع', department: 'تعلم الآلة', role: 'Member' as TeamRole, joined: 'فبراير 2024', attendance: 88, tasksDone: 33 },
    { id: 'm5', name: 'كريم مصطفى', initials: 'كم', department: 'البرمجيات', role: 'Member' as TeamRole, joined: 'فبراير 2024', attendance: 76, tasksDone: 21 },
    { id: 'm6', name: 'حبيبة طارق', initials: 'حط', department: 'التصميم', role: 'Member' as TeamRole, joined: 'مارس 2024', attendance: 82, tasksDone: 18 },
    { id: 'm7', name: 'عمر زكي', initials: 'عز', department: 'العتاد', role: 'Member' as TeamRole, joined: 'مارس 2024', attendance: 71, tasksDone: 14 },
  ]
}

export const currentMember = {
  en: { name: 'Salma Adel', initials: 'SA', department: 'Machine Learning', role: 'Member' as TeamRole, joined: 'Feb 2024', team: 'Robotics & AI Society' },
  ar: { name: 'سلمى عادل', initials: 'سع', department: 'تعلم الآلة', role: 'Member' as TeamRole, joined: 'فبراير 2024', team: 'نادي الروبوتات والذكاء الاصطناعي' }
}

export type Announcement = {
  id: string
  title: string
  body: string
  author: string
  date: string
  pinned: boolean
}

export const announcements = {
  en: [
    { id: 'an1', title: 'Battle Bots Night — all hands on deck', body: 'We need every squad to finalize their bots by Mar 22. Sign up for a test slot in the #arena channel.', author: 'Adam Hafez', date: 'Mar 8, 2026', pinned: true },
    { id: 'an2', title: 'New ML study group starting', body: 'Salma is running a weekly ML reading group every Tuesday at 6 PM in Eng. Lab B4. Open to all members.', author: 'Nour El-Sayed', date: 'Mar 6, 2026', pinned: false },
    { id: 'an3', title: 'Sponsorship secured 🎉', body: 'We just landed a hardware sponsorship — new sensors and boards arrive next week. Thanks to the partnerships team!', author: 'Adam Hafez', date: 'Mar 3, 2026', pinned: false },
  ],
  ar: [
    { id: 'an1', title: 'ليلة معارك الروبوتات — استعداد الجميع', body: 'نحتاج من كل فرقة الانتهاء من روبوتاتهم بحلول 22 مارس. سجل لاختبار في قناة الساحة.', author: 'آدم حافظ', date: '8 مارس 2026', pinned: true },
    { id: 'an2', title: 'بدء مجموعة دراسة تعلم الآلة جديدة', body: 'تدير سلمى مجموعة قراءة أسبوعية لتعلم الآلة كل ثلاثاء في الساعة 6 مساءً في معمل الهندسة B4. متاح لجميع الأعضاء.', author: 'نور السيد', date: '6 مارس 2026', pinned: false },
    { id: 'an3', title: 'تم تأمين الرعاية 🎉', body: 'لقد حصلنا للتو على رعاية للعتاد — مستشعرات ولوحات جديدة تصل الأسبوع القادم. شكراً لفريق الشراكات!', author: 'آدم حافظ', date: '3 مارس 2026', pinned: false },
  ]
}

export type Task = {
  id: string
  title: string
  due: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'To Do' | 'In Progress' | 'Done'
  assigneeName?: string
  assigneeId?: string
  submissionType?: 'whatsapp' | 'link' | 'none'
  submissionValue?: string
}

export const myTasks = {
  en: [
    { id: 't1', title: 'Train the object-detection model on new dataset', due: 'Mar 14', priority: 'High' as any, status: 'In Progress' as any },
    { id: 't2', title: 'Document the vision pipeline for the wiki', due: 'Mar 18', priority: 'Medium' as any, status: 'To Do' as any },
    { id: 't3', title: 'Review Karim’s pull request', due: 'Mar 12', priority: 'High' as any, status: 'To Do' as any },
    { id: 't4', title: 'Prepare slides for the ML study group', due: 'Mar 10', priority: 'Low' as any, status: 'Done' as any },
  ],
  ar: [
    { id: 't1', title: 'تدريب نموذج الكشف عن الكائنات على البيانات الجديدة', due: '14 مارس', priority: 'High' as any, status: 'In Progress' as any },
    { id: 't2', title: 'توثيق مسار الرؤية للموسوعة', due: '18 مارس', priority: 'Medium' as any, status: 'To Do' as any },
    { id: 't3', title: 'مراجعة طلب السحب الخاص بكريم', due: '12 مارس', priority: 'High' as any, status: 'To Do' as any },
    { id: 't4', title: 'تجهيز شرائح العرض لمجموعة دراسة تعلم الآلة', due: '10 مارس', priority: 'Low' as any, status: 'Done' as any },
  ]
}

export type TeamEvent = {
  id: string
  title: string
  date: string
  day: string
  time: string
  location: string
  type: 'Meeting' | 'Workshop' | 'Competition' | 'Social'
}

export const teamEvents = {
  en: [
    { id: 'e1', title: 'Weekly Team Standup', date: 'Mar 11', day: 'Tue', time: '6:00 PM', location: 'Eng. Lab B4', type: 'Meeting' as any },
    { id: 'e2', title: 'Intro to ROS 2 Workshop', date: 'Mar 12', day: 'Wed', time: '5:00 PM', location: 'Eng. Lab B4', type: 'Workshop' as any },
    { id: 'e3', title: 'Battle Bots Night', date: 'Mar 24', day: 'Mon', time: '7:00 PM', location: 'Main Arena', type: 'Competition' as any },
    { id: 'e4', title: 'End-of-month Social', date: 'Mar 30', day: 'Sun', time: '8:00 PM', location: 'Campus Cafe', type: 'Social' as any },
  ],
  ar: [
    { id: 'e1', title: 'الاجتماع الأسبوعي للفريق', date: '11 مارس', day: 'الثلاثاء', time: '6:00 م', location: 'معمل الهندسة B4', type: 'Meeting' as any },
    { id: 'e2', title: 'ورشة عمل مقدمة في ROS 2', date: '12 مارس', day: 'الأربعاء', time: '5:00 م', location: 'معمل الهندسة B4', type: 'Workshop' as any },
    { id: 'e3', title: 'ليلة معارك الروبوتات', date: '24 مارس', day: 'الاثنين', time: '7:00 م', location: 'الساحة الرئيسية', type: 'Competition' as any },
    { id: 'e4', title: 'تجمع نهاية الشهر', date: '30 مارس', day: 'الأحد', time: '8:00 م', location: 'مقهى الحرم الجامعي', type: 'Social' as any },
  ]
}

export type Interview = {
  id: string
  applicant: string
  role: string
  date: string
  time: string
  interviewer: string
}

export const interviews = {
  en: [
    { id: 'iv1', applicant: 'Sofia Ramos', role: 'Design Lead', date: 'Mar 16', time: '3:00 PM', interviewer: 'Nour El-Sayed' },
    { id: 'iv2', applicant: 'Noah Patel', role: 'ML Researcher', date: 'Mar 17', time: '1:30 PM', interviewer: 'Yassin Fouad' },
  ],
  ar: [
    { id: 'iv1', applicant: 'صوفيا راموس', role: 'قائد تصميم', date: '16 مارس', time: '3:00 م', interviewer: 'نور السيد' },
    { id: 'iv2', applicant: 'نوح باتيل', role: 'باحث تعلم آلي', date: '17 مارس', time: '1:30 م', interviewer: 'ياسين فؤاد' },
  ]
}

export type Approval = {
  id: string
  applicant: string
  role: string
  recommendedBy: string
  decision: 'Accept' | 'Reject'
  score: number
}

export const pendingApprovals = {
  en: [
    { id: 'ap1', applicant: 'Emma Wright', role: 'Firmware Engineer', recommendedBy: 'Nour El-Sayed', decision: 'Accept' as any, score: 95 },
    { id: 'ap2', applicant: 'Noah Patel', role: 'ML Researcher', recommendedBy: 'Yassin Fouad', decision: 'Reject' as any, score: 79 },
  ],
  ar: [
    { id: 'ap1', applicant: 'إيما رايت', role: 'مهندس أنظمة مدمجة', recommendedBy: 'نور السيد', decision: 'Accept' as any, score: 95 },
    { id: 'ap2', applicant: 'نوح باتيل', role: 'باحث تعلم آلي', recommendedBy: 'ياسين فؤاد', decision: 'Reject' as any, score: 79 },
  ]
}

export const analytics = {
  totalApplicants: 128,
  accepted: 34,
  acceptanceRate: 27,
  activeMembers: 7,
  avgAttendance: 85,
  openRoles: 3,
  applicantsByMonth: {
    en: [
      { month: 'Nov', value: 14 },
      { month: 'Dec', value: 22 },
      { month: 'Jan', value: 31 },
      { month: 'Feb', value: 28 },
      { month: 'Mar', value: 33 },
    ],
    ar: [
      { month: 'نوفمبر', value: 14 },
      { month: 'ديسمبر', value: 22 },
      { month: 'يناير', value: 31 },
      { month: 'فبراير', value: 28 },
      { month: 'مارس', value: 33 },
    ]
  }
}
"""

with open("c:/Users/Ahmed Bayaa/Documents/antigravity/mnuhub2027-main/lib/data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Data successfully updated to support i18n.")
