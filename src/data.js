// ============================================================
//  EDIT THIS FILE to update your blog. No coding knowledge needed:
//  just change the text between the quotes and the numbers.
//
//  Photos: put your pictures in the "public/images" folder, then write
//  the file name below, e.g. "images/week1-office.jpg".
//  If a photo is missing, a placeholder box is shown instead.
// ============================================================

export const BLOG = {
  name: "Your Name",
  course: "BS Information Technology",
  school: "Your School / University",
  company: "Company Name",
  department: "IT Department",
  supervisor: "Supervisor Name",
  startDate: "2026-06-01",
  requiredHours: 488,

  heroPhoto: "images/cover.jpg",

  intro:
    "Welcome to my OJT journal! This blog documents my 488-hour On-the-Job Training: " +
    "the tasks I worked on, the people I met, and the lessons I learned along the way.",

  // One entry per week. Add, remove, or edit as needed.
  // "hours" is how many hours you rendered that week; the progress bar adds them up.
  entries: [
    {
      week: 1,
      date: "June 1 – June 5, 2026",
      hours: 40,
      title: "First Week: Orientation & Getting Settled",
      // Each "..." inside the [ ] is one paragraph. Add as many as you like.
      text: [
        "My first week started with an orientation about the company's history, rules, and " +
          "culture. I was introduced to my supervisor and the team, set up my workstation, " +
          "and learned the tools we use every day.",
        "At first I was nervous, but everyone was welcoming. By Friday I already felt more " +
          "comfortable asking questions and knew where everything was in the office.",
      ],
      learned: "Professionalism starts on day one: be early, ask questions, take notes.",
      photos: ["images/week1-1.jpg", "images/week1-2.jpg", "images/week1-3.jpg"],
    },
    {
      week: 2,
      date: "June 8 – June 12, 2026",
      hours: 40,
      title: "Learning the Ropes",
      text: [
        "I was given my first real tasks: organizing files, encoding data, and assisting " +
          "the staff with day-to-day work.",
        "I started to understand how each department works together and why accuracy matters " +
          "in every small task.",
      ],
      learned: "Small tasks done well build trust for bigger responsibilities.",
      photos: ["images/week2-1.jpg", "images/week2-2.jpg"],
    },
    {
      week: 3,
      date: "June 15 – June 19, 2026",
      hours: 40,
      title: "My First Project",
      text: [
        "This week I was assigned to help on a project. I worked with the team, attended " +
          "meetings, and contributed ideas.",
        "It was challenging but very rewarding, and I learned a lot from watching how my " +
          "co-workers solve problems.",
      ],
      learned: "Communication and teamwork matter as much as technical skills.",
      photos: ["images/week3-1.jpg", "images/week3-2.jpg", "images/week3-3.jpg"],
    },
  ],
};
