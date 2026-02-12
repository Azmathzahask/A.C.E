
import { ATSAnalysis } from "../types";

const TECHNICAL_KEYWORDS = [
  "javascript", "typescript", "python", "java", "react", "angular", "vue", "node.js",
  "sql", "nosql", "mongodb", "postgresql", "aws", "azure", "gcp", "docker", "kubernetes",
  "git", "ci/cd", "rest", "api", "graphql", "html", "css", "agile", "scrum",
  "machine learning", "data analysis", "cloud computing", "microservices", "devops",
  "testing", "unit testing", "integration testing", "linux", "terraform", "redis",
];

const SOFT_SKILL_KEYWORDS = [
  "leadership", "communication", "teamwork", "problem-solving", "collaboration",
  "mentoring", "project management", "stakeholder", "cross-functional", "initiative",
];

const STRONG_ACTION_VERBS = [
  "Spearheaded", "Architected", "Optimized", "Implemented", "Engineered",
  "Streamlined", "Orchestrated", "Pioneered", "Automated", "Transformed",
  "Delivered", "Accelerated", "Reduced", "Increased", "Drove",
  "Designed", "Developed", "Led", "Mentored", "Scaled",
];

const WEAK_PHRASES: Record<string, string> = {
  "responsible for": "Led / Managed / Directed",
  "worked on": "Developed / Engineered / Built",
  "helped with": "Contributed to / Facilitated / Supported",
  "was involved in": "Participated in / Drove / Executed",
  "duties included": "Delivered / Achieved / Accomplished",
  "tasked with": "Spearheaded / Owned / Championed",
  "in charge of": "Directed / Oversaw / Managed",
  "did work on": "Developed / Implemented / Executed",
  "assisted in": "Collaborated on / Contributed to",
  "handled": "Managed / Orchestrated / Coordinated",
};

const SECTION_HEADERS = [
  "summary", "objective", "professional summary", "career objective",
  "education", "academic background", "educational background",
  "skills", "technical skills", "core competencies",
  "experience", "work history", "work experience", "professional experience", "employment",
  "projects", "project experience", "portfolio",
  "certifications", "licenses", "awards", "honors"
];

function detectSections(text: string): Set<string> {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const header of SECTION_HEADERS) {
    if (lower.includes(header)) found.add(header);
  }
  return found;
}

function countBulletPoints(text: string): number {
  return (text.match(/[•\*▪◦]/g) || []).length;
}

function hasQuantifiableMetrics(text: string): boolean {
  return /\d+%|\$[\d,]+|\d+ (users|customers|projects|team|members|clients)/.test(text);
}

function hasContactInfo(text: string): { email: boolean; phone: boolean; linkedin: boolean; github: boolean } {
  return {
    email: /[\w.-]+@[\w.-]+\.\w+/.test(text),
    phone: /(\+?\d[\d\s\-()]{7,})/.test(text),
    linkedin: /linkedin\.com/i.test(text),
    github: /github\.com/i.test(text),
  };
}

