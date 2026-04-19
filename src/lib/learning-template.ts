export const learningTemplate = {
  "Foundation & Planning": [
    "Define specific learning goals and objectives",
    "Research industry demand and job requirements",
    "Gather primary learning resources (courses, books, docs)",
    "Find supplementary materials and tutorials",
    "Join relevant communities and forums",
    "Set up development environment and tools",
    "Create realistic study schedule with milestones"
  ],
  "Core Learning": [
    "Master fundamental concepts and terminology",
    "Complete introductory tutorials and exercises",
    "Practice basic examples and implementations",
    "Dive deeper into intermediate concepts",
    "Work through structured coding exercises",
    "Learn advanced topics and complex patterns",
    "Study best practices and industry standards"
  ],
  "Hands-On Application": [
    "Build basic implementation project",
    "Create intermediate complexity project",
    "Develop advanced portfolio-worthy project",
    "Implement proper testing strategies",
    "Follow coding standards and conventions",
    "Use version control effectively",
    "Deploy projects to production environment"
  ],
  "Community & Professional Development": [
    "Write technical blog posts or articles",
    "Answer questions in forums and communities",
    "Give presentation or demo to colleagues",
    "Contribute to open source projects",
    "Update GitHub with quality projects",
    "Update LinkedIn profile with new skills",
    "Attend relevant meetups or conferences"
  ],
  "Assessment & Certification": [
    "Complete coding challenges and assessments",
    "Take practice tests or certification exams",
    "Get peer review from colleagues",
    "Apply skills to current work projects",
    "Volunteer for relevant tasks at work",
    "Propose new initiatives using learned technology",
    "Mentor others learning the same technology"
  ]
} as const;

export type PhaseName = keyof typeof learningTemplate;
