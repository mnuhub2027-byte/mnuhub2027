export type Category =
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

export const categories: Category[] = [
  'Tech',
  'Art',
  'Sports',
  'Charity',
  'Music',
  'Business',
  'Debate',
]

export const faculties = [
  'Engineering',
  'Arts & Humanities',
  'Business School',
  'Sciences',
  'Medicine',
  'Law',
]

export const clubs: Club[] = [
  {
    id: 'robotics',
    name: 'Robotics & AI Society',
    category: 'Tech',
    faculty: 'Engineering',
    members: 842,
    tagline: 'Build the machines of tomorrow, today.',
    description:
      'A community of makers, coders, and dreamers building autonomous robots, competing in national challenges, and running weekly hardware + AI workshops for all skill levels.',
    image: '/clubs/robotics.png',
    achievements: [
      '1st place — National Robotics Championship 2025',
      'Published 3 papers at the Student AI Symposium',
      'Built the campus autonomous delivery bot',
    ],
    events: [
      { title: 'Intro to ROS 2 Workshop', date: 'Mar 12', location: 'Eng. Lab B4' },
      { title: 'Battle Bots Night', date: 'Mar 24', location: 'Main Arena' },
    ],
    openRoles: ['Firmware Engineer', 'ML Researcher', 'Design Lead'],
  },
  {
    id: 'fine-arts',
    name: 'Canvas Collective',
    category: 'Art',
    faculty: 'Arts & Humanities',
    members: 415,
    tagline: 'Where every idea finds a color.',
    description:
      'From digital illustration to gallery exhibitions, Canvas Collective is the creative home for painters, designers, and visual storytellers on campus.',
    image: '/clubs/art.png',
    achievements: [
      'Hosted the annual Spring Student Gallery',
      'Mural commission for the new Student Union',
      'Featured in the City Young Artists Fair',
    ],
    events: [
      { title: 'Live Life Drawing', date: 'Mar 15', location: 'Studio 2' },
      { title: 'Digital Art Jam', date: 'Mar 28', location: 'Design Hub' },
    ],
    openRoles: ['Exhibition Curator', 'Social Media Artist'],
  },
  {
    id: 'athletics',
    name: 'Velocity Athletics',
    category: 'Sports',
    faculty: 'Sciences',
    members: 1203,
    tagline: 'Faster. Stronger. Together.',
    description:
      'The largest multi-sport club on campus, running training squads, inter-university leagues, and fitness socials across athletics, football, and more.',
    image: '/clubs/sports.png',
    achievements: [
      'Regional League Champions 2025',
      'Sent 12 athletes to the National Games',
      'Raised the campus fitness participation by 40%',
    ],
    events: [
      { title: 'Track Trials', date: 'Mar 10', location: 'Athletics Field' },
      { title: 'Inter-Faculty Cup', date: 'Apr 02', location: 'Main Stadium' },
    ],
    openRoles: ['Team Captain', 'Fitness Coach', 'Events Coordinator'],
  },
  {
    id: 'charity',
    name: 'Impact Volunteers',
    category: 'Charity',
    faculty: 'Medicine',
    members: 567,
    tagline: 'Small actions, campus-wide change.',
    description:
      'A student-led charity network organising community drives, fundraising campaigns, and volunteering placements that make a measurable local impact.',
    image: '/clubs/charity.png',
    achievements: [
      'Raised $85k for local shelters in 2025',
      'Ran 20+ community volunteering days',
      'Winner of the University Social Impact Award',
    ],
    events: [
      { title: 'Charity Bake Sale', date: 'Mar 18', location: 'Central Quad' },
      { title: 'Community Clean-up', date: 'Mar 30', location: 'Riverside Park' },
    ],
    openRoles: ['Fundraising Lead', 'Community Liaison'],
  },
  {
    id: 'music',
    name: 'Amplitude Music Club',
    category: 'Music',
    faculty: 'Arts & Humanities',
    members: 389,
    tagline: 'Turn the campus up to eleven.',
    description:
      'Bands, producers, DJs and vocalists collaborating on live gigs, open mics, and a student-run recording studio open every week.',
    image: '/clubs/music.png',
    achievements: [
      'Headlined the Summer Campus Festival',
      'Released a 10-track student compilation album',
      'Opened a free student recording studio',
    ],
    events: [
      { title: 'Open Mic Night', date: 'Mar 14', location: 'The Basement' },
      { title: 'Producer Meetup', date: 'Mar 26', location: 'Studio A' },
    ],
    openRoles: ['Sound Engineer', 'Event Host', 'Studio Manager'],
  },
  {
    id: 'business',
    name: 'Founders Guild',
    category: 'Business',
    faculty: 'Business School',
    members: 731,
    tagline: 'From dorm room to boardroom.',
    description:
      'An entrepreneurship community running pitch nights, startup accelerators, and mentorship with alumni founders and venture partners.',
    image: '/clubs/business.png',
    achievements: [
      '4 student startups funded in 2025',
      'Ran the campus $10k pitch competition',
      'Mentorship from 30+ alumni founders',
    ],
    events: [
      { title: 'Pitch Perfect Night', date: 'Mar 20', location: 'Business Atrium' },
      { title: 'Founder Fireside', date: 'Apr 05', location: 'Lecture Hall 1' },
    ],
    openRoles: ['Growth Lead', 'Partnerships Manager'],
  },
  {
    id: 'debate',
    name: 'Oxford Debate Union',
    category: 'Debate',
    faculty: 'Law',
    members: 298,
    tagline: 'Sharpen your mind, own the room.',
    description:
      'Competitive and casual debating, public speaking coaching, and a weekly forum on the ideas shaping the world.',
    image: '/clubs/debate.png',
    achievements: [
      'National Debate Semi-finalists 2025',
      'Hosted 3 inter-university tournaments',
      'Public speaking bootcamp for 200+ students',
    ],
    events: [
      { title: 'Weekly Motion Debate', date: 'Mar 13', location: 'Moot Court' },
      { title: 'Rhetoric Workshop', date: 'Mar 27', location: 'Law Room 3' },
    ],
    openRoles: ['Head of Debating', 'Coaching Lead'],
  },
]

export type ApplicationStatus =
  | 'Pending'
  | 'Interview Scheduled'
  | 'Accepted'
  | 'Reviewing'

export type StudentApplication = {
  id: string
  clubId: string
  clubName: string
  role: string
  submitted: string
  status: Exclude<ApplicationStatus, 'Reviewing'>
  note: string
}

export const studentApplications: StudentApplication[] = [
  {
    id: 'a1',
    clubId: 'robotics',
    clubName: 'Robotics & AI Society',
    role: 'ML Researcher',
    submitted: 'Mar 2, 2026',
    status: 'Interview Scheduled',
    note: 'Interview on Mar 16, 3:00 PM — Eng. Lab B4',
  },
  {
    id: 'a2',
    clubId: 'business',
    clubName: 'Founders Guild',
    role: 'Growth Lead',
    submitted: 'Feb 28, 2026',
    status: 'Accepted',
    note: 'Welcome aboard! Onboarding kit sent to your inbox.',
  },
  {
    id: 'a3',
    clubId: 'music',
    clubName: 'Amplitude Music Club',
    role: 'Sound Engineer',
    submitted: 'Mar 4, 2026',
    status: 'Pending',
    note: 'Application under review by the recruitment team.',
  },
]

export type Applicant = {
  id: string
  name: string
  faculty: string
  year: string
  role: string
  stage: 'Reviewing' | 'Interview' | 'Accepted'
  score: number
  portfolio: string
  email?: string
  whatsapp?: string
  studentId?: string
  submittedAt?: string
}

export const applicants: Applicant[] = [
  {
    id: 'p1',
    name: 'Maya Chen',
    faculty: 'Engineering',
    year: 'Year 2',
    role: 'Firmware Engineer',
    stage: 'Reviewing',
    score: 88,
    portfolio: 'github.com/mayac',
  },
  {
    id: 'p2',
    name: 'Liam Okafor',
    faculty: 'Sciences',
    year: 'Year 3',
    role: 'ML Researcher',
    stage: 'Reviewing',
    score: 91,
    portfolio: 'liam.dev',
  },
  {
    id: 'p3',
    name: 'Sofia Ramos',
    faculty: 'Engineering',
    year: 'Year 1',
    role: 'Design Lead',
    stage: 'Interview',
    score: 84,
    portfolio: 'dribbble.com/sofiar',
  },
  {
    id: 'p4',
    name: 'Noah Patel',
    faculty: 'Business School',
    year: 'Year 2',
    role: 'ML Researcher',
    stage: 'Interview',
    score: 79,
    portfolio: 'noahp.io',
  },
  {
    id: 'p5',
    name: 'Emma Wright',
    faculty: 'Sciences',
    year: 'Year 4',
    role: 'Firmware Engineer',
    stage: 'Accepted',
    score: 95,
    portfolio: 'github.com/emmaw',
  },
]

export const pipelineStages = ['Reviewing', 'Interview', 'Accepted'] as const

/* ------------------------------------------------------------------ */
/* Team / member workspace data                                        */
/* ------------------------------------------------------------------ */

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
  name: 'Robotics & AI Society',
  handle: '@robotics',
  faculty: 'Engineering',
}

export const members: Member[] = [
  {
    id: 'm1',
    name: 'Adam Hafez',
    initials: 'AH',
    department: 'Software',
    role: 'Leader',
    joined: 'Sep 2023',
    attendance: 98,
    tasksDone: 64,
  },
  {
    id: 'm2',
    name: 'Nour El-Sayed',
    initials: 'NE',
    department: 'Recruitment',
    role: 'Vice Leader',
    joined: 'Oct 2023',
    attendance: 95,
    tasksDone: 51,
  },
  {
    id: 'm3',
    name: 'Yassin Fouad',
    initials: 'YF',
    department: 'Hardware',
    role: 'Vice Leader',
    joined: 'Jan 2024',
    attendance: 90,
    tasksDone: 47,
  },
  {
    id: 'm4',
    name: 'Salma Adel',
    initials: 'SA',
    department: 'Machine Learning',
    role: 'Member',
    joined: 'Feb 2024',
    attendance: 88,
    tasksDone: 33,
  },
  {
    id: 'm5',
    name: 'Karim Mostafa',
    initials: 'KM',
    department: 'Software',
    role: 'Member',
    joined: 'Feb 2024',
    attendance: 76,
    tasksDone: 21,
  },
  {
    id: 'm6',
    name: 'Habiba Tarek',
    initials: 'HT',
    department: 'Design',
    role: 'Member',
    joined: 'Mar 2024',
    attendance: 82,
    tasksDone: 18,
  },
  {
    id: 'm7',
    name: 'Omar Zaki',
    initials: 'OZ',
    department: 'Hardware',
    role: 'Member',
    joined: 'Mar 2024',
    attendance: 71,
    tasksDone: 14,
  },
]

/** The member currently signed in for the member/assistant views. */
export const currentMember = {
  name: 'Salma Adel',
  initials: 'SA',
  department: 'Machine Learning',
  role: 'Member' as TeamRole,
  joined: 'Feb 2024',
  team: activeTeam.name,
}

export type Announcement = {
  id: string
  title: string
  body: string
  author: string
  date: string
  pinned: boolean
}

export const announcements: Announcement[] = [
  {
    id: 'an1',
    title: 'Battle Bots Night — all hands on deck',
    body: 'We need every squad to finalize their bots by Mar 22. Sign up for a test slot in the #arena channel.',
    author: 'Adam Hafez',
    date: 'Mar 8, 2026',
    pinned: true,
  },
  {
    id: 'an2',
    title: 'New ML study group starting',
    body: 'Salma is running a weekly ML reading group every Tuesday at 6 PM in Eng. Lab B4. Open to all members.',
    author: 'Nour El-Sayed',
    date: 'Mar 6, 2026',
    pinned: false,
  },
  {
    id: 'an3',
    title: 'Sponsorship secured 🎉',
    body: 'We just landed a hardware sponsorship — new sensors and boards arrive next week. Thanks to the partnerships team!',
    author: 'Adam Hafez',
    date: 'Mar 3, 2026',
    pinned: false,
  },
]

