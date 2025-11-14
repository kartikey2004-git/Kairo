/*

- Prisma instance to query the database

- NextJS uses hot reloading : whenever we save something inside the app , it gonnna create new prisma client every single time and we don't want to do that


- In Next.js development mode (when you save a file), it hot-reloads your code multiple times.


- If you new PrismaClient() every time, you'll end up with many database connections open (which will eventually crash Neon/Postgres).  
   

-  don't crash your database due to multiple Prisma clients.

*/



// This imports the PrismaClient class from Prisma's generated client. This class is what you'll use to talk to your database (run queries, migrations, etc).


import { PrismaClient } from "@prisma/client";

// By attaching Prisma to globalThis, you ensure only one instance is reused across reloads.


// This global variable ensures that the Prisma client instance is reused across hot reloads during development.


const globalForPrisma = global 


// Without this, each time your application reloads, a new instance of the Prisma client would be created, potentially leading to connection issues.


const prisma = new PrismaClient() // Type-safe database client for TypeScript & Node.js


// ye prisma client humare postgreSQL database se baat krta hai

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma


export default prisma

/*

 In development (NODE_ENV !== "production"):

    - It assigns the db instance to globalThis.prisma.

    - So on the next reload, Prisma will reuse the same instance 


In production:

   - It does not attach Prisma to globalThis. 
   
   
   - This is because production runs once per request (no hot reload), so creating fresh instances is fine.


   - Follows best practices for both dev (reusing the client) and prod (creating per-deploy safe clients).


*/


// Optimised solution while you are developing prisma 

// Using prisma as an ORM layer inside our full stack application
