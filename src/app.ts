import 'dotenv/config';

import express from 'express'; 

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import routes from './routes/index.js';

const app = express();
const port = process.env.PORT || 8080;


// middleware for parsing JSON
app.use(express.json());

// middleware for parsing cookies, allows for accessing cookies sent by request (req.cookies or req.signedCookies property)
app.use(cookieParser());

// Security middleware
app.use(helmet());

// CORS configuration (restricts requests to certain origins)
let frontend: string = '';
if (process.env.NODE_ENV === 'production') {
  //origin = 'frontend address'
} else {
  frontend = 'http://localhost:5173';
}

const corsOptions = { origin: frontend, credentials: true };

app.use(cors(corsOptions));

app.use(routes);


app.listen(port, () => {
  console.log(`FoodPrint backend listening on port ${port}`)
});

export default app;