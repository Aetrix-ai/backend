import { Router } from "express";
import { Github } from "../services/git/github";
import z from "zod";
import { sandbox } from "../services/ai/sandbox";

export const GitRouter = Router()

const git = new Github()
const sandBox = sandbox()
const gitSchema = z.object({
    name: z.string().min(4, "minumum 4 char"),
    decription: z.string().optional(),
    commit: z.string().optional(),
})

GitRouter.post("/", async (req, res) => {
    //@ts-ignore
    const userId = req.user.id

    const parse = gitSchema.safeParse(req.body)
    if (!parse.success) {
        return res.status(404).json({
            "msg": "invalid input",
            "error": parse.error
        })
    }
    try {
        const sbx = await sandBox.connectToSandbox(userId)

        if (!sbx) {
            return res.status(500).json({
                "msg": "failed to connect"
            })
        }

        const url = await git.SetupAndPush({
            name: parse.data.name,
            decription: parse.data.decription ? parse.data.decription : ""
        }, sbx)

        res.json({
            msg: "succesfully created repositary",
            url
        })

    } catch (e) {
        return res.status(500).json({
            e
        })
    }
})


GitRouter.get("/validate/:name", async (req, res) => {
    const { name } = req.params

    if (!name) {
        return res.status(400).json({
            msg: "Please provide a valid name"
        })
    }

    const existingRepos = await git.GetExistingRepos()
    console.log(existingRepos, name)
    if (!existingRepos) {
        return res.status(500).json({
            msg: "Unable to fetch repo details"
        })
    }
    
    const isAvialable = !existingRepos.includes(name);
    res.status(200).json({
        isAvialable
    })
})


