
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, CareerMatch, LearningPlan, QuizQuestion, ProjectAnalysis, PersonalityAnalysis, ScrapedJob, ATSAnalysis, MarketAnalysis } from "../types";

// Core Initialization - Using your Tier 1 Key automatically via process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * NEURAL QUOTA MONITOR
 * Tier 1 Enabled Architecture
 */
const savedProMode = localStorage.getItem('ace_pro_mode') === 'true';

export const quotaState = {
  callsThisMinute: 0,
  isCoolingDown: false,
  cooldownRemaining: 0,
  lastReset: Date.now(),
  isProMode: savedProMode
};

let lastRequestTime = 0;
// Tier 1 allows for virtually zero gap. 20ms provides safety buffer for browser networking.
const getMinGap = () => quotaState.isProMode ? 20 : 4500; 

const throttle = async () => {
  if (Date.now() - quotaState.lastReset > 60000) {
    quotaState.callsThisMinute = 0;
    quotaState.lastReset = Date.now();
  }

  if (quotaState.isCoolingDown && !quotaState.isProMode) {
    throw new QuotaError(`Neural link is cooling down. Ready in ${quotaState.cooldownRemaining}s.`);
  }

  const now = Date.now();
  const minGap = getMinGap();
  const timeSinceLast = now - lastRequestTime;
  
  if (timeSinceLast < minGap) {
    await new Promise(resolve => setTimeout(resolve, minGap - timeSinceLast));
  }
  
  lastRequestTime = Date.now();
};

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}

async function handleGeminiCall<T>(call: () => Promise<T>, retries = quotaState.isProMode ? 5 : 1): Promise<T> {
  try {
    await throttle();
    const result = await call();
    quotaState.callsThisMinute++;
    return result;
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isQuota = error.status === 429 || errorStr.includes('429') || errorStr.includes('quota');
    
    if (isQuota && retries > 0) {
      // Tier 1 Aggressive Backoff: 200ms initial wait
      const wait = quotaState.isProMode ? (200 * (6 - retries)) : 5000;
      await new Promise(resolve => setTimeout(resolve, wait));
      return handleGeminiCall(call, retries - 1);
    }

    if (isQuota && !quotaState.isProMode) {
      triggerCooldown();
    }
    throw error;
  }
}

function triggerCooldown() {
  quotaState.isCoolingDown = true;
  quotaState.cooldownRemaining = 30;
  const timer = setInterval(() => {
    quotaState.cooldownRemaining--;
    if (quotaState.cooldownRemaining <= 0 || quotaState.isProMode) {
      quotaState.isCoolingDown = false;
      clearInterval(timer);
    }
  }, 1000);
}

function safeExtractJson(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Extraction failed", text);
    throw new Error("AI response format error.");
  }
}

export const initiateProfile = async (resumeText: string): Promise<{ 
  resumeData: ResumeData, 
  analysis: ATSAnalysis, 
  rewritten: string 
}> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an elite career strategist. Analyze the provided resume text.
      Extract full structured profile data, perform ATS audit, and rewrite into LaTeX-style Markdown.
      Resume text: ${resumeText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumeData: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      company: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["title", "company", "duration", "description"],
                  },
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      degree: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      year: { type: Type.STRING },
                    },
                    required: ["degree", "institution", "year"],
                  },
                },
              },
              required: ["name", "email", "skills", "experience", "education"],
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                ats_score: { type: Type.NUMBER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywordGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                overallFeedback: { type: Type.STRING },
                action_verbs: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects_to_add: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["ats_score", "strengths", "improvements", "keywordGaps", "overallFeedback", "action_verbs", "projects_to_add"],
            },
            rewrittenMarkdown: {
              type: Type.STRING,
            },
          },
          required: ["resumeData", "analysis", "rewrittenMarkdown"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed.analysis && parsed.analysis.ats_score) {
      parsed.analysis.score = parsed.analysis.ats_score;
    }
    return {
      resumeData: parsed.resumeData,
      analysis: parsed.analysis,
      rewritten: parsed.rewrittenMarkdown
    };
  });
};

export const findJobMatches = async (resume: ResumeData | null, customQuery?: string): Promise<{ jobs: ScrapedJob[]; links: { title: string; url: string }[] }> => {
  return handleGeminiCall(async () => {
    const query = customQuery || (resume?.skills?.[0] || "Software Engineer");
    const prompt = `Act as a real-time job scraper. Find 5 highly relevant active job openings for "${query}". Provide a JSON array with title, company, location, salary, description, and applyUrl.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for better search logic
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const jobs = safeExtractJson(response.text || "[]");
    const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return { jobs, links: groundingLinks };
  });
};

export const getMarketTrends = async (userSkills: string[]): Promise<MarketAnalysis> => {
  return handleGeminiCall(async () => {
    const skillsString = userSkills.join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze current global tech job market trends for: ${skillsString}. Include news grounding.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsed = safeExtractJson(response.text || "{}");
    const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return {
      ...parsed,
      sources: groundingLinks
    };
  });
};

export const evaluateCareer = async (resume: ResumeData, targetRole: string): Promise<CareerMatch> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate technical alignment for ${targetRole}: ${JSON.stringify(resume)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateLearningPlan = async (gaps: string[], targetRole: string): Promise<LearningPlan> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 4-week learning roadmap for ${targetRole} gaps: ${gaps.join(', ')}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateQuiz = async (topic: string, difficulty: string): Promise<QuizQuestion[]> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-question ${difficulty} quiz on ${topic}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const assessPersonality = async (userName: string, answers: string[]): Promise<PersonalityAnalysis> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze behavioral DNA for ${userName}: ${JSON.stringify(answers)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzePerformance = async (role: string, transcript: string): Promise<{ score: number, verdict: string, drawbacks: string[], actionableSteps: string[] }> => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Audit interview transcript for ${role}: ${transcript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            drawbacks: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "verdict", "drawbacks", "actionableSteps"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzeProjectCode = async (projectName: string, files: {name: string, content: string}[]): Promise<ProjectAnalysis> => {
  return handleGeminiCall(async () => {
    const fileSummary = files.map(f => `File: ${f.name}\n${f.content.substring(0, 500)}`).join('\n\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Audit project "${projectName}":\n${fileSummary}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};
