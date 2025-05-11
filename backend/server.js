const express = require('express');
const { Client } = require('pg');

const app = express();

app.use(
  express.json()
);


const DB = {
  host:     'restapi-db.cfy664y6wbov.eu-north-1.rds.amazonaws.com',
  port:     5432,
  user:     'postgres',
  password: '########',
  database: 'restapi_db',
  ssl:      { rejectUnauthorized: false }
};
const db = () => new Client(DB);


let SECRET_NUMBER = Math.floor(Math.random() * 100) + 1;
const TABLE = 'leaderboard';


app.post('/guess', async (req, res) => {
  const { name, value, attempts } = req.body;
  if (!name || value === undefined) {
    return res.status(400).json({ error: 'name & value gerekli' });
  }

  let message;
  if (+value === SECRET_NUMBER) {
    message = 'TEBRİKLER! Tam bildiniz 🏆';


    const cli = db(); await cli.connect();
    const { rows } = await cli.query(
      `SELECT * FROM ${TABLE} WHERE player_name = $1`, [name]
    );


    if (rows.length > 0) {
      const player = rows[0];
      if (attempts < player.attempts) {
        await cli.query(
          `UPDATE ${TABLE} SET attempts = $1, played_at = NOW() WHERE player_name = $2`,
          [attempts, name]
        );
      }
    } else {

      await cli.query(
        `INSERT INTO ${TABLE} (player_name, attempts) VALUES ($1, $2)`,
        [name, attempts]
      );
    }


    SECRET_NUMBER = Math.floor(Math.random() * 100) + 1;

    await cli.end();
  } else {
    message = +value < SECRET_NUMBER
      ? 'Daha BÜYÜK bir sayı girin.'
      : 'Daha KÜÇÜK bir sayı girin.';
  }

  res.json({ message });
});


app.get('/leaderboard', async (_, res) => {
  const cli = db(); await cli.connect();
  const { rows } = await cli.query(
    `SELECT player_name, attempts, played_at
       FROM ${TABLE}
   ORDER BY attempts ASC, played_at ASC
      LIMIT 20`
  );
  await cli.end();
  res.json(rows);
});


const PORT = 4000;
app.listen(PORT, () => console.log(`Guess-API hazır → http://localhost:${PORT}`));
