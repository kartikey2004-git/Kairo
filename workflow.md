- CLI based full stack Application 

Part1. We are going to setup foundations of frontend and backend of our project

Main project folder: Kairo

  - working nextjs client(frontend)
  - and expressjs server(backend)
  
  1. create client and server folder
  2. install nextjs app with shadcn ui(client)
  3. init express app in (server)

----------------------------------------

  - Nextjs: 

   - The React Framework for the Web used by some of the world's largest companies
   
   - Next.js enables you to create high-quality web applications with the power of React components.

   - Nextjs 16 version
   - Shadcn introduced components.json , we can all configs and setting related to shadcn ui library

   - cn function inside lib/utils which is very useful for extending className to functional components

   - hooks like use-mobile for some responsiveness

   - components/ui have available all the shadcn ui components

   - all global css variables is written by shadcn here

   - we follow here industry standards which are production grade

   - shadcn supports pretty backwards things , so we don't need to worry about anything

   - also we can install a particular version of shadcn for better compatibility

   - setting up server with express.js

   - We can use typescript without installing it in nodejs new version

   - Now , we have setup project structure for our project

   - In nextjs chapter , we trying to connecting both of them and setting up some api routes and making our first request from client to server

   - before these thing we need to intialise our database

------------------------------------------

Chap2. Intialize Database using Prisma ORM
  
  - Install prisma and intialize prisma client in our express app (at server side backend)
  - get db url from neon db
  - make a test migration
  - make a new branch push towards github
  

