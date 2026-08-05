// Optional standalone Express backend.
// Not required if you go all-in on Next.js API routes + Firebase,
// but kept here per the spec's Node.js/Express backend requirement
// (e.g. for heavier server-side workloads or a future multiplayer service).
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/skills', require('./routes/skills.routes'));
app.use('/api/progress', require('./routes/progress.routes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
