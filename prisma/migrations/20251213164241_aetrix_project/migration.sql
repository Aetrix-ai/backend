-- CreateTable
CREATE TABLE "AetrixProjects" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repoLink" TEXT,
    "sandbox" TEXT NOT NULL,
    "deployLink" TEXT,
    "userId" INTEGER,

    CONSTRAINT "AetrixProjects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AetrixProjects" ADD CONSTRAINT "AetrixProjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
