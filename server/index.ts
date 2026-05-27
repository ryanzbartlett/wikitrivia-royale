import express from 'express';
import profilesRouter from './routes/profiles.ts';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Hello World!');
});

app.use('/profiles', profilesRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