export type Task = {
  id: string
  title: string
  due: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'To Do' | 'In Progress' | 'Done'
}

export const myTasks: Task[] = [
  {
    id: 't1',
    title: 'Train the object-detection model on new dataset',
    due: 'Mar 14',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 't2',
    title: 'Document the vision pipeline for the wiki',
    due: 'Mar 18',
    priority: 'Medium',
    status: 'To Do',
  },
  {
    id: 't3',
    title: 'Review Karim’s pull request',
    due: 'Mar 12',
    priority: 'High',
    status: 'To Do',
  },
  {
    id: 't4',
    title: 'Prepare slides for the ML study group',
    due: 'Mar 10',
    priority: 'Low',
    status: 'Done',
  },
]

export type TeamEvent = {
  id: string
  title: string
  date: string
  day: string
  time: string
  location: string
  type: 'Meeting' | 'Workshop' | 'Competition' | 'Social'
}

export const teamEvents: TeamEvent[] = [
  {
    id: 'e1',
    title: 'Weekly Team Standup',
    date: 'Mar 11',
    day: 'Tue',
    time: '6:00 PM',
    location: 'Eng. Lab B4',
    type: 'Meeting',
  },
  {
    id: 'e2',
    title: 'Intro to ROS 2 Workshop',
    date: 'Mar 12',
    day: 'Wed',
    time: '5:00 PM',
    location: 'Eng. Lab B4',
    type: 'Workshop',
  },
  {
    id: 'e3',
    title: 'Battle Bots Night',
    date: 'Mar 24',
    day: 'Mon',
    time: '7:00 PM',
    location: 'Main Arena',
    type: 'Competition',
  },
  {
    id: 'e4',
    title: 'End-of-month Social',
    date: 'Mar 30',
    day: 'Sun',
    time: '8:00 PM',
    location: 'Campus Cafe',
    type: 'Social',
  },
]

/* ------------------------------------------------------------------ */
/* Recruitment (assistant + leader)                                    */
/* ------------------------------------------------------------------ */

export type Interview = {
  id: string
  applicant: string
  role: string
  date: string
  time: string
  interviewer: string
}

export const interviews: Interview[] = [
  {
    id: 'iv1',
    applicant: 'Sofia Ramos',
    role: 'Design Lead',
    date: 'Mar 16',
    time: '3:00 PM',
    interviewer: 'Nour El-Sayed',
  },
  {
    id: 'iv2',
    applicant: 'Noah Patel',
    role: 'ML Researcher',
    date: 'Mar 17',
    time: '1:30 PM',
    interviewer: 'Yassin Fouad',
  },
]

export type Approval = {
  id: string
  applicant: string
  role: string
  recommendedBy: string
  decision: 'Accept' | 'Reject'
  score: number
}

export const pendingApprovals: Approval[] = [
  {
    id: 'ap1',
    applicant: 'Emma Wright',
    role: 'Firmware Engineer',
    recommendedBy: 'Nour El-Sayed',
    decision: 'Accept',
    score: 95,
  },
  {
    id: 'ap2',
    applicant: 'Noah Patel',
    role: 'ML Researcher',
    recommendedBy: 'Yassin Fouad',
    decision: 'Reject',
    score: 79,
  },
]

export const analytics = {
  totalApplicants: 128,
  accepted: 34,
  acceptanceRate: 27,
  activeMembers: members.length,
  avgAttendance: Math.round(
    members.reduce((sum, m) => sum + m.attendance, 0) / members.length,
  ),
  openRoles: 3,
  applicantsByMonth: [
    { month: 'Nov', value: 14 },
    { month: 'Dec', value: 22 },
    { month: 'Jan', value: 31 },
    { month: 'Feb', value: 28 },
    { month: 'Mar', value: 33 },
  ],
}
