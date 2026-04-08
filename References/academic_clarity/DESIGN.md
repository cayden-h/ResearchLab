# Design System Strategy: The Academic Atlas

## 1. Overview & Creative North Star: "The Academic Atlas"
This design system is built to transform the "ResearchBridge" experience from a standard utility into a high-end editorial environment. Our Creative North Star is **"The Academic Atlas"**—a concept that treats data not as a spreadsheet, but as a prestigious map. 

To serve first-generation and underrepresented students, the UI must exude authority and trust without being inaccessible. We break the "template" look by employing **Intentional Asymmetry**: using wide gutters, offset headline placements, and sophisticated, overlapping layers. This system rejects the rigid, boxed-in nature of traditional dashboards in favor of a "layered paper" aesthetic, where breathing room and typography-driven hierarchy guide the user with curated precision.

---

## 2. Colors: Tonal Architecture
The color palette is anchored in a deep, authoritative navy, balanced by a technical sky blue. However, the sophistication lies in the neutral "Surface" tiers.

- **Primary & Secondary:** Use `primary` (#022448) for core navigational anchors and `secondary` (#006687) for interactive accents.
- **The "No-Line" Rule:** To achieve a premium feel, designers are **prohibited from using 1px solid borders** to section content. Boundaries must be defined through background shifts. For example, a `surface_container_lowest` (#ffffff) card should sit on a `surface_container_low` (#f3f4f5) background. 
- **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    - **Base Layer:** `surface` (#f8f9fa).
    - **Content Sections:** `surface_container_low` (#f3f4f5).
    - **Actionable Cards:** `surface_container_lowest` (#ffffff).
- **The "Glass & Gradient" Rule:** Main CTAs or Hero sections should move beyond flat color. Use a subtle linear gradient from `primary` (#022448) to `primary_container` (#1e3a5f) at a 135-degree angle. For floating navigation or modal overlays, use **Glassmorphism**: a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 12px-20px.

---

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance modern scholarship with high-end editorial flair.

- **The Display Voice (Manrope):** All `display`, `headline`, and `title` tokens use **Manrope**. Its geometric yet warm curves provide a modern, "open" feel that welcomes students while maintaining a serious academic posture.
- **The Functional Voice (Inter):** All `body` and `label` tokens use **Inter**. Inter’s tall x-height ensures maximum legibility for data-rich research environments.
- **Hierarchy as Navigation:** Use `display-lg` (3.5rem) for high-impact welcome states to make the user feel "arrived." Use `label-sm` (0.6875rem) in `on_surface_variant` (#43474e) for metadata to keep the interface "data-rich but not cluttered."

---

## 4. Elevation & Depth: Atmospheric Layering
Traditional "drop shadows" are often a crutch for poor layout. This system prioritizes **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by stacking surface tiers (e.g., placing a `surface_container_high` element inside a `surface_container` area). This creates a soft "lift" without visual noise.
- **Ambient Shadows:** When a shadow is required for a floating state (like a dropdown), use an **Extra-Diffused Shadow**: `box-shadow: 0 12px 40px rgba(2, 36, 72, 0.06)`. Note the color: the shadow is a low-opacity tint of our Navy `primary`, never pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility in a low-contrast environment, use a "Ghost Border." This is the `outline_variant` (#c4c6cf) token set to **15% opacity**.
- **Soft Glass:** Use `surface_tint` (#455f87) at 5% opacity on top of white surfaces to create a "cool" metallic sheen that feels premium and custom.

---

## 5. Components: Bespoke Primitives

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`) with `on_primary` text. Border-radius: `md` (0.375rem).
- **Secondary:** Transparent background with a `Ghost Border` and `primary` text.
- **Tertiary:** No background or border; uses `secondary` (#006687) text with a 2px underline on hover.

### Cards & Lists
- **The Zero-Divider Rule:** Forbid the use of horizontal rules (`<hr>`). Separate list items using vertical white space (16px–24px) or by alternating background colors between `surface` and `surface_container_low`.
- **Cards:** No borders. Use `xl` (0.75rem) roundedness for a modern, friendly feel. On hover, a card should shift from `surface_container_lowest` to `surface_bright` with an `Ambient Shadow`.

### Chips & Badges
- **Academic Badges:** Use `secondary_container` (#87d6fe) with `on_secondary_container` (#005d7c) text. These should be `full` rounded (pills) to distinguish them from square-ish data cards.

### Input Fields
- **Editorial Style:** Inputs should not be boxes. Use a `surface_container_highest` (#e1e3e4) background with a thick 2px bottom-border of `outline` (#74777f). On focus, the bottom border transitions to `secondary` (#006687).

### New Component: The "Resource Insight" Panel
A specialized side-drawer for academic papers using a `surface_container_low` background and a `backdrop-blur`. It uses `headline-sm` for titles and `body-md` for abstracts, ensuring the "Atlas" feel of deep research.

---

## 6. Do's and Don'ts

### Do
- **Do** use intentional whitespace. If a section feels crowded, increase the padding rather than adding a border.
- **Do** use `on_surface_variant` (#43474e) for secondary text to maintain a high-trust, sophisticated contrast ratio.
- **Do** align large Display text to the left with wide margins to create an editorial "magazine" feel.

### Don't
- **Don't** use 100% opaque borders. It creates a "boxed-in" feeling that contradicts the modern, open North Star.
- **Don't** use pure black (#000000) for text or shadows. Use `on_surface` (#191c1d) or a navy-tinted shadow.
- **Don't** use standard "Material Design" blue. Stick strictly to the Navy and Sky Blue tokens provided to maintain the academic brand identity.
- **Don't** use icons without labels for first-generation students; clarity is the highest form of sophistication.