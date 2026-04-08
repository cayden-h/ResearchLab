# Design System Strategy: The Digital Athenaeum

## 1. Overview & Creative North Star
This design system is built to serve as a digital sanctuary for first-generation and underrepresented researchers. We are moving away from the "disruptive startup" aesthetic and toward a concept we call **"The Digital Athenaeum."** 

The visual language must feel institutional yet accessible—stable, high-tech, and profoundly professional. To achieve an "Editorial" high-end feel, we move beyond the rigid, boxy grid of standard SaaS tools. Instead, we utilize **intentional asymmetry**, deep tonal layering, and sophisticated typography scales. We want the interface to feel like a curated research journal where the UI recedes, and the knowledge takes center stage.

## 2. Color & Tonal Depth
The color palette is anchored in deep, immersive navies (`surface: #091422`) to provide a focused, low-strain environment for academic work.

*   **The "No-Line" Rule:** To maintain a premium editorial feel, 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a main content area using `surface-container-low` should sit adjacent to a sidebar using `surface-container-lowest`. 
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of physical layers. 
    *   **Level 0 (Background):** `surface` (#091422) for the canvas.
    *   **Level 1 (Sections):** `surface-container-low` (#121c2b) for structural grouping.
    *   **Level 2 (Cards/Focus):** `surface-container-high` (#212a3a) for interactive elements.
    *   **Level 3 (Pop-overs):** `surface-container-highest` (#2b3545) for transient UI.
*   **The "Glass & Gradient" Rule:** Floating elements (like navigation bars or hovering tooltips) should utilize Glassmorphism. Use a semi-transparent `surface` color with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For high-priority CTAs or hero headers, use a subtle linear gradient from `primary` (#adc8f5) to `primary-container` (#1e3a5f). This adds a "soul" to the digital surface that flat colors lack.

## 3. Typography
The typography strategy pairs the technical precision of **Inter** with the architectural character of **Manrope**.

*   **Display & Headlines (Manrope):** Use `display-lg` (3.5rem) and `headline-md` (1.75rem) to create a sense of scale. The wide apertures of Manrope feel modern and high-tech, yet stable. Headlines should often be left-aligned with significant "breathing room" (padding) to the right to create an asymmetric editorial layout.
*   **Body & Labels (Inter):** Inter is used for all functional text (`body-md`: 0.875rem). It provides maximum legibility for complex academic citations. 
*   **Hierarchy for Trust:** Use `label-md` in `on-surface-variant` (#c4c6cf) for meta-data to ensure the primary information (the research) is the first thing the eye hits.

## 4. Elevation & Depth
In this system, depth is a function of light and tone, not shadows.

*   **The Layering Principle:** Avoid traditional "elevation levels." Instead, stack containers. Place a `surface-container-highest` card on top of a `surface-container-low` background. This creates a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a modal), use an ultra-diffused shadow. 
    *   *Formula:* `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow should feel like ambient occlusion, not a harsh drop shadow.
*   **The "Ghost Border" Fallback:** If a container requires more definition for accessibility, use a "Ghost Border." Apply `outline-variant` (#43474e) at **15% opacity**. This provides a whisper of a boundary without breaking the "No-Line" rule.

## 5. Components

### Buttons
*   **Primary:** A subtle gradient of `primary` to `primary_container`. Text color is `on_primary`. Shape: `md` (0.375rem).
*   **Secondary:** No fill. A Ghost Border (15% `outline-variant`) with `secondary` (#81d0f8) text.
*   **Tertiary:** Pure text with an underline that only appears on hover.

### Cards & Lists
*   **Constraint:** Forbid the use of divider lines.
*   **Execution:** Separate list items using a 12px vertical gap. For cards, use a `surface-container-high` background. In lists, use a 4px `primary` vertical accent bar on the left of an item to indicate "Active" or "Selected" states, rather than a full-box highlight.

### Input Fields
*   **Surface:** Use `surface-container-highest` to make inputs feel recessed into the page.
*   **States:** On focus, the border should not just change color; it should trigger a 2px outer glow using `secondary` (#81d0f8) at 20% opacity.

### Chips & Tags
*   Use `surface-variant` with `on-surface-variant` text. High-radius (`full`) for a softer, organic feel against the technical typography.

### Specialized Component: The Research Progress Rail
*   A custom vertical component for students. A thin line using `outline_variant` (10% opacity) with `primary` nodes representing milestones. It uses asymmetry—placed on the far left or right margin—to break the standard grid.

## 6. Do’s and Don’ts

*   **DO** use whitespace as a functional tool. If a section feels crowded, increase the padding-bottom by two steps on the scale rather than adding a divider.
*   **DO** use `tertiary` (#94ccff) for academic-specific highlights (e.g., peer-review status) to distinguish them from standard system actions.
*   **DON'T** use 100% opaque borders. They are the hallmark of generic, templated design.
*   **DON'T** use pure white backgrounds in this dark navy screen. Always use the specified `surface` or `surface-container` tiers to maintain the "Athenaeum" atmosphere.
*   **DON'T** center-align long blocks of text. Stick to the editorial "Left-Heavy" layout to maintain the professional, structured look.