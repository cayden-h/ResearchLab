# Design System Document: The Scholarly Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system rejects the frantic, "move fast and break things" energy of typical AI startups. Instead, it adopts the persona of a prestigious university library—quiet, authoritative, and meticulously organized. We aim to empower first-generation students not by overwhelming them with tech, but by providing a serene, editorial environment that feels like a permanent academic home.

To move beyond "standard" UI, this system utilizes **The Editorial Grid**: an intentional use of asymmetrical whitespace and high-contrast typography scales. We prioritize "Breathing Room" over "Information Density," ensuring that complex academic data feels approachable and curated rather than cluttered.

---

## 2. Colors & Surface Philosophy

The palette is rooted in `primary` (#022448) for authority and `secondary` (#006687) for clarity. However, the sophistication of this system lies in its tonal transitions.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. They create visual "noise" that interferes with focus. Instead, boundaries are defined by **Background Shifts**.
*   Use `surface` (#f9f9f9) for the main canvas.
*   Use `surface-container-low` (#f3f3f3) for secondary sidebars.
*   Use `surface-container-highest` (#e2e2e2) to highlight active workspace areas.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like fine vellum paper stacked on a heavy desk. 
*   **Level 0:** `surface` (The Desk)
*   **Level 1:** `surface-container-lowest` (#ffffff) (The Primary Document/Card)
*   **Level 2:** `surface-container` (#eeeeee) (Nested insights or AI-generated metadata)

### The "Glass & Gradient" Rule
Main CTAs and Hero sections should avoid flat hex fills. Use a subtle linear gradient from `primary` (#022448) to `primary_container` (#1E3A5F) at a 135-degree angle. This adds a "lithographic" depth that signals premium quality. For floating AI assistants, use **Glassmorphism**: `surface_container_lowest` at 80% opacity with a 20px backdrop-blur to keep the user grounded in their research.

---

## 3. Typography: The Editorial Voice

We pair the humanist geometry of **Manrope** for displays with the hyper-legibility of **Inter** for utility.

*   **Display & Headlines (Manrope):** These are our "Institutional Pillars." Use `display-lg` (3.5rem) with negative letter-spacing (-0.02em) for landing moments. This creates an "Academic Journal" aesthetic.
*   **Body & Titles (Inter):** These are our "Working Hands." Use `body-lg` (1rem) for research abstracts to ensure maximum readability for students who may be navigating complex jargon.
*   **Hierarchy as Authority:** Always maintain a 2:1 ratio between headline and body size to create a clear, undebatable path for the eye to follow.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through tonal stacking. Avoid "Box Shadow" defaults.
*   **Active Lift:** To highlight a selected research paper, shift its background from `surface_container_lowest` to a pure White, and place it on a `surface_container_low` background. The shift in value provides the "lift."

### Ambient Shadows
When a card must float (e.g., a modal or tool-tip), use **Ambient Diffusion**:
*   `Shadow:` 0px 12px 32px rgba(2, 36, 72, 0.06). 
*   Note the use of the `primary` color (#022448) in the shadow instead of black. This creates a natural, "ink-on-paper" depth.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., high-contrast mode), use a **Ghost Border**: `outline_variant` (#c4c6cf) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.375rem) roundedness, and `label-md` uppercase typography with 0.05em tracking.
*   **Secondary:** No fill. `Ghost Border` (15% opacity `outline_variant`). On hover, transition to `surface_container_low`.

### Input Fields
*   **Refined Inputs:** Avoid the "box" look. Use a `surface_container_lowest` fill with a bottom-only stroke of `outline_variant` (20% opacity). Upon focus, the stroke animates to `secondary` (#006687) and expands to 2px.

### Cards & Research Lists
*   **No Dividers:** Prohibit the use of horizontal rules (`<hr>`). 
*   **The Spacing Rule:** Use exactly `2rem` (32px) of vertical white space between list items. Use a subtle `title-sm` header in `primary` to categorize groups.

### AI Insight Chips
*   Use `secondary_container` (#87d6fe) with `on_secondary_container` (#005d7c) text. These should have `full` (9999px) roundedness to contrast against the more "architectural" squareness of the rest of the UI.

### The "Annotator" Tooltip
*   Positioned with a 12px offset. Uses `inverse_surface` (#2f3131) background with `inverse_on_surface` text. This high-contrast "pop" ensures AI suggestions are never missed.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Let the left margin be wider than the right to mimic a modern textbook layout.
*   **Do** use "Optical Alignment." Align icons to the cap-height of text, not the bounding box.
*   **Do** favor `surface-container-low` for large background areas to reduce eye strain during long study sessions.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#1a1c1c) to keep the aesthetic "soft-serious."
*   **Don’t** use "Startup Purple" or "Neon Accents." We are building trust, not hype.
*   **Don’t** use heavy shadows. If the user can clearly see where the shadow starts, it’s too dark.
*   **Don’t** crowd the interface. If you are unsure, add more white space. If it feels "empty," it's likely working.