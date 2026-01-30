export {}; 
// allows userEmail to be added to req in auth middleware
declare module 'express-serve-static-core' {
  interface Request {
    userEmail?: string
  }
}

