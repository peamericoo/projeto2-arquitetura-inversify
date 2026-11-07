import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { env } from './container/container';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API no ar em http://localhost:${PORT} (modo ${env}).`);
});
