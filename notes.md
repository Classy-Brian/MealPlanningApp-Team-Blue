-- DEPENDENCIES NEEDED --
Look into the package.json and look for "dependencies"
- There is one in the root and another in the frontend. Im not sure if its good practice but it's there when I started the expo project so yeah.
  - note: Im using windows so if you're not, the version might be different
  - note: Must install Node.js and npm
  - To install my dependencies, cd into the folder with the package.json and type: npm install

-- NEED TO DO --
- Create .env file
- Inside .env file
    MONGO_URI=...
    PORT=...
    EDAMAM_APP_ID=...
    EDAMAM_APP_KEY=....
- Need this to be able to connect to DB

-- TO RUN THE SERVER --
type in console: npm run dev

-- TO RUN THE FRONT-END --
type in console in frontend folder: npx expo start
