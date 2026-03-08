import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { executeCode } from '../services/execution.service';
import { updateStreakOnSolve } from '../services/streak.service';
import { generateChallenge } from '../services/llm.service';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface RequestWithUser extends Request {
    user: {
        userId: string;
    };
}

router.get('/today', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userId = req.user.userId;

    try {
        // 1. Fetch user to get preferred language
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const language = user?.preferredLanguage || 'python';

        // 2. Randomize difficulty for today (Random but consistent for the date/language combo if we want)
        // Actually, to make it "universal" for everyone in that language, we should seed the random or just check if it exists.
        // If it doesn't exist, we pick a difficulty.

        // 3. Try to find today's challenge for THIS language
        let challenge = await prisma.dailyChallenge.findFirst({
            where: {
                date: today,
                language: language
            }
        });

        if (!challenge) {
            // Determine a universal difficulty for today (switches daily)
            const daySeed = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
            const difficulty = daySeed % 2 === 0 ? 'MEDIUM' : 'EASY';

            console.log(`Generating universal ${difficulty} challenge for ${language}...`);

            const type = 'DEBUGGING'; // Daily challenges are usually debugging
            const generated = await generateChallenge(language, type, difficulty);

            challenge = await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    type,
                    language,
                    difficulty,
                    bugType: generated.bugType || 'LOGICAL',
                    context: generated.context,
                    buggyCode: generated.buggyCode,
                    correctCode: generated.correctCode,
                    expectedOutput: generated.expectedOutput,
                    issues: generated.issues,
                    hint1: generated.hint1 || "Analyze the logic flow carefully.",
                    hint2: generated.hint2 || "Trace the values through the functions.",
                    hint3: generated.hint3 || "The fix involves correcting a subtle logical oversight."
                }
            });

            // Create AI and Expert diagnostic paths
            if (generated.diagnosticPath) {
                await prisma.diagnosticPath.create({
                    data: {
                        challengeId: challenge.id,
                        pathType: 'AI',
                        steps: JSON.stringify(generated.diagnosticPath.aiSteps || generated.diagnosticPath.expertSteps)
                    }
                });
                await prisma.diagnosticPath.create({
                    data: {
                        challengeId: challenge.id,
                        pathType: 'EXPERT',
                        steps: JSON.stringify(generated.diagnosticPath.expertSteps)
                    }
                });
            }
        }

        const { correctCode, ...safeChallenge } = challenge;

        // 4. Check if user already solved it
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

    } catch (error: any) {
        console.error("Failed to fetch/generate daily challenge:", error);
        return res.status(500).json({ error: 'Failed to retrieve today\'s challenge', details: error.message });
    }
});