export function analyzeResumeLocally(resumeText: string): ATSAnalysis {
  const lower = resumeText.toLowerCase();
  const sections = detectSections(lower);
  const contact = hasContactInfo(resumeText);
  const bulletCount = countBulletPoints(resumeText);
  const hasMetrics = hasQuantifiableMetrics(resumeText);
  const wordCount = resumeText.split(/\s+/).length;

  let score = 0;

  // Contact info (15 pts)
  if (contact.email) score += 4;
  if (contact.phone) score += 4;
  if (contact.linkedin) score += 4;
  if (contact.github) score += 3;

  // Sections (20 pts)
  const expectedSections = ["summary", "education", "skills", "experience", "projects"];
  const foundExpected = expectedSections.filter((s) => sections.has(s) || (s === "experience" && (sections.has("work history") || sections.has("professional experience"))));
  score += Math.min(20, foundExpected.length * 4);

  // Keywords (20 pts)
  const foundTechnical = TECHNICAL_KEYWORDS.filter((kw) => lower.includes(kw));
  score += Math.min(15, foundTechnical.length * 1.5);
  const foundSoft = SOFT_SKILL_KEYWORDS.filter((kw) => lower.includes(kw));
  score += Math.min(5, foundSoft.length);

  // Bullet points (10 pts)
  score += Math.min(10, bulletCount * 0.5);

  // Metrics (10 pts)
  if (hasMetrics) score += 10;

  // Length (10 pts)
  if (wordCount >= 200 && wordCount <= 800) score += 10;
  else if (wordCount >= 100) score += 5;

  // Action verbs (10 pts)
  const usedVerbs = STRONG_ACTION_VERBS.filter((v) => lower.includes(v.toLowerCase()));
  score += Math.min(10, usedVerbs.length * 2);

  // No weak phrases bonus (5 pts)
  const foundWeak = Object.keys(WEAK_PHRASES).filter((p) => lower.includes(p));
  if (foundWeak.length === 0) score += 5;

  score = Math.min(100, Math.round(score));

  const missingKeywords = TECHNICAL_KEYWORDS.filter((kw) => !lower.includes(kw)).slice(0, 10);
  const skillGap = `Your resume mentions ${foundTechnical.length} technical and ${foundSoft.length} soft skill keywords. ${!hasMetrics ? "Adding quantifiable metrics would significantly boost your score." : "Good use of metrics."}`;

  const sectionImprovements: { section: string; suggestion: string }[] = [];
  if (!sections.has("summary")) sectionImprovements.push({ section: "Summary", suggestion: "Add a 2-3 sentence summary highlighting your stand-out achievements." });
  if (!sections.has("education")) sectionImprovements.push({ section: "Education", suggestion: "Ensure your institution and graduation year are clearly listed." });
  if (!sections.has("skills")) sectionImprovements.push({ section: "Skills", suggestion: "Add a categorized Skills section for better ATS parsing." });

  const betterWording = foundWeak.slice(0, 5).map((phrase) => ({
    original: phrase,
    improved: WEAK_PHRASES[phrase],
  }));

  const projectSuggestions = [];
  if (!lower.includes("portfolio")) projectSuggestions.push("Build a personal portfolio website.");
  if (!lower.includes("full-stack")) projectSuggestions.push("Create a full-stack CRUD application.");

  return {
    score: score,
    ats_score: score,
    formattingScore: sections.size * 10,
    strengths: foundTechnical.slice(0, 5),
    improvements: sectionImprovements.map(si => si.suggestion),
    keywordGaps: missingKeywords,
    overallFeedback: skillGap,
    missing_keywords: missingKeywords,
    skill_gap_analysis: skillGap,
    section_improvements: sectionImprovements,
    better_wording: betterWording,
    action_verbs: STRONG_ACTION_VERBS.filter((v) => !lower.includes(v.toLowerCase())).slice(0, 10),
    projects_to_add: projectSuggestions,
    job_opportunities_query: foundTechnical.slice(0, 3).join(" ") + " developer jobs",
    improvedRaw: rewriteResumeLocally(resumeText)
  };
}

export function rewriteResumeLocally(resumeText: string): string {
  let improved = resumeText;
  for (const [weak, strong] of Object.entries(WEAK_PHRASES)) {
    const regex = new RegExp(weak, "gi");
    const replacement = strong.split(" / ")[0];
    improved = improved.replace(regex, replacement);
  }

  const sections = detectSections(improved.toLowerCase());
  let output = "═══════════════════════════════════════\n";
  output += "              RESUME\n";
  output += "═══════════════════════════════════════\n\n";

  output += "───────────────────────────────────────\n";
  output += "PROFESSIONAL SUMMARY\n";
  output += "───────────────────────────────────────\n";
  output += "• Optimized profile focused on core technical competencies.\n\n";

  output += "───────────────────────────────────────\n";
  output += "SKILLS\n";
  output += "───────────────────────────────────────\n";
  output += "• Technical skills extracted from provided text.\n\n";

  output += "───────────────────────────────────────\n";
  output += "EXPERIENCE\n";
  output += "───────────────────────────────────────\n";
  output += improved.substring(0, 400) + "...\n";

  return output;
}
