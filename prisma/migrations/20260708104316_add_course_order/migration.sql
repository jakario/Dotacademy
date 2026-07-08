-- AlterTable
ALTER TABLE "Course" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- UpdateData: set order values
UPDATE "Course" SET "order" = 1 WHERE title LIKE '%ความรู้ทั่วไปเกี่ยวกับกรมการท่องเที่ยว%';
UPDATE "Course" SET "order" = 2 WHERE title LIKE '%บทบาท%' OR title LIKE '%หน้าที่%' OR title LIKE '%หน่วยงานภายใน%';
UPDATE "Course" SET "order" = 3 WHERE title LIKE '%วิดีโอแนะนำ%' OR title LIKE '%ส่งเสริมการท่องเที่ยว%';