// Get challenge history for the current user
router.get('/history', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    const userId = req.user.userId;
    try {
        const history = await prisma.challengeAttempt.findMany({
            where: { userId },
            include: {
                challenge: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        const formattedHistory = history.map(h => ({
            id: h.id,
            date: h.challenge?.date,
            language: h.challenge?.language,
            difficulty: h.challenge?.difficulty,
            type: 'DEBUGGING',
            solved: h.solved,
            score: Math.floor(Math.random() * 41) + 40 // Mock score for now
        }));

        res.json({ success: true, data: formattedHistory });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get global activity feed
router.get('/activity', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const activities = await prisma.challengeAttempt.findMany({
            where: { solved: true },
            include: {
                user: { select: { username: true } },
                challenge: { select: { type: true, context: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const formatted = activities.map(a => ({
            id: a.id,
            user: `@${a.user.username}`,
            action: `solved today's challenge`,
            time: a.createdAt,
            type: 'solved'
        }));

        res.json({ success: true, data: formatted });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get global leaderboard
router.get('/leaderboard', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    try {
        const streaks = await prisma.debugStreak.findMany({
            include: { user: { select: { username: true } } },
            orderBy: { rhythmScore: 'desc' },
            take: 5
        });

        const formatted = streaks.map((s, i) => ({
            rank: i + 1,
            name: `@${s.user.username}`,
            score: s.rhythmScore,
            barW: `w-[${s.rhythmScore}%]`,
            isYou: s.userId === req.user.userId
        }));

        res.json({ success: true, data: formatted });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/:id/run', authenticateJWT, async (req: Request, res: Response) => {
    const { code } = req.body;
    const challenge = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language as string, code, challenge);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/:id/submit', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    const { code, hintsUsed, timeTakenMs } = req.body;
    const userId = req.user.userId;

    const challenge = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language as string, code, challenge);

        const normalize = (s: string) => s.replace(/[\s'"\[\]{}()]/g, '').toLowerCase();
        const expected = (challenge.expectedOutput || '').trim();
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

router.get('/:id/answer', async (req: Request, res: Response) => {
    let challenge: any = await prisma.dailyChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) {
        challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id as string } });
    }
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: { correctCode: challenge.correctCode } });
});

router.get('/practice/:id/answer', async (req: Request, res: Response) => {
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: { correctCode: challenge.correctCode } });
});

// ===== PRACTICE MODE (Enhanced with LLM) =====
router.get('/practice/generate', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    console.log('[API] Practice generation requested by user:', req.user.userId);
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Fallbacks if not provided
    const language = (req.query.language as string) || (user?.preferredLanguage as string) || 'python';

    // Allowed difficulties
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const diffSelected = (req.query.difficulty as string);
    const difficulty = difficulties.includes(diffSelected) ? diffSelected : difficulties[Math.floor(Math.random() * difficulties.length)];

    try {
        console.log(`Generating a ${difficulty} ${language} practice challenge via LLM...`);
        const type = Math.random() > 0.8 ? 'CODE_REVIEW' : 'DEBUGGING';
        const generated = await generateChallenge(language as string, type, difficulty);

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

        // Create AI and Expert diagnostic paths for Practice
        if (generated.diagnosticPath) {
            await prisma.diagnosticPath.create({
                data: {
                    practiceChallengeId: challenge.id,
                    pathType: 'AI',
                    steps: JSON.stringify(generated.diagnosticPath.aiSteps || generated.diagnosticPath.expertSteps)
                }
            });
            await prisma.diagnosticPath.create({
                data: {
                    practiceChallengeId: challenge.id,
                    pathType: 'EXPERT',
                    steps: JSON.stringify(generated.diagnosticPath.expertSteps)
                }
            });
        }

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

router.post('/practice/:id/run', async (req: Request, res: Response) => {
    const { code } = req.body;
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    try {
        const result = await executeCode(challenge.language, code, challenge);
        res.json({ success: true, data: result });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/practice/:id/submit', authenticateJWT, async (req: RequestWithUser | any, res: Response) => {
    const { code } = req.body;
    const userId = req.user.userId;
    const challenge = await prisma.practiceChallenge.findUnique({ where: { id: req.params.id as string } });
    if (!challenge) return res.status(404).json({ error: 'Not found' });

    try {
        const result = await executeCode(challenge.language, code, challenge);
        const normalize = (s: string) => s.replace(/[\s'"\[\]{}()]/g, '').toLowerCase();
        const expected = challenge.expectedOutput.trim();
        const actual = ((result.stdout || '') + (result.stderr ? '\n' + result.stderr : '')).trim() || 'No output';
        const outputMatches = normalize(expected) === normalize(actual);
        const codeMatches = code.replace(/\s/g, '') === challenge.correctCode.replace(/\s/g, '');
        const isSolved = (outputMatches && result.exitCode === 0) || codeMatches;

        let attemptId = null;
        if (isSolved) {
            const attempt = await prisma.challengeAttempt.create({
                data: {
                    userId,
                    practiceChallengeId: challenge.id,
                    solved: true
                }
            });
            attemptId = attempt.id;

            const matchScore = Math.floor(Math.random() * 41) + 40;
            const mockHumanSteps = [
                { action: "Examine Practice Bug", reasoning: "Found the logic flaw in the practice challenge.", codeState: challenge.buggyCode },
                { action: "Apply Fix", reasoning: "Corrected the implementation based on expected output.", codeState: code }
            ];

            await prisma.diagnosticPath.create({
                data: {
                    practiceChallengeId: challenge.id,
                    userId,
                    attemptId: attempt.id,
                    pathType: 'HUMAN',
                    steps: JSON.stringify(mockHumanSteps),
                    matchScore
                }
            });
        }

        res.json({ success: true, data: { isSolved, result, expected, actual, attemptId } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

export default router;
