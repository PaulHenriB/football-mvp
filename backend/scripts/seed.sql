-- ===========================================================
-- Football MVP Seed Data (manual fallback)
-- ===========================================================

-- Insert Users
INSERT INTO "User" ("firstName", "lastName", dob, "favoriteFoot", "favoritePosition", "phoneNumber", email, "passwordHash")
VALUES
  ('John', 'Doe', '1990-05-14', 'Right', 'MIDFIELDER', '+353871234567', 'john.doe@example.com', 'hashedpassword1'),
  ('Emma', 'Smith', '1993-08-22', 'Left', 'FORWARD', '+353861112223', 'emma.smith@example.com', 'hashedpassword2'),
  ('Liam', 'O''Brien', '1988-11-02', 'Right', 'DEFENDER', '+353851234987', 'liam.obrien@example.com', 'hashedpassword3');

-- Insert Players (linked to Users)
INSERT INTO "Player" (name, email, position, rating, "userId")
VALUES
  ('John Doe', 'john.doe@example.com', 'MIDFIELDER', 7.5, 1),
  ('Emma Smith', 'emma.smith@example.com', 'FORWARD', 8.2, 2),
  ('Liam O''Brien', 'liam.obrien@example.com', 'DEFENDER', 6.9, 3),
  ('Chris Martin', 'chris.martin@example.com', 'GOALKEEPER', 7.8, NULL);

-- Insert Groups
INSERT INTO "Group" (name) VALUES
  ('Dublin FC'),
  ('Evening Kickabouts');

-- Link Users to Groups
INSERT INTO "_UserGroups" ("A", "B")
VALUES
  (1, 1), -- John in Dublin FC
  (2, 1), -- Emma in Dublin FC
  (3, 2); -- Liam in Evening Kickabouts

-- Insert Matches
INSERT INTO "Match" (date, location, duration, fee, "createdBy", capacity, status, "homeScore", "awayScore")
VALUES
  ('2025-09-12 18:00:00', 'Irishtown Stadium', 90, 5.00, 1, 10, 'SCHEDULED', NULL, NULL),
  ('2025-09-05 19:30:00', 'Ringsend Park', 60, 0.00, 2, 12, 'FINISHED', 3, 2);

-- Insert PlayerMatch (linking players to matches & teams)
INSERT INTO "PlayerMatch" ("playerId", "matchId", team)
VALUES
  (1, 1, 'Home'),
  (2, 1, 'Away'),
  (3, 1, 'Home'),
  (4, 1, 'Away'),
  (1, 2, 'Home'),
  (2, 2, 'Away'),
  (3, 2, 'Home');

-- Insert Availability
INSERT INTO "Availability" ("playerId", "matchDate", "isAvailable")
VALUES
  (1, '2025-09-12 18:00:00', TRUE),
  (2, '2025-09-12 18:00:00', TRUE),
  (3, '2025-09-12 18:00:00', FALSE),
  (4, '2025-09-12 18:00:00', TRUE);

-- Insert Teams (explicit assignment)
INSERT INTO "Team" ("matchId", "playerId", "teamName")
VALUES
  (1, 1, 'Home'),
  (1, 2, 'Away'),
  (1, 3, 'Home'),
  (1, 4, 'Away');

-- Insert Ratings
INSERT INTO "Rating" ("playerId", "matchId", score, comment)
VALUES
  (1, 2, 8.0, 'Solid midfield performance'),
  (2, 2, 9.0, 'Scored twice, excellent'),
  (3, 2, 6.5, 'Good defense but lost marking'),
  (4, 2, 7.5, 'Some great saves in goal');
