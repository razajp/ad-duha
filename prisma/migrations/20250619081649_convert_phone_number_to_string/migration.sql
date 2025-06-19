-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthlyClient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" INTEGER NOT NULL
);
INSERT INTO "new_MonthlyClient" ("amount", "id", "name", "phone") SELECT "amount", "id", "name", "phone" FROM "MonthlyClient";
DROP TABLE "MonthlyClient";
ALTER TABLE "new_MonthlyClient" RENAME TO "MonthlyClient";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
