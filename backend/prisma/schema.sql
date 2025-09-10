-- ===========================================================
-- Football MVP Database Schema (manual fallback)
-- Based on schema.prisma
-- ===========================================================

-- Drop existing objects (DEV ONLY — wipes data!)
DROP TABLE IF EXISTS "Availability" CASCADE;
DROP TABLE IF EXISTS "PlayerMatch" CASCADE;
DROP TABLE IF EXISTS "Rating" CASCADE;
DROP TABLE IF EXISTS "Team" CASCADE;
DROP TABLE IF EXISTS "_UserGroups" CASCADE;
DROP TABLE IF EXISTS "Player" CASCADE;
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "Group" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Position" CASCADE;
DROP TYPE IF EXISTS "MatchStatus" CASCADE;

-- ===========================================================
-- Enums
-- ===========================================================

CREATE TYPE "Position" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD');
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'FINISHED');

-- ===========================================================
-- Tables
-- ===========================================================

CREATE TABLE "User" (
    id              SERIAL PRIMARY KEY,
    "firstName"     VARCHAR(255) NOT NULL,
    "lastName"      VARCHAR(255) NOT NULL,
    dob             TIMESTAMP NOT NULL,
    "favoriteFoot"  VARCHAR(50) NOT NULL,
    "favoritePosition" "Position" NOT NULL,
    "phoneNumber"   VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash"  VARCHAR(255) NOT NULL,
    "createdAt"     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "Player" (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    position  "Position" NOT NULL,
    rating    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "userId"  INT,
    CONSTRAINT fk_player_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE TABLE "Match" (
    id         SERIAL PRIMARY KEY,
    date       TIMESTAMP NOT NULL,
    location   VARCHAR(255) NOT NULL,
    duration   INT NOT NULL,
    fee        DOUBLE PRECISION NOT NULL,
    "createdBy" INT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    capacity   INT NOT NULL DEFAULT 10,
    status     "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INT,
    "awayScore" INT
);

CREATE TABLE "PlayerMatch" (
    id        SERIAL PRIMARY KEY,
    "playerId" INT NOT NULL,
    "matchId"  INT NOT NULL,
    team       VARCHAR(50) NOT NULL,
    CONSTRAINT fk_playermatch_player FOREIGN KEY ("playerId") REFERENCES "Player"(id) ON DELETE CASCADE,
    CONSTRAINT fk_playermatch_match FOREIGN KEY ("matchId") REFERENCES "Match"(id) ON DELETE CASCADE,
    CONSTRAINT uq_playermatch UNIQUE ("playerId", "matchId")
);

CREATE TABLE "Availability" (
    id          SERIAL PRIMARY KEY,
    "playerId"  INT NOT NULL,
    "matchDate" TIMESTAMP NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_availability_player FOREIGN KEY ("playerId") REFERENCES "Player"(id) ON DELETE CASCADE
);

CREATE TABLE "Group" (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "Team" (
    id        SERIAL PRIMARY KEY,
    "matchId" INT NOT NULL,
    "playerId" INT NOT NULL,
    "teamName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_team_match FOREIGN KEY ("matchId") REFERENCES "Match"(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_player FOREIGN KEY ("playerId") REFERENCES "Player"(id) ON DELETE CASCADE
);

CREATE TABLE "Rating" (
    id        SERIAL PRIMARY KEY,
    "playerId" INT NOT NULL,
    "matchId"  INT NOT NULL,
    score      DOUBLE PRECISION NOT NULL,
    comment    TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_rating_player FOREIGN KEY ("playerId") REFERENCES "Player"(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_match FOREIGN KEY ("matchId") REFERENCES "Match"(id) ON DELETE CASCADE,
    CONSTRAINT uq_rating UNIQUE ("playerId", "matchId")
);

-- Pivot table for User <-> Group many-to-many
CREATE TABLE "_UserGroups" (
    "A" INT NOT NULL,
    "B" INT NOT NULL,
    CONSTRAINT fk_usergroups_user FOREIGN KEY ("A") REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_usergroups_group FOREIGN KEY ("B") REFERENCES "Group"(id) ON DELETE CASCADE,
    CONSTRAINT uq_usergroups UNIQUE ("A", "B")
);

-- ===========================================================
-- Indexes (extra, for speed)
-- ===========================================================

CREATE INDEX idx_player_email ON "Player"(email);
CREATE INDEX idx_match_date ON "Match"(date);
CREATE INDEX idx_rating_match ON "Rating"("matchId");
CREATE INDEX idx_rating_player ON "Rating"("playerId");
