import { Achievement } from "@prisma/client";

const millisecondsInADay = 24 * 60 * 60 * 1000;
const today = Date.now();

export const BASIC_REPORT = {
  rank: 25,
  totalSessions: 80,
  accuracyRate: 90,
  currentStreak: 7,
  score: 400,
  achievements: ["achievement_1", "achievement_2", "achievement_3", "achievement_4"],
};

export const PROGRESS_REPORT = {
  performanceTrend: [
    85, 88, 90, 92, 10, 94, 90, 93, 95, 97, 99, 100, 98, 96, 94, 92, 90, 88, 85,
    83, 81, 79, 77, 75, 73, 71, 69, 67, 65, 75,
  ],
  aiSuggestions: ["Practice subtraction more", "Try timed challenges"],
};

export const ACTIVITIES = [
  {
    gameName: "1. Pluto",
    gamePlayedAt: new Date(today),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "2. Mercury",
    gamePlayedAt: new Date(today),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: false,
  },
  {
    gameName: "3. Venus",
    gamePlayedAt: new Date(today - 1 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "4. Earth",
    gamePlayedAt: new Date(today - 1 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "5.Mars",
    gamePlayedAt: new Date(today - 2 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: false,
  },
  {
    gameName: "6. Jupiter",
    gamePlayedAt: new Date(today - 2 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "7. Saturn",
    gamePlayedAt: new Date(today - 2 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "8. Uranus",
    gamePlayedAt: new Date(today - 2 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "9. regular",
    gamePlayedAt: new Date(today - 2 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 15,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "10. Pluto",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "11. Mercury",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "12. Venus",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "13. Earth",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 11,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "14. Mars",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "15. Jupiter",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: false,
  },
  {
    gameName: "16. Saturn",
    gamePlayedAt: new Date(today - 3 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "17. Uranus",
    gamePlayedAt: new Date(today - 4 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "18. Neptune",
    gamePlayedAt: new Date(today - 4 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "19. Mercury",
    gamePlayedAt: new Date(today - 4 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "20. Venus",
    gamePlayedAt: new Date(today - 5 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "21. Earth",
    gamePlayedAt: new Date(today - 5 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "22. Mars",
    gamePlayedAt: new Date(today - 5 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "23. Jupiter",
    gamePlayedAt: new Date(today - 6 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: false,
  },
  {
    gameName: "24. Saturn",
    gamePlayedAt: new Date(today - 6 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "25. Pluto",
    gamePlayedAt: new Date(today - 7 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "26. Uranus",
    gamePlayedAt: new Date(today - 8 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "27. Neptune",
    gamePlayedAt: new Date(today - 9 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "28. Pluto",
    gamePlayedAt: new Date(today - 10 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: false,
  },
  {
    gameName: "29. Mercury",
    gamePlayedAt: new Date(today - 11 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: true,
  },
  {
    gameName: "30. Venus",
    gamePlayedAt: new Date(today - 11 * millisecondsInADay),
    gameType: "regular",
    totalQuestions: 10,
    correctAnswers: 9,
    correctness: true,
  },
  {
    gameName: "31. Earth",
    gamePlayedAt: new Date(today - 11 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 8,
    correctness: true,
  },
  {
    gameName: "32. Mars",
    gamePlayedAt: new Date(today - 12 * millisecondsInADay),
    gameType: "flash",
    totalQuestions: 10,
    correctAnswers: 10,
    correctness: false,
  },
];

export const PROFILE = {
  name: "Suman Mandal",
  email: "sumanmandal64@gmail.com",
  subscribedOn: new Date("2023-01-15"),
  // plan: "FREE TRIAL",
  plan: "TRIAL EXPIRED",
};

export const SETTINGS = {
  soundEffect: false,
  notification: true,
  newsLetter: true,
};

export const FAQ = [
  {
    "question": "What is Mental Math Master?",
    "answer": "Mental Math Master is a brain training app that helps users improve their mental calculation skills using abacus-style number visualization, timed exercises, and progressive difficulty levels."
  },
  {
    "question": "Who can use Mental Math Master?",
    "answer": "The app is designed for children, students, and adults. Beginners can start with simple calculations, while advanced users can practice faster and more complex mental math."
  },
  {
    "question": "Do I need to know abacus to use this app?",
    "answer": "You do not need any prior abacus knowledge. But to perform the higher level games, one needs to calculate faster, and for that knowledge of abacus is important. The app trains your brain step by step to visualize numbers and calculate mentally."
  },
  {
    "question": "How does a training session work?",
    "answer": "Numbers appear on the screen one by one at a fixed interval. You add or subtract them mentally, and at the end of the session, you enter the final answer to check your accuracy."
  },
  {
    "question": "What types of calculations are included?",
    "answer": "The app includes addition, subtraction, mixed operations, different digit lengths, and speed-based challenges that increase in difficulty as you progress."
  },
  {
    "question": "How is my progress tracked?",
    "answer": "Your progress is tracked through accuracy rate, total sessions, current streak, achievements, performance graphs, and personal bests."
  },
  {
    "question": "What happens if I answer incorrectly?",
    "answer": "You will see the correct answer along with feedback. This helps you understand mistakes and improve in future sessions."
  },
  {
    "question": "Is Mental Math Master suitable for daily practice?",
    "answer": "Yes. Short daily sessions are encouraged, and the app includes streaks and reminders to help you build a consistent mental math habit."
  },
  {
    "question": "Does the app work offline?",
    "answer": "No. Training sessions can not be used offline. Also, progress syncing, achievements, and backups require an internet connection."
  },
  {
    "question": "How does this app help in real life?",
    "answer": "Mental Math Master improves concentration, memory, speed, and confidence in calculations, which helps in academics, exams, and everyday number-related tasks."
  }
];

export const BLOGS = [
  {
    brief: "Explore how abacus training enhances memory, focus, and overall brain development in children.",
    icon: "🧠",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    link: "https://thelearningspaceschool.com/benefits-of-learning-the-abacus-for-kids/",
    read: "6 min",
    title: "Benefits of Learning Abacus for Kids"
  },
  {
    brief: "Understand the strong connection between abacus learning and improved mental math skills.",
    icon: "🔢",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
    link: "https://sipabacus.com/in/blog/what-is-the-relationship-between-abacus-and-mental-maths/",
    read: "5 min",
    title: "Relationship Between Abacus and Mental Maths"
  },
  {
    brief: "Learn why abacus training is important for concentration, logic, and brain development.",
    icon: "📚",
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0",
    link: "https://www.21kschool.com/in/blog/importance-of-abacus/",
    read: "7 min",
    title: "Importance of Abacus for Children"
  },
  {
    brief: "Discover how mental math using abacus improves memory, visualization, and calculation speed.",
    icon: "⚡",
    image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
    link: "https://abacusmaster.com/blog/learning-abacus-benefits",
    read: "4 min",
    title: "Benefits of Learning Abacus"
  },
  {
    brief: "Compare abacus vs mental math and understand which approach builds stronger cognitive skills.",
    icon: "⚖️",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
    link: "https://bhanzu.com/blog/abacus-vs-mental-math-which-is-better-for-kids/",
    read: "6 min",
    title: "Abacus vs Mental Math for Kids"
  },
  {
    brief: "Learn how abacus training improves attention span, memory retention, and academic performance.",
    icon: "🎓",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80",
    link: "https://sipabacus.com/in/blog/the-connection-between-abacus-learning-and-academic-success-in-children/",
    read: "6 min",
    title: "Abacus Learning and Academic Success"
  },
  {
    brief: "Understand how abacus training builds both left and right brain functions in children.",
    icon: "🧩",
    image: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759",
    link: "https://ucmas.ca/research-done-on-impact-of-abacus-training-on-children/",
    read: "5 min",
    title: "Impact of Abacus Training on Children"
  },
  {
    brief: "Explore how early abacus learning strengthens memory structures and math abilities.",
    icon: "📈",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    link: "https://ucmas.ca/3-benefits-of-introducing-your-child-to-an-abacus-math-program-early-on/",
    read: "4 min",
    title: "Benefits of Early Abacus Learning"
  },
  {
    brief: "Learn how mental math training improves concentration, logic, and quick calculation skills.",
    icon: "⚙️",
    image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    link: "https://www.successabacus.com/blog/mental-math-training-for-kids-how-abacus-improves-memory-in-children/",
    read: "6 min",
    title: "Mental Math Training for Kids"
  },
  {
    brief: "Discover how abacus enhances cognitive skills like visualization, memory, and problem-solving.",
    icon: "🧠",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
    link: "https://www.mastermindabacus.com/blog_detail/448/the-role-of-abacus-in-your-childs-development-a-comprehensive-guide/",
    read: "7 min",
    title: "Role of Abacus in Child Development"
  },
  {
    brief: "Understand how mental abacus improves speed, memory, and concentration in calculations.",
    icon: "🚀",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    link: "https://en.wikipedia.org/wiki/Mental_abacus",
    read: "5 min",
    title: "Mental Abacus Explained"
  }
];

export const LEADER = [
  {
    rank: 1,
    score: 5000,
    accuracy: '95%',
    name: "Ridhima Mandal",
  },
  {
    rank: 2,
    score: 4000,
    accuracy: '90%',
    name: "Rajarshi Das",
  },
  {
    rank: 3,
    score: 3000,
    accuracy: '85%',
    name: "Banhisikha Sarker",
  },
  {
    rank: 4,
    score: 2000,
    accuracy: '80%',
    name: "S.C Mandal",
  },
  {
    rank: 5,
    score: 1000,
    accuracy: '75%',
    name: "Bela Sarker",
  },
  {
    rank: 6,
    score: 900,
    accuracy: '70%',
    name: "M.C Sarker",
  },
  {
    rank: 7,
    score: 800,
    accuracy: '65%',
    name: "Jon Ghosh",
  },
  {
    rank: 8,
    score: 700,
    accuracy: '60%',
    name: "Rahul Saha",
  },
  {
    rank: 9,
    score: 600,
    accuracy: '55%',
    name: "Satyajit Das",
  },
  {
    rank: 10,
    score: 500,
    accuracy: '50%',
    name: "Anirban Saha",
  },
];

export const NOTIFICATIONS = {
  notifications: [
    { title: 'New Tournament Available', desc: 'The Neptune Championship has started!', time: '2h ago', icon: '🏆', color: 'bg-yellow-500/20 text-yellow-400', read: false },
    { title: 'Daily Goal Reached', desc: 'You completed your daily practice goal.', time: '5h ago', icon: '🎯', color: 'bg-green-500/20 text-green-400', read: false },
    { title: 'New Blog Post', desc: 'Check out our latest blog on mental math techniques.', time: '1d ago', icon: '📰', color: 'bg-blue-500/20 text-blue-400', read: true },
    { title: 'Achievement Unlocked', desc: 'You earned the "Consistency" badge!', time: '3d ago', icon: '🏅', color: 'bg-purple-500/20 text-purple-400', read: true },
    { title: 'Friend Joined', desc: 'Your friend Ridhima Mandal just joined the app.', time: '5d ago', icon: '👥', color: 'bg-pink-500/20 text-pink-400', read: false },
    { title: 'Weekly Challenge', desc: 'New weekly challenge is live. Can you top the leaderboard?', time: '1w ago', icon: '🔥', color: 'bg-red-500/20 text-red-400', read: false },
    { title: 'Subscription Expiring', desc: 'Your subscription will expire in 3 days. Renew now to keep your progress.', time: '2w ago', icon: '⏰', color: 'bg-gray-500/20 text-gray-400', read: true },
  ],
  total: 7,
  unread: 5,
};

export const ACHIEVEMENTS = {
  achievements: [
    { id: 'achievement_1', icon: '🏆', title: 'First Win', description: 'Complete your first tournament', },
    { id: 'achievement_2', icon: '🔥', title: 'Hot Streak', description: '5 day practice streak', },
    { id: 'achievement_3', icon: '🎯', title: 'Perfectionist', description: '100% accuracy in a session', },
    { id: 'achievement_4', icon: '⚡', title: 'Speed Demon', description: 'Complete Neptune level', },
    { id: 'achievement_5', icon: '🌟', title: 'Rising Star', description: 'Reach top 10 on leaderboard', },
    { id: 'achievement_6', icon: '💎', title: 'Master', description: 'Complete all tournaments', },
  ],
  total: 6,
};