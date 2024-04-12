import express from 'express';
import connectDB from './db.js';
import postsRouter from './routes/posts.js';
import tagsRouter from './routes/tags.js';
import authRouter from './routes/auth.js';
import handleErrors from './middlewares/errorMiddleware.js';




const app = express();
connectDB();

app.use(express.json());
app.use('/api/posts', postsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/auth', authRouter);
app.use(handleErrors);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
