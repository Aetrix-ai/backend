/**
 * 
 *  public routes for accessing data
 * 
 */
import { Router } from "express";
import { prisma } from "../config.js";



export const publicRouter = Router()

publicRouter.get("/profile/:id", async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(401).json({
            "message": "id not provided"
        })
    }

    const parsedId = parseInt(id)
    if (!parsedId) {
        return res.status(401).json({
            "message": "invalid id"
        })
    }

    try {
        const user = await prisma.user.findFirst({
            where: { id: parsedId },
            include: {
                medias: true
            }
        })

        res.json({
            user
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Unable to get data from database"
        })
    }

})


//expects user id not project id
publicRouter.get("/project/:id", async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(401).json({
            "message": "id not provided"
        })
    }

    const parsedId = parseInt(id)
    if (!parsedId) {
        return res.status(401).json({
            "message": "invalid id"
        })
    }

    try {
        const user = await prisma.project.findMany({
            where: { userId: parsedId },
            include: {
                media: true
            }
        })

        res.json({
            user
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Unable to get data from database"
        })
    }

})


publicRouter.get("/achievments/:id", async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(401).json({
            "message": "id not provided"
        })
    }

    const parsedId = parseInt(id)
    if (!parsedId) {
        return res.status(401).json({
            "message": "invalid id"
        })
    }

    try {
        const user = await prisma.achievement.findMany({
            where: { userId: parsedId },
            include: {
                media: true
            }
        })

        res.json({
            user
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Unable to get data from database"
        })
    }

})


publicRouter.get("/skills/:id", async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(401).json({
            "message": "id not provided"
        })
    }

    const parsedId = parseInt(id)
    if (!parsedId) {
        return res.status(401).json({
            "message": "invalid id"
        })
    }

    try {
        const user = await prisma.skill.findMany({
            where: { userId: parsedId },

        })

        res.json({
            user
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Unable to get data from database"
        })
    }

})


