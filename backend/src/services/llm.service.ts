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
        console.warn("No GEMINI_API_KEY found. Returning high-quality manual fallback challenge.");
        const safeLang = language.toLowerCase();

        if (type === 'CODE_REVIEW') {
            return {
                context: "E-commerce Payment Processing Logic",
                buggyCode: "async function processPayment(order) {\n  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n  const paymentResult = await stripe.charge(total);\n  // Bug: Not checking if payment was successful before fulfilling\n  await fulfillOrder(order.id);\n  return { success: true };\n}",
                expectedOutput: "Needs result check and error handling",
                issues: JSON.stringify(["Potential double fulfillment", "Missing payment status check", "No error handling for stripe.charge"]),
                correctCode: "async function processPayment(order) {\n  try {\n    const total = order.items.reduce((sum, item) => sum + item.price, 0);\n    const res = await stripe.charge(total);\n    if (res.status === 'succeeded') {\n      await fulfillOrder(order.id);\n      return { success: true };\n    }\n    throw new Error('Payment failed');\n  } catch (e) { return { success: false, error: e.message }; }\n}",
                hint1: "What happens if stripe.charge fails or returns a 'declined' status?",
                hint2: "The code proceeds to fulfill the order regardless of the payment result.",
                hint3: "Add a check for paymentResult.status and use a try/catch block."
            };
        }

        if (safeLang === 'python') {
            return {
                context: "Inventory Management System - Stock Calculation",
                buggyCode: "def update_stock(inventory, orders):\n    for order in orders:\n        item_id = order['item_id']\n        qty = order['quantity']\n        # Bug: Logic doesn't check if enough stock exists before deducting\n        inventory[item_id] -= qty\n    return inventory\n\ninv = {'A': 10, 'B': 5}\nords = [{'item_id': 'B', 'quantity': 10}]\nprint(update_stock(inv, ords))",
                correctCode: "def update_stock(inventory, orders):\n    for order in orders:\n        item_id = order['item_id']\n        qty = order['quantity']\n        if inventory.get(item_id, 0) >= qty:\n            inventory[item_id] -= qty\n    return inventory\n\ninv = {'A': 10, 'B': 5}\nords = [{'item_id': 'B', 'quantity': 10}]\nprint(update_stock(inv, ords))",
                expectedOutput: "{'A': 10, 'B': 5}",
                hint1: "Look at what happens when the requested quantity exceeds the current stock.",
                hint2: "The current implementation allows for negative inventory levels.",
                hint3: "Add a check using if inventory[item_id] >= qty before deduction."
            };
        } else if (safeLang === 'javascript') {
            return {
                context: "User Permission System - Role Verification",
                buggyCode: "function checkPermission(user, requiredRole) {\n    const roles = ['admin', 'editor', 'viewer'];\n    const userRank = roles.indexOf(user.role);\n    const requiredRank = roles.indexOf(requiredRole);\n    // Bug: A lower index means a higher rank here, so comparison is reversed\n    return userRank >= requiredRank;\n}\n\nconsole.log(checkPermission({role: 'admin'}, 'viewer'));",
                correctCode: "function checkPermission(user, requiredRole) {\n    const roles = ['admin', 'editor', 'viewer'];\n    const userRank = roles.indexOf(user.role);\n    const requiredRank = roles.indexOf(requiredRole);\n    // Fixed: Index 0 (admin) is higher than index 2 (viewer)\n    return userRank <= requiredRank && userRank !== -1;\n}\n\nconsole.log(checkPermission({role: 'admin'}, 'viewer'));",
                expectedOutput: "true",
                hint1: "Look at how the rank is determined by the array index.",
                hint2: "Does a higher index in the 'roles' array mean more or less permission?",
                hint3: "Since admin is at index 0 and viewer is at index 2, the rank comparison should use <=."
            };
        } else {
            return {
                context: "Generic Buffer Processor",
                buggyCode: "// Placeholder for a complex Buffer processing bug\nconsole.log('complex bug here');",
                correctCode: "// Placeholder fix\nconsole.log('fixed');",
                expectedOutput: "fixed",
                hint1: "Analyze the buffer allocation.",
                hint2: "Check for overflow conditions.",
                hint3: "Ensure correct indexing."
            };
        }
    }

    const prompt = `You are a Senior Principal Software Engineer. Generate a HIGH-STAKES, PRODUCTION-GRADE, and RUNNABLE programming challenge for ${language}. 
The type is ${type} and the difficulty level is ${difficulty}.

### ABSOLUTE PROHIBITIONS:
1. **NO TRIVIALITY**: Do not generate "mock_success", "hello world", or simple arithmetic errors. 
2. **NO OFF-BY-ONE IN SIMPLE LOOPS**: Avoid the classic "i+1" or "len(scores)" bugs. 
3. **NO BASIC SYNTAX ERRORS**: The code must be syntactically valid but logically broken.

### CHALLENGE REQUIREMENTS:
1. **Scenario**: Use a complex, realistic scenario (e.g., JWT verification, Rate Limiting, Depth-First Search with a state bug, Financial Ledger reconciliation, or Asynchronous Promise orchestration).
2. **Runnable**: The 'buggyCode' must be a self-contained, runnable script (30-60 lines). It should include a test case at the bottom that demonstrates the failure.
3. **The Bug**: The bug must be subtle. Examples:
    - Incorrect handling of null/undefined in a nested object.
    - A faulty sorting comparator that breaks for identical values.
    - Incorrect state update in a closure.
    - A missing 'await' in a critical loop.
    - Incorrect logic for a retry mechanism or backoff.

### RESPONSE FORMAT:
Return strictly a JSON object:
{
  "context": "Professional description of the scenario",
  "bugType": "One of: LOGICAL, EDGE_CASE, TYPE_ERROR, PERFORMANCE, SECURITY",
  "buggyCode": "Full runnable code",
  "expectedOutput": "The exact string output of the FIXED code",
  "correctCode": "The full fixed code",
  "hint1": "Area of concern",
  "hint2": "Expected vs Actual hint",
  "hint3": "Technical explanation of the flaw",
  "issues": null,
  "diagnosticPath": {
    "aiSteps": [{"action": "...", "reasoning": "...", "codeState": "..."}],
    "expertSteps": [{"action": "...", "reasoning": "...", "codeState": "..."}]
  }
}
Return ONLY the JSON.`;

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
