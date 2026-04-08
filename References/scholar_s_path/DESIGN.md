# Design System Specification: The Academic Curated Experience

## 1. Overview & Creative North Star: "The Scholar’s Sanctuary"
This design system is built to serve as a "Scholar’s Sanctuary"—a digital environment that bridges the gap between daunting academic complexity and the aspirations of first-generation students. To move beyond the generic "SaaS template" look, we employ an **Editorial High-Contrast** philosophy. 

The system rejects the "boxed-in" nature of traditional web design. Instead, it utilizes **The Layered Manuscript** approach: an intentional play of serif-led typography, expansive breathing room, and tonal depth. By using sophisticated layering and omitting harsh borders, we create a sense of infinite, organized space that feels both prestigious and accessible.

---

## 2. Color & Tonal Depth
Our palette is rooted in a "Deep Navy" foundation to command authority, balanced by "Sky Blue" to provide a sense of optimistic clarity.

### The "No-Line" Rule
To achieve a premium, custom aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts.
*   **Implementation:** A sidebar using `surface_container_low` should sit against a main content area of `surface`. The transition itself defines the edge, creating a cleaner, more sophisticated interface.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine cotton paper.
*   **Level 0 (Base):** `background` (#f8f9fa)
*   **Level 1 (Sections):** `surface_container_low` (#f3f4f5)
*   **Level 2 (Active Components):** `surface_container_lowest` (#ffffff)
*   **Level 3 (Pop-overs/Modals):** `surface_bright` (#f8f9fa)

### The "Glass & Gradient" Rule
For hero sections or primary CTAs, avoid flat color fills. Use a subtle linear gradient from `primary` (#022448) to `primary_container` (#1E3A5F) at a 135-degree angle. For floating navigation or headers, use **Glassmorphism**:
*   **Token:** `surface_container_lowest` at 80% opacity.
*   **Effect:** `backdrop-blur: 12px`. This allows content to flow behind the UI, suggesting depth and "soul" rather than a rigid digital wall.

---

## 3. Typography: The Editorial Voice
We utilize a high-contrast pairing to evoke the feeling of a modern academic journal.

*   **Display & Headlines (Newsreader Serif):** This is our "Authority" typeface. Use `display-lg` and `headline-md` for storytelling and page titles. The serif nature provides a sense of history and "earned" trust.
*   **Body & UI (Manrope Sans-Serif):** This is our "Clarity" typeface. It is highly legible, modern, and friendly. Use `body-lg` for long-form reading and `label-md` for functional metadata.
*   **Hierarchy Note:** Always lead with the serif headline to establish the "Editorial" tone, then transition to sans-serif for actionable data.

---

## 4. Elevation & Depth
Traditional shadows are often "muddy." This system uses **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Rather than adding a shadow to a card, place a `surface_container_lowest` card on a `surface_container` background. The slight shift in hex value creates a soft, natural lift.
*   **Ambient Shadows:** If a card *must* float (e.g., a critical notification), use a "tinted" shadow:
    *   `box-shadow: 0 12px 32px -4px rgba(2, 36, 72, 0.08);` (A subtle navy tint).
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a border (e.g., in high-contrast modes), use a `outline_variant` at **15% opacity**. Never use 100% black or grey.

---

## 5. Component Guidelines

### Buttons: The Precise Action
Buttons should feel like architectural elements.
*   **Primary:** `primary` background, `on_primary` text. Use `rounded-md` (0.375rem). No shadow; use a subtle inset glow on hover.
*   **Secondary:** `secondary_container` background, `on_secondary_container` text.
*   **Tertiary:** No background. Bold `primary` text.

### Cards & Lists: The No-Divider Rule
*   **Rule:** Forbid the use of horizontal rules (`<hr>`) to separate list items. 
*   **Solution:** Use vertical whitespace (1.5rem - 2rem) and `title-sm` headers to group content. If separation is visually required, use a subtle background shift to `surface_container_high` on every second item.

### Input Fields: The Reliable Entry
*   **Style:** Minimalist. No background fill—only a bottom border of `outline` (1px). Upon focus, the border transitions to `secondary` (2px) and the label floats using `label-sm` in the `secondary` color.

### Scholar-Specific Components
*   **The Research Note (Card):** A `surface_container_lowest` card with a `secondary` left-accent bar (4px). Used for highlighting key academic insights.
*   **The Progress Track:** A thin, `secondary_fixed_dim` track with a `secondary` indicator. No rounded ends—keep them sharp (0.125rem) to maintain a "precise instrument" feel.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Push a headline 1/3rd to the right to create "Editorial White Space."
*   **Do** prioritize high contrast (WCAG AAA) for all body text (`on_surface` on `surface`).
*   **Do** use the `newsreader` serif for quotes and testimonials to build credibility.

### Don’t:
*   **Don't** use "Card-in-Card" layouts with multiple shadows. Use background color shifts instead.
*   **Don't** use standard "Alert Red" for everything. Use `error_container` for backgrounds to keep the aesthetic soft and sophisticated.
*   **Don't** use rounded-full (pill) shapes for primary buttons. Stick to `md` (0.375rem) to maintain a serious, structured look.