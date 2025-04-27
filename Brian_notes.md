# Project Plan: AI Meal Planner Integration

**Overall Goal:** Use AI (like a creative chef) + Edamam (like a giant recipe book) to generate personalized meal plans.

---

## Phase 1: AI as the Idea Chef 💡

* **Status:** [`DONE`]
* **Goal:** Get structured *meal ideas* (JSON) from the AI Chef based on the user's order (preferences).
* **Analogy:** The AI is a chef who suggests *types* of meals, but doesn't write the full recipe yet. We need to give clear instructions and get the suggestions back on a specific form (JSON).
* **Checkpoints:**
    1.  ✅ **Read the Order Ticket:** Know exactly what user info (`allergies`, `dislikes`, `portion`, etc.) we need from `user.model.js`.
    2.  🆕 Set Up New Endpoint:
        * Define a new route path in AI.route.js (e.g., /generate-structured-plan).
        * Define a new controller function name in AI.controller.js (e.g., generateStructuredMealPlan).
    3.  ✍️ **Write Clear Instructions:** Create the prompt inside our new controller function, making sure it uses all user data and requests JSON output.
    4.  📞 **Call the Chef:** Implement the OpenAI API call within the new function, using the new prompt and requesting JSON format.
    5.  📋 **Read the Chef's Ideas:** Parse the JSON response received from the AI within the new function.

---

## Phase 2: Edamam as the Recipe Book 📚

* **Status:** [`DONE`]
* **Goal:** Find *real recipes* in the Edamam Recipe Book for the AI Chef's ideas.
* **Analogy:** Now we take the chef's ideas ("Spicy Pasta") and look them up in a massive cookbook (Edamam) to find actual recipes that fit the user's dietary rules.
* **Checkpoints:**
    1.  🔑 **Get Library Card:** Know how to access Edamam (API Keys).
    2.  🔍 **Use the Index:** Turn AI ideas + user rules ("Spicy Pasta", "nut-free", "< 600 kcal") into specific Edamam search queries.
    3.  🏃 **Fetch the Recipes:** Write code to actually call the Edamam API for each meal idea.
    4.  📝 **Copy Recipe Details:** Extract useful info (Recipe ID/Link, Name, Calories, Image) from Edamam's results.
    5.  ❓ **Handle Missing Recipes:** Plan for when the cookbook doesn't have a perfect match for an idea.

---

## Phase 3: Create the Final Menu 🍽️

* **Status:** [`PARTIALLY DONE`]
* **Goal:** Combine the AI's meal structure (Breakfast/Lunch/Dinner) with the real recipe details from the Edamam book.
* **Analogy:** We're taking the chef's basic meal structure and filling in the details using the specific recipes found in the cookbook to create the final menu for the customer.
* **Checkpoints:**
    1.  📐 **Design the Menu Layout:** Define the final JSON structure we'll send to the app (easy to display!).
    2.  🧩 **Assemble the Menu:** Write code to merge the AI structure and Edamam details into that final JSON.
    3.  💯 **Final Check:** Test the whole flow from user request to final JSON output.

---

## Phase 4: Frontend Integration & Polish ✨

* **Status:** [`DONE (Core Functionality)`] 
* **Goal:** Allow users to generate and view their AI-powered meal plan within the React frontend, triggered from the homepage.
* **Analogy:** Setting up the display case (UI) and connecting the 'Generate Menu' button (API call) so the customer can easily get and see their personalized menu (meal plan).
* **Checkpoints (Core Functionality - Homepage Button):**
    1.  🖱️ **UI Trigger:** Add a 'Generate AI Plan' button (or similar element) to the main Homepage component (e.g., `HomePage.js`).
    2.  💾 **State Setup:** In the Homepage component, implement `useState` hooks to manage:
        * `mealPlan` (to store the fetched plan object, default `null`).
        * `isLoading` (boolean, to show a loading state, default `false`).
        * `error` (to store any error messages, default `null`).
    3.  📞 **API Call Function:** Create an `async` function (e.g., `WorkspaceAiMealPlan`) within the component that will:
        * Set `isLoading` to `true`, clear previous `error` and `mealPlan`.
        * Get the user's authentication token (from context, local storage, etc.).
        * Make the `POST` request to `/api/ai/generate-structured-plan` with the auth header using `axios` or `Workspace`.
        * On success: Parse the response, update `mealPlan` state with `response.data.generatedPlan`.
        * On failure: Parse the error, update `error` state.
        * In a `finally` block: Set `isLoading` back to `false`.
    4.  🚦 **Conditional Rendering:** In the component's JSX:
        * Show a loading indicator (e.g., "Generating...") when `isLoading` is true.
        * Show an error message (e.g., contents of `error`) if `error` is not null.
        * Render the meal plan display only when `mealPlan` has data (and not loading or errored).
    5.  🍽️ **Plan Display Logic:** Create the JSX structure to display the `mealPlan` data:
        * Map or list out Breakfast, Lunch, Dinner sections.
        * For each meal, check `mealPlan[mealType].source`:
            * If `'edamam'`: Display `label`, `imageUrl`, `calories`, maybe link `url`.
            * If `'ai'` or `'ai_error'`: Display the `suggestion` text.

---

* **Checkpoints (Future Polish / Enhancements):** *(Still TODO)*
    * ✨ Improve styling and layout of the displayed plan.
    * 💾 Add 'Save Plan' functionality (Phase 5?).
    * 🔄 Add 'Regenerate Plan' button.
    * 🎉 Implement post-survey automatic generation (Hybrid approach).
    * 💪 More robust frontend error handling/user feedback messages.
    * 🖱️ Make the meal cards clickable (e.g., link to Edamam URL).
    * 🤔 Refine Edamam results (e.g., pick a better match than just the first hit, re-evaluate calorie filter).