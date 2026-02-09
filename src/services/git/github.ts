
import { Sandbox } from "e2b";
import { Octokit, } from "octokit"
import logger from "../../lib/logger.js";

interface CreateRepoReq {
    name: string,
    decription: string
}

interface GitError {
    err: Error
    msg: string

}
interface CreateRepoRes {
    url?: string
    err?: GitError
}


export class Github {
    private Octokit: Octokit

    constructor() {
        this.Octokit = new Octokit({
            auth: process.env.GIT_TOKEN
        });

    }

    async GetExistingRepos(): Promise<string[] | undefined> {
        try {
            const res = await this.Octokit.request('GET /orgs/{org}/repos', {
                org: 'Aetrix-ai',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            return res.data.map((repoData) => repoData.name)
        } catch (e) {
            console.log(e)
            return
        }
    }

    async SetupAndPush(REQ: CreateRepoReq, sbx: Sandbox): Promise<string | undefined> {
        const res = await this.CreateRepo(REQ)
        if (res.err) {
            console.log(res.err)
            logger.error(res.err.msg)
            return res.err.msg
        }

        if (!res.url) return

        if (!await this.ConfigGit(sbx, res.url)) return

        if (!await this.CommitAndPush(sbx, res.url)) return

        console.log("Created a github and code added success fully")

        return res.url
    }

    async CreateRepo(REQ: CreateRepoReq): Promise<CreateRepoRes> {
        try {
            const resp = await this.Octokit.request('POST /orgs/{org}/repos', {
                org: 'Aetrix-ai',
                name: REQ.name,
                description: REQ.decription,
                homepage: 'https://github.com',
                'private': false,
                has_issues: true,
                has_projects: true,
                has_wiki: true,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            return {
                url: resp.data.clone_url
            }
        } catch (e) {
            console.log(e)
            return {
                err: {
                    err: e as any,
                    msg: "Failed create a repo"
                }
            }
        }
    }


    async ConfigGit(sbx: Sandbox, Repo: string): Promise<boolean> {
        try {
            await sbx.commands.run(`
                set -e
                cd templates/react-starter

                echo "GIT_TOKEN present: \${GIT_TOKEN:+yes}"

                git config --global url."https://x-access-token:$GIT_TOKEN@github.com/".insteadOf "https://github.com/"
                git config --global user.email "ashintv3@gmail.com"
                git config --global user.name "ashintv"

                git remote remove origin || true
                git remote add origin ${Repo}
    `);

            return true;
        } catch (e) {
            logger.error("Error setting up git");
            console.error(e);
            return false;
        }
    }



    async CommitAndPush(
        sbx: Sandbox,
        msg = `commit-${Date.now()}`
    ): Promise<boolean> {
        try {
            await sbx.commands.run(`
                    set -e
                    cd templates/react-starter

                    git add .
                    git commit -m "${msg}" || echo "Nothing to commit"
                    git push -u origin master
            `);

            return true;
        } catch (e) {
            logger.error("Error pushing code");
            console.error(e);
            return false;
        }
    }


}