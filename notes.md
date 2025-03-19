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
    EDAMAM_APP_KEY=...
    JWT_SECRET=...
- Need this to be able to connect to DB

-- TO RUN THE SERVER --
type in console: npm run dev

-- TO RUN THE FRONT-END --
type in console: npx expo start

valerie's notes
- to run android, do
    npm run android
    and you're supposed to have an android emulator

download android studio (i used this link as a ref)
https://reactnative.dev/docs/set-up-your-environment?platform=android

in tsconfig.json, you need to add a line in the "include" frame,
    which is **/*.jsx

{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "123456",
    "allergies": ["Milk", "Egg", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Wheat", "Soybeans", "Sesame"],
    "profile": {
        "calories": { "min": 1200, "max": 2006, "current": 1500 },
		"recipes": { "tried": 2, "wantToTry": 5}
    }
}