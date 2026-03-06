import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { executeCode } from '../services/execution.service';
import { updateStreakOnSolve } from '../services/streak.service';
import { generateChallenge } from '../services/llm.service';

const router = Router();
const prisma = new PrismaClient();

router.get('/today', async (req: any, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userId = req.user.userId;

    // 1. Daily Challenge is now UNIVERSAL (not personalized)
    // We randomize between EASY and MEDIUM for variety
    const dailyDifficulty = Math.random() > 0.5 ? 'MEDIUM' : 'EASY';

    // 2. Try to find today's challenge (Universal for all users)
    let challenge = await prisma.dailyChallenge.findFirst({
        where: {
            date: today
        }
    });

    if (!challenge) {
        console.log(`No challenge for today. Generating universal ${dailyDifficulty} bug...`);
        try {
            const type = Math.random() > 0.5 ? 'DEBUGGING' : 'CODE_REVIEW';

            // Daily Challenge is standardized to Python for a universal experience
            const language = 'python';

            const generated = await generateChallenge(language, type, dailyDifficulty);

            challenge = await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    type,
                    language,
                    difficulty: dailyDifficulty,
                    bugType: type === 'DEBUGGING' ? 'LOGICAL' : 'SECURITY',
                    context: generated.context,
                    buggyCode: generated.buggyCode,
                    correctCode: generated.correctCode,
                    expectedOutput: generated.expectedOutput,
                    issues: generated.issues,
                    hint1: generated.hint1 || "Look closely at the logic flow.",
                    hint2: generated.hint2 || "Think about edge cases or security implications.",
                    hint3: generated.hint3 || "The fix involves standard best practices for this language."
                }
            });
        } catch (error) {
            console.error("Failed to generate challenge:", error);
            return res.status(500).json({ error: 'Failed to generate today\'s challenge' });
        }
    }

    if (!challenge) return res.status(500).json({ error: 'Failed to retrieve challenge' });

    const { correctCode, ...safeChallenge } = challenge;
    // 3. Check if user already solved it
    const solvedAttempt = await prisma.challengeAttempt.findFirst({
        where: {
            challengeId: challenge.id,
            userId: userId,
            solved: true
        }
    });

    return res.json({
        success: true,
        data: {
            ...safeChallenge,
            isSolved: !!solvedAttempt
        }
    });
});

router.post('/:id/run', async (req: any, res: any) => {
    const { code } = req.body;
    const challenge = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language, code, challenge);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/:id/submit', async (req: any, res: any) => {
    const { code, hintsUsed, timeTakenMs } = req.body;
    const userId = req.user.userId;

    const challenge = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language, code, challenge);

        const normalize = (s: string) => s.replace(/[\s'"\[\]{}()]/g, '').toLowerCase();
        const expected = challenge.expectedOutput.trim();
        const actual = ((result.stdout || '') + (result.stderr ? '\n' + result.stderr : '')).trim() || 'No output';

        // Lenient comparison: normalize whitespace/punctuation, or check if code matches correctCode
        const outputMatches = normalize(expected) === normalize(actual);
        const codeMatches = code.replace(/\s/g, '') === challenge.correctCode.replace(/\s/g, '');
        const isSolved = (outputMatches && result.exitCode === 0) || codeMatches;

        const attempt = await prisma.challengeAttempt.create({
            data: {
                userId,
                challengeId: challenge.id,
                solved: isSolved,
                hintsUsed: hintsUsed || 0,
                timeTakenMs: timeTakenMs || 0
            }
        });

        if (isSolved) {
            const updatedStreak = await updateStreakOnSolve(userId);

            const matchScore = Math.floor(Math.random() * 41) + 40; // 40-80% match
            const mockHumanSteps = [
                { action: "Read Error Message", reasoning: "I noticed the error output saying something unexpected.", codeState: challenge.buggyCode },
                { action: "Attempt Debug Print", reasoning: "Added a print statement to verify the variable's value on line 4.", codeState: challenge.buggyCode },
                { action: "Fix Logic Error", reasoning: "Realized the condition is backwards. Reversing it fixes the issue.", codeState: code }
            ];

            await prisma.diagnosticPath.create({
                data: {
                    challengeId: challenge.id,
                    userId,
                    attemptId: attempt.id,
                    pathType: 'HUMAN',
                    steps: JSON.stringify(mockHumanSteps),
                    matchScore
                }
            });

            // Update average reasoning score on the already updated streak record
            const attemptsCount = await prisma.challengeAttempt.count({ where: { userId, solved: true } });
            const oldAvg = updatedStreak.avgReasoningScore || 0;
            const newAvg = Math.floor(((oldAvg * (attemptsCount - 1)) + matchScore) / attemptsCount);

            await prisma.debugStreak.update({
                where: { userId },
                data: { avgReasoningScore: newAvg }
            });
        }

        res.json({ success: true, data: { isSolved, result, expected, actual, attemptId: attempt.id } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/:id/answer', async (req: any, res) => {
    let challenge: any = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) {
        challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id } });
    }
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: { correctCode: challenge.correctCode } });
});

router.get('/practice/:id/answer', async (req: any, res) => {
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: { correctCode: challenge.correctCode } });
});

// ===== PRACTICE MODE (Enhanced with LLM) =====
router.get('/practice/generate', async (req: any, res) => {
    console.log('[API] Practice generation requested by user:', req.user.userId);
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Fallbacks if not provided
    const language = (req.query.language as string) || user?.preferredLanguage || 'python';

    // Allowed difficulties
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const diffSelected = (req.query.difficulty as string);
    const difficulty = difficulties.includes(diffSelected) ? diffSelected : difficulties[Math.floor(Math.random() * difficulties.length)];

    try {
        console.log(`Generating a ${difficulty} ${language} practice challenge via LLM...`);
        const type = Math.random() > 0.8 ? 'CODE_REVIEW' : 'DEBUGGING';
        const generated = await generateChallenge(language, type, difficulty);

        // Save LLM challenge to the database to give it an ID for submission/running
        const challenge = await prisma.practiceChallenge.create({
            data: {
                language,
                difficulty,
                bugType: type === 'DEBUGGING' ? 'LOGICAL' : 'SECURITY',
                context: generated.context,
                buggyCode: generated.buggyCode,
                correctCode: generated.correctCode,
                expectedOutput: generated.expectedOutput,
                issues: generated.issues,
                hint1: generated.hint1 || "Look at the logic context.",
                hint2: generated.hint2 || "Trace the variable states.",
                hint3: generated.hint3 || "The fix is related to language common practices."
            }
        });

        // Strip out the correctCode before sending to client
        const { correctCode, ...safeChallenge } = challenge;
        res.json({ success: true, data: safeChallenge });

    } catch (error: any) {
        console.error("Failed to generate practice challenge ERROR:", error);
        res.status(500).json({
            error: 'Failed to generate practice challenge',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.post('/practice/:id/run', async (req: any, res) => {
    const { code } = req.body;
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    try {
        const result = await executeCode(challenge.language, code, challenge);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/practice/:id/submit', async (req: any, res) => {
    const { code } = req.body;
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language, code, challenge);
        const normalize = (s: string) => s.replace(/[\s'"\[\]{}()]/g, '').toLowerCase();
        const expected = challenge.expectedOutput.trim();
        const actual = ((result.stdout || '') + (result.stderr ? '\n' + result.stderr : '')).trim() || 'No output';
        const outputMatches = normalize(expected) === normalize(actual);
        const codeMatches = code.replace(/\s/g, '') === challenge.correctCode.replace(/\s/g, '');
        const isSolved = (outputMatches && result.exitCode === 0) || codeMatches;

        // Practice mode: NO streak or rhythm updates
        res.json({ success: true, data: { isSolved, result, expected, actual } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

export default router;
