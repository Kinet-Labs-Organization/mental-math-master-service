const millisecondsInADay = 24 * 60 * 60 * 1000;
const today = Date.now();

export const BASIC_REPORT = {
  rank: 25,
  totalSessions: 80,
  accuracyRate: 90,
  currentStreak: 7,
  score: 400,
  achievements: ["First Steps", "Consistency"]
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
  report: PROGRESS_REPORT,
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
    "title": "What Is Mental Math and Why It Matters",
    "brief": "Learn what mental math is, how it improves brain speed, focus, and confidence, and why it is an essential life skill for all ages.",
    "link": "https://www.mentalup.co/blog/mental-math",
    "image": "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d"
  },
  {
    "title": "How Abacus Training Improves Brain Development",
    "brief": "An in-depth look at how abacus-based learning enhances memory, visualization, and cognitive growth in children.",
    "link": "https://www.vedantu.com/blog/abacus-benefits",
    "image": "https://images.unsplash.com/photo-1588072432836-e10032774350"
  },
  {
    "title": "Mental Math Techniques Used by Human Calculators",
    "brief": "Discover the techniques and strategies used by mental math experts to perform lightning-fast calculations.",
    "link": "https://www.scientificamerican.com/article/mental-math/",
    "image": "https://images.unsplash.com/photo-1518544887879-6d4c9a1c8b99"
  },
  {
    "title": "Abacus vs Mental Math: What’s the Difference?",
    "brief": "A clear comparison between traditional abacus training and pure mental math, including pros and learning outcomes.",
    "link": "https://www.cuemath.com/blog/abacus-vs-mental-math/",
    "image": "https://images.unsplash.com/photo-1596495578065-6e0763fa1178"
  },
  {
    "title": "Inside International Abacus Competitions",
    "brief": "Explore how international abacus tournaments are conducted, judging criteria, and how students prepare for them.",
    "link": "https://www.worldabacus.org/competitions",
    "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655"
  },
  {
    "title": "How Daily Mental Math Practice Builds Speed",
    "brief": "Learn how short, daily mental math sessions can significantly increase calculation speed and accuracy over time.",
    "link": "https://www.brainmetrix.com/blog/mental-math-practice",
    "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
  },
  {
    "title": "Benefits of Abacus Learning for School Children",
    "brief": "Understand why abacus training is widely recommended for school-age children to strengthen math fundamentals.",
    "link": "https://byjus.com/maths/abacus/",
    "image": "https://images.unsplash.com/photo-1600195077078-df1c6a9b0f1f"
  },
  {
    "title": "Preparing for Abacus Tournaments: A Complete Guide",
    "brief": "A practical guide covering practice routines, speed drills, and mental preparation for abacus competitions.",
    "link": "https://www.mentalabacus.in/abacus-competition-preparation",
    "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7"
  },
  {
    "title": "Can Adults Improve Mental Math Skills?",
    "brief": "This article explains how adults can train their brains to calculate faster and sharpen focus using mental math.",
    "link": "https://www.psychologytoday.com/us/blog/brain-training/mental-math",
    "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
  },
  {
    "title": "How Visualization Helps in Abacus and Mental Math",
    "brief": "Learn why number visualization is the core skill behind abacus mastery and high-speed mental calculations.",
    "link": "https://www.mathnasium.com/blog/visualization-math-skills",
    "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"
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