-- CreateTable
CREATE TABLE "Blogs" (
    "id" SERIAL NOT NULL,
    "brief" TEXT NOT NULL DEFAULT 'New blog post about mental math !',
    "icon" TEXT NOT NULL DEFAULT '📜',
    "image" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d',
    "link" TEXT NOT NULL DEFAULT 'https://www.mentalup.co/blog/mental-math',
    "read" TEXT NOT NULL DEFAULT '8 min',
    "title" TEXT NOT NULL DEFAULT 'What Is Mental Math and Why It Matters',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blogs_pkey" PRIMARY KEY ("id")
);
