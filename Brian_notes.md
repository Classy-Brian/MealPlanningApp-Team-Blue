# Project Plan: AI Meal Planner Integration

**Overall Goal:** Use AI (like a creative chef) + Edamam (like a giant recipe book) to generate personalized meal plans and allow users to save them.

---

## Phase 1: AI as the Idea Chef 💡

* **Status:** [`DONE`]
* **Goal:** Get structured *meal ideas* (JSON) from the AI Chef based on user preferences.
* **Checkpoints:** ✅ Read Order Ticket, ✅ Setup New Endpoint, ✅ Write Prompt (JSON), ✅ Call AI, ✅ Parse AI JSON.

---

## Phase 2: Edamam as the Recipe Book 📚

* **Status:** [`DONE`]
* **Goal:** Find *real recipes* in Edamam for the AI Chef's ideas, applying filters.
* **Checkpoints:** ✅ Get API Keys, ✅ Add Filters (Health, Excluded), ✅ Loop & Fetch Recipes, ✅ Extract Recipe Details, ✅ Handle Missing Recipes (Fallback).

---

## Phase 3: Create the Final Menu Structure 🍽️

* **Status:** [`DONE`]
* **Goal:** Define and assemble the final JSON structure containing AI/Edamam results to be sent to the frontend.
* **Checkpoints:** ✅ Design Layout, ✅ Assemble Menu, ✅ Final Check.

---

## Phase 4: Frontend Integration & Display ✨

* **Status:** [`DONE (Core Functionality)`]
* **Goal:** Allow users to generate and view their AI-powered meal plan within the React frontend.
* **Checkpoints:** ✅ UI Trigger (Button), ✅ State Setup, ✅ API Call Function (`WorkspaceAiMealPlan`), ✅ Conditional Rendering, ✅ Plan Display Logic.

---

## Phase 5: Saving the AI Plan 💾

* **Status:** [`DONE`] *(Updated)*
* **Goal:** Persist the generated AI meal plan (`mealPlan` state) to the user's `savedDays` in the database for "Today".
* **Analogy:** Adding the approved menu to the kitchen's official schedule.
* **Checkpoints:**
    1.  ✅ **UI Integration:** Conditionally display AI plan and Save/Cancel buttons. *(Done)*
    2.  ✅ **Cancel Logic:** Implement "Cancel" button's `onPress`. *(Done)*
    3.  ✅ **Backend Check:** Review `POST /api/users/:userId/save-day` controller. *(Done)*
    4.  ✅ ⚙️ **Frontend: Data Transformation (`handleSaveAiPlan`):** Create function, get date, map `mealPlan` to `mealsToSave` (handle defaults/placeholders), calculate `totalCalories`. *(Done)*
    5.  ✅ 🔑 **Frontend: Get User ID:** Implement reliable way to get `userId` within `handleSaveAiPlan`. *(Done)*
    6.  ✅ 🚀 **Frontend: API Call & UI Update (`handleSaveAiPlan`):** Add `try/catch/finally`, saving state, call `axiosInstance.post`, handle success (Alert, `WorkspaceData()`, `setMealPlan(null)`), handle error (Alert). *(Done)*

---


## Phase 6: Email Notifications 📧

* **Status:** `[DONE]` *(New Phase)*
* **Goal:** Notify users via email about relevant events in the app.
* **Analogy:** Sending the customer a quick receipt or confirmation slip after they've placed their order.
* **Focus:** Start with event-triggered notifications.
* **Checkpoints (Meal Plan Saved Confirmation):**
    1.  📍 **Locate Trigger:** Identify success point in `saveCalendarDayForUser` backend controller (after `user.save()`). *(Done)*
    2.  🔘 **Prepare Content:** Inside controller, construct email `options` (`email`, `subject`, `message`). *(Next Step)*
    3.  🔘 **Call Send Function:** Call `await sendEmail(options)` with specific logging.
    4.  🔘 **Test End-to-End:** Trigger save from frontend, check DB save, check email received.

---