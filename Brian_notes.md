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

* **Status:** [`TODO`]
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

* **Status:** [`TODO`]
* **Goal:** Combine the AI's meal structure (Breakfast/Lunch/Dinner) with the real recipe details from the Edamam book.
* **Analogy:** We're taking the chef's basic meal structure and filling in the details using the specific recipes found in the cookbook to create the final menu for the customer.
* **Checkpoints:**
    1.  📐 **Design the Menu Layout:** Define the final JSON structure we'll send to the app (easy to display!).
    2.  🧩 **Assemble the Menu:** Write code to merge the AI structure and Edamam details into that final JSON.
    3.  💯 **Final Check:** Test the whole flow from user request to final JSON output.

---

## Phase 4: Serve the Customer & Polish ✨ (Future)

* **Status:** [`TODO`]
* **Goal:** Show the plan in the app and add features.
* **Analogy:** Presenting the beautiful menu to the customer and adding service touches.
* **Checkpoints:** (Stuff for later)
    * 📱 Frontend display.
    * 💾 Buttons (`Save`, `Regenerate`).
    * ⚠️ Error handling.

---