const pool = require('../db');

exports.createMatch = async (req, res) => {
  const { matchDate, matchTime, location } = req.body;
  try {
    const newMatch = await pool.query(
      "INSERT INTO matches (match_date, match_time, location) VALUES ($1, $2, $3) RETURNING *",
      [matchDate, matchTime, location]
    );
    res.json(newMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMatches = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM matches ORDER BY match_date DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
