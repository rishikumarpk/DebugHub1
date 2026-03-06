import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance: GoogleGenerativeAI | null = null;
function getAi() {
    if (aiInstance) return aiInstance;
    const rawKey = process.env.GEMINI_API_KEY;
    if (rawKey) {
        const apiKey = rawKey.trim();
        console.log(`[AI] Initializing Gemini with sanitized key (length: ${apiKey.length})`);
        aiInstance = new GoogleGenerativeAI(apiKey);
    } else {
        console.error('[AI] CRITICAL: GEMINI_API_KEY is missing!');
    }
    return aiInstance;
}

export async function generateAiDiagnosticPath(bugType: string, buggyCode: string, context: string) {
    const ai = getAi();
    if (!ai) {
        console.warn("No GEMINI_API_KEY found. Returning mock AI diagnostic path.");
        return [
            { action: "Analyze Context", reasoning: `I notice this is a ${bugType} issue in the context of: ${context}. It seems related to a logic flaw.`, codeState: buggyCode },
            { action: "Formulate Hypothesis", reasoning: "The issue likely stems from an incorrect return value or an off-by-one error in the iteration.", codeState: buggyCode },
            { action: "Apply Fix", reasoning: "Modifying the logic to correctly calculate the total without the extraneous +1 fixes it.", codeState: buggyCode.replace("+ 1", "") }
        ];
    }

    const prompt = `Given the following buggy code with bug type '${bugType}' for context '${context}':\n\n${buggyCode}\n\nProvide an expert step-by-step diagnostic path to solve this. Return a JSON array of objects, where each object has:
- action: (string) short title of the step
- reasoning: (string) detailed thought process
- codeState: (string) optional, current state of the code after this step.
Return strictly the JSON array, no markdown formatting.`;

    try {
        console.log(`[AI-Path] Generating for: ${bugType} in ${context}...`);
        let text = "";
        let attemptError = null;

        const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI-Path] Trying model: ${modelName} (force v1beta)`);
                // Force v1beta api version since 2.5 models require it
                const model = ai.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                if (text) break;
            } catch (e: any) {
                console.warn(`[AI-Path] Model ${modelName} SDK failed: ${e.message}`);

                // FINAL FALLBACK: Direct REST API call if SDK fails
                try {
                    console.log(`[AI-Path] Trying Direct REST fallback for ${modelName}...`);
                    const fetch = require('node-fetch');
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY?.trim()}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    const resData = await res.json();
                    text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) break;
                } catch (fetchErr) {
                    console.error(`[AI-Path] Direct REST also failed: ${modelName}`);
                }
                attemptError = e;
            }
        }

        if (!text) return [];

        // Sanitize JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(`[AI-Path] Success, response length: ${text.length}`);

        return JSON.parse(text || "[]");
    } catch (error: any) {
        console.error("[AI-Path] Generation failed. Returning expert fallback path.", error.message);
        return [
            { action: "Symptom Analysis", reasoning: `Analyzing the reported ${bugType} in the context of ${context}.`, codeState: buggyCode },
            { action: "Vulnerability Identification", reasoning: "Identified a potential logical flaw in the conditional expression or data processing step.", codeState: buggyCode },
            { action: "Resolution", reasoning: "Applying high-fidelity fixes to ensure correct state transitions and data integrity.", codeState: buggyCode }
        ];
    }
}

export async function generateChallenge(language: string, type: 'DEBUGGING' | 'CODE_REVIEW', difficulty: string) {
    const ai = getAi();
    if (!ai) {
        console.warn("No GEMINI_API_KEY found. Returning mock challenge.");
        if (type === 'CODE_REVIEW') {
            return {
                context: "Authentication token validation function",
                buggyCode: "function validateToken(token) {\n  if(token == null) return false;\n  const decoded = jwt.decode(token);\n  // check role\n  if (decoded.role !== 'admin') return false;\n  return true;\n}",
                expectedOutput: "Needs signature verification",
                issues: JSON.stringify(["Missing signature verification (jwt.verify instead of jwt.decode)", "Insecure direct object reference check"]),
                correctCode: "function validateToken(token) {\n  if(!token) return false;\n  try {\n    const decoded = jwt.verify(token, SECRET);\n    return decoded.role === 'admin';\n  } catch(e) { return false; }\n}",
                hint1: "Is jwt.decode enough for security?",
                hint2: "What happens if the token is invalid or expired?",
                hint3: "Use jwt.verify to ensure the token's signature is valid."
            };
        }
        const safeLang = language.toLowerCase();

        let context = "Array filtering utility for user dashboard";
        let expectedOutput = "true";
        let buggyCode = "";
        let correctCode = "";
        let hint1 = "Look at the operator being used in the filter.";
        let hint2 = "Is it an assignment or a comparison?";
        let hint3 = "Change = to === or == for comparison.";

        if (safeLang === 'python') {
            buggyCode = "def get_active_users(users):\n  return [u for u in users if u.get('active') = True]\n\nprint(get_active_users([{'active': True}]))";
            correctCode = "def get_active_users(users):\n  return [u for u in users if u.get('active') == True]\n\nprint(get_active_users([{'active': True}]))";
        } else if (safeLang === 'java') {
            buggyCode = "public class Main {\n  public static boolean isActive(int active) {\n    return active = 1;\n  }\n  public static void main(String[] args) {\n    System.out.println(isActive(1));\n  }\n}";
            correctCode = "public class Main {\n  public static boolean isActive(int active) {\n    return active == 1;\n  }\n  public static void main(String[] args) {\n    System.out.println(isActive(1));\n  }\n}";
        } else if (safeLang === 'cpp' || safeLang === 'c') {
            buggyCode = "#include <iostream>\nbool isActive(int active) {\n  return active = 1;\n}\nint main() {\n  std::cout << isActive(1);\n  return 0;\n}";
            correctCode = "#include <iostream>\nbool isActive(int active) {\n  return active == 1;\n}\nint main() {\n  std::cout << isActive(1);\n  return 0;\n}";
        } else {
            // default javascript
            buggyCode = "function getActiveUsers(users) {\n  return users.filter(u => u.active = true);\n}\nconsole.log(getActiveUsers([{active: true}]));";
            correctCode = "function getActiveUsers(users) {\n  return users.filter(u => u.active === true);\n}\nconsole.log(getActiveUsers([{active: true}]));";
        }

        return {
            context,
            buggyCode,
            expectedOutput,
            issues: null,
            correctCode,
            hint1,
            hint2,
            hint3
        };
    }

    const prompt = `Generate a SUBSTANTIAL and REALISTIC programming challenge for ${language}. The type is ${type} and the difficulty is ${difficulty}. 

CRITICAL REQUIREMENTS FOR THE CODE:
- The buggyCode MUST be a FULL YET CONCISE AND RUNNABLE FILE (including imports, classes, and an entrypoint like main() or a function call at the bottom). Do NOT generate small snippets or functions in a vacuum.
- Include multiple functions/classes that interact with each other.
- Use real-world scenarios (e.g., API handlers, data processing pipelines, file parsers, algorithm implementations, database query builders).
- The bug should require careful reading and understanding of the full code to find — not immediately obvious.
- For EASY: Even "EASY" must be non-trivial. Avoid simple one-character syntax errors like a missing semicolon. Focus on subtle logical errors in 20-30 lines of code.
- For MEDIUM: include logical errors in multi-step processes, incorrect boundary conditions, or wrong data transformations.
- For HARD: include subtle concurrency issues, off-by-one errors in complex loops, or security vulnerabilities buried in business logic.
- The challenge should take a skilled developer at least 5-10 minutes to identify and fix.

HINTS REQUIREMENTS:
- Provide 3 HIGH-QUALITY progressive hints.
- Hint 1: General nudge about the area of the code or the nature of the problem.
- Hint 2: More specific, suggesting where the logic might be failing.
- Hint 3: Close to the solution, explaining why the specific fix is needed without just giving the code.
- Hints must NOT be vague like "Look at the code". They must be context-aware.

Return exactly a JSON object with the following fields:
- context: 1-2 line description of a realistic project scenario where this code lives.
- buggyCode: the code snippet containing the issue(s). MUST be 20+ lines with multiple functions.
- expectedOutput: string representation of the expected output when fixed (or "Code Review Passed" for CODE_REVIEW).
- correctCode: the fixed version of the code snippet.
- hint1: first progressive hint.
- hint2: second progressive hint.
- hint3: third progressive hint.
- issues: an array of strings detailing the specific issues to find (IMPORTANT: only include this if type is CODE_REVIEW, otherwise omit or null).

Return strictly the JSON object, no markdown formatting.`;

    try {
        console.log(`[AI-Challenge] Generating a ${difficulty} ${language} challenge...`);
        let text = "";
        let attemptError = null;

        // Try multiple model IDs because some regions or keys have different support
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI-Challenge] Trying model: ${modelName} (v1beta)`);
                const model = ai.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                if (text) break;
            } catch (e: any) {
                console.warn(`[AI-Challenge] Model ${modelName} SDK failed: ${e.message}`);

                // FINAL FALLBACK: Direct REST API call
                try {
                    console.log(`[AI-Challenge] Trying Direct REST fallback for ${modelName}...`);
                    const fetch = require('node-fetch');
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY?.trim()}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    const resData = await res.json();
                    text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) break;
                } catch (fetchErr) {
                    console.error(`[AI-Challenge] Direct REST also failed: ${modelName}`);
                }
                attemptError = e;
            }
        }

        if (!text) throw attemptError || new Error("All models failed to generate content");

        // Sanitize JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(`[AI-Challenge] Success, response length: ${text.length}`);

        const data = JSON.parse(text || "{}");
        if (data.issues && Array.isArray(data.issues)) {
            data.issues = JSON.stringify(data.issues);
        }
        return data;
    } catch (error: any) {
        console.error("[AI-Challenge] Final generation attempt failed.", error.message);
        throw error;
    }
}

export async function generatePersonalizedHint(scenarioContext: string, currentStateDesc: string, recentLogs: string[]) {
    const ai = getAi();
    if (!ai) {
        console.warn("No GEMINI_API_KEY found. Returning mock personalized hint.");
        return "Try looking at the active alerts or inspecting the initial configuration. You are bleeding error budget!";
    }

    const prompt = `You are an expert site reliability engineer and incident commander assistant. 
The user is playing an incident response simulation game. They are currently stuck.

SCENARIO CONTEXT:
${scenarioContext}

CURRENT SYSTEM STATE:
${currentStateDesc}

RECENT LOGS:
${recentLogs.join("\n")}

Based on this, what is ONE concise, completely personalized, and highly immersive hint you can give them right now? 
Do not give them the exact answer or command, but point them to the right clue.
Keep it under 2 sentences. Speak like an experienced on-call engineer advising a teammate.
`;

    try {
        console.log(`[AI-Hint] Generating personalized hint for scenario...`);
        let text = "";
        let attemptError = null;

        const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

        for (const modelName of modelsToTry) {
            try {
                const model = ai.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                if (text) break;
            } catch (e: any) {
                console.warn(`[AI-Hint] Model ${modelName} failed: ${e.message}`);
                attemptError = e;
            }
        }

        console.log(`[AI-Hint] Success, response length: ${text?.length || 0}`);
        return text?.trim() || "Check the recent logs for clues.";
    } catch (error: any) {
        console.error("[AI-Hint] Generation failed:", error.message);
        return "System error: unable to establish connection with senior engineering staff for advice.";
    }
}
