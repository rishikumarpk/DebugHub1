import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// List all open rooms
router.get('/', async (req, res) => {
    const { language, status } = req.query;
    try {
        const rooms = await prisma.debugRoom.findMany({
            where: {
                ...(language && { language: String(language).toLowerCase() }),
                ...(status && { status: String(status).toLowerCase() })
            },
            include: {
                creator: { select: { username: true, avatarUrl: true } },
                _count: { select: { fixes: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: rooms });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get specific room with its fixes
router.get('/:id', async (req, res) => {
    try {
        const room = await prisma.debugRoom.findUnique({
            where: { id: req.params.id },
            include: {
                creator: { select: { username: true, avatarUrl: true } },
                fixes: {
                    include: { user: { select: { username: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json({ success: true, data: room });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Create a new room
router.post('/', async (req: any, res) => {
    const userId = req.user.userId;
    const { title, language, difficulty, summary, buggyCode } = req.body;
    try {
        const room = await prisma.debugRoom.create({
            data: {
                title,
                language,
                difficulty,
                summary,
                buggyCode,
                creatorId: userId
            }
        });
        res.json({ success: true, data: room });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Suggest a fix for a room
router.post('/:id/fixes', async (req: any, res) => {
    const userId = req.user.userId;
    const roomId = req.params.id;
    const { fixedCode, explanation } = req.body;

    try {
        const room = await prisma.debugRoom.findUnique({ where: { id: roomId } });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const fix = await prisma.suggestedFix.create({
            data: {
                roomId,
                userId,
                fixedCode,
                explanation
            }
        });
        res.json({ success: true, data: fix });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Apply a fix (only creator can do this)
router.post('/:id/fixes/:fixId/apply', async (req: any, res) => {
    const userId = req.user.userId;
    const { id: roomId, fixId } = req.params;

    try {
        const room = await prisma.debugRoom.findUnique({ where: { id: roomId } });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        if (room.creatorId !== userId) return res.status(403).json({ error: 'Only the creator can apply fixes' });

        await prisma.$transaction([
            prisma.suggestedFix.update({
                where: { id: fixId },
                data: { isAccepted: true }
            }),
            prisma.debugRoom.update({
                where: { id: roomId },
                data: { status: 'solved' }
            })
        ]);

        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

export default router;
