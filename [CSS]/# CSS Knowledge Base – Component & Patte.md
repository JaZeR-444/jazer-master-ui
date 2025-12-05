# CSS Knowledge Base – Component & Pattern Catalog

This is a combined list of reusable UI / CSS elements you can build into apps and websites.

---

🧱 Layout & Structure
---------------------

### Layout primitives

- **Container / Page Wrapper** – sets max-width, padding, and centers content.
- **Section Block** – vertical section with top/bottom padding and optional background.
- **Stack (Vertical Spacing)** – evenly spaced vertical children.
- **Inline Cluster** – inline-flex/gap cluster for chips, tags, icons.
- **Split Layout** – two-column hero (text + image/illustration).
- **Sidebar + Content** – fixed/scrolling sidebar next to main content.
- **Three-Column Layout** – responsive 3-up layout that collapses on small screens.
- **Card Grid** – responsive grid of cards (auto-fit, `minmax`).
- **Masonry-ish Card Grid** – uneven heights but tight layout using CSS grid tricks.
- **Media Object** – image/avatar on left, text on right (classic list item).
- **Sticky Header** – header that stays at top on scroll.
- **Sticky Sub-Header** – section tabs or filters that stay pinned while content scrolls.
- **Sticky Footer Bar** – bottom CTA bar, mobile-friendly.
- **Centered Column Layout** – narrow reading column for docs/blog.
- **Full-Viewport Hero** – `min-height: 100vh` hero section.

---

✍️ Typography & Content Blocks
------------------------------

### Text styles

- **Page Title / H1 Display** – big, bold, brand-forward.
- **Section Heading + Eyebrow** – small label above heading.
- **Lead Paragraph** – slightly larger intro text.
- **Muted / Helper Text** – low-contrast explanatory text.
- **Caption Text** – small text under images or charts.
- **Code Snippet** – inline code (`<code>`) styling.
- **Code Block** – `<pre><code>` styling with a panel background.
- **Key/Value Pair** – label + value (settings, profiles, stats).
- **Data Stat Tile** – large numeric stat + label (e.g., “12 Builds Today”).
- **Timeline Item** – time + title + description.

### Content containers

- **Info Panel** – title, body, optional icon.
- **Quote / Testimonial Block** – stylized blockquote.
- **Feature List** – icon + title + description per feature.

---

🧭 Navigation & Shell
---------------------

### Primary navigation

- **Top Nav Bar** – logo, links, right-aligned actions.
- **App Shell Header** – product name, breadcrumbs, profile menu.
- **Sidebar Nav** – vertical nav with active item highlight.
- **Subnav / Secondary Tabs** – horizontal tabs under main nav.

### Navigation elements

- **Breadcrumb** – “Home / Projects / CodeGenesis”.
- **Tabs (Underline)** – classic horizontal tab strip.
- **Tabs (Pill)** – pill-style tabs with background.
- **Pagination** – previous/next with page numbers.
- **Segmented Control** – pill group behaving like a tab switcher.
- **Step Wizard / Stepper** – numbered steps with current state.

---

🎛️ Controls & Inputs
---------------------

### Buttons

- **Primary Button (Solid)** – main CTA.
- **Secondary Button (Outline)** – outlined version.
- **Ghost Button** – transparent with subtle border.
- **Destructive Button** – danger style for destructive actions.
- **Icon Button** – circular/square icon-only button.
- **Button Group / Toolbar** – horizontally grouped buttons.
- **Chip Button** – pill-like clickable chip.

### Form controls

- **Text Input** – base input styling.
- **Textarea** – multi-line input with resize rules.
- **Select Dropdown** – custom-styled `<select>` (or wrapper).
- **Checkbox** – styled box + label.
- **Checkbox Pill** – pill that toggles on/off, not just raw checkbox.
- **Radio Group** – horizontal/vertical radio buttons.
- **Toggle Switch** – on/off switch styling.
- **Slider Input** – range slider with styled track & thumb.
- **Search Field** – input with search icon inside.
- **Inline Filter Chips** – chips with selected state.
- **Tag Input** – create multiple tags by typing and hitting enter.
- **File Upload Button** – custom-styled “Choose file” wrapper.
- **Drag-and-Drop Upload Zone** – dashed box with hover state.

---

🪟 Cards, Panels & Surfaces
---------------------------

- **Base Card** – neutral background, radius, padding.
- **Clickable Card** – hover effect and active state.
- **Glassmorphism Card** – frosted-glass style card.
- **Elevated Panel** – subtle shadow, for modals/overlays.
- **Inset Panel** – panel that looks “pressed in” (inset shadow).
- **List Row** – row with hover background (for tables/lists).
- **Settings Row** – label + description + control on right.
- **Stat Card** – icon, number, label.
- **Pricing / Plan Card** – highlightable plan tile.
- **Avatar Card** – profile picture + name + meta.
- **Media Card** – image thumbnail + title + meta.

---

🏷️ Labels, Badges & Status
---------------------------

- **Badge (Solid)** – small pill showing status.
- **Badge (Outline)** – outline-only variant.
- **Status Dot + Label** – colored dot with text (“● Online”).
- **Pill Tag** – removable tags (with “x” to dismiss).
- **Category Chip** – used for filters or categories.
- **Notification Count** – small circle over icon (“3”).

**Status variants you can standardize:**

- `success`
- `warning`
- `danger`
- `info`
- `neutral`

---

⚠️ Feedback, Alerts & Empty States
----------------------------------

- **Inline Alert** – full-width row with icon + message.
- **Toast Notification** – small floating message bottom-right.
- **Banner Alert** – top-of-page warning/info banner.
- **Validation Error Text** – red helper text below inputs.
- **Success Message Block** – success panel with icon.
- **Empty State Panel** – icon/illustration + text + CTA.
- **Loading Spinner** – simple CSS spinner.
- **Loading Skeleton** – shimmering placeholder shapes.
- **Progress Bar** – horizontal progress track.
- **Circular Progress** – ring-based progress indicator.

---

🌌 Overlays & Popups
--------------------

- **Modal Dialog** – centered overlay with backdrop.
- **Drawer** – side panel sliding from left/right.
- **Bottom Sheet** – mobile-style slide-up panel.
- **Popover** – small contextual panel anchored to element.
- **Tooltip** – small label on hover/focus.
- **Context Menu** – custom right-click or “…” menu.
- **Command Palette** – full-screen or centered searchable quick actions.

---

🎨 Visual Effects & Brand Bits
------------------------------

- **Gradient Background Section** – full-width gradient band.
- **Gradient Border** – border using `border-image` or pseudo-element.
- **Gradient Text** – gradient via `background-clip: text`.
- **Neon Glow Outline** – outer glow for buttons/cards.
- **Inner Glow Panel** – subtle inner glow for focus states.
- **Backdrop Blur Layer** – dim + blur background behind modal/drawer.
- **Card Hover Lift** – translate + shadow on hover.
- **Underline From Center** – animated underline on hover for links.
- **Border Pulse** – subtle pulse animation for special states.
- **Icon in Circle** – circular icon container with background and shadow.
- **Avatar Stack** – overlapping avatars for multi-user representation.
- **Thumbnail with Gradient Overlay** – image + gradient overlay + label.
- **Divider / Separator** – horizontal line with label or icon.

---

📱 Responsive & Theming Utilities
---------------------------------

- **Responsive Grid Utilities** – `.grid-2`, `.grid-3`, `.grid-auto` style helpers.
- **Visibility Helpers** – `.show-mobile`, `.show-desktop`.
- **Fluid Typography** – `clamp()`-based `font-size`.
- **Container Queries** – classes for components that adapt to width.
- **Dark Mode Theme** – `html[data-theme="dark"]` overrides.
- **High Contrast Mode** – accessibility-friendly theme toggle.
- **Reduced Motion Support** – `prefers-reduced-motion` overrides.
- **Z-Index Layers** – documented scale for overlays vs headers vs modals.

---

🧩 Utility Classes (Style Lego Bricks)
--------------------------------------

_Not components, but repeatable CSS tools._

- **Spacing utilities** – margin/padding/gap helpers (`.m-*`, `.p-*`, `.gap-*`).
- **Layout utilities** – flex/grid helpers (`.flex-center`, `.flex-between`, `.flex-wrap`, `.grid-center`).
- **Text utilities** – `.text-muted`, `.text-accent`, `.text-uppercase`, `.text-mono`.
- **Display utilities** – `.hidden`, `.sr-only`, `.inline-block`.
- **Border radius utilities** – `.rounded-sm`, `.rounded-md`, `.rounded-full`.
- **Shadow utilities** – `.shadow-sm`, `.shadow-md`, `.shadow-lg`.
- **Width/height utilities** – `.w-full`, `.max-w-*`, `.h-full`, `.min-h-screen`.

---

📊 Data Display & Tables
------------------------

- **Simple Table** – clean, minimal table.
- **Striped Table** – alternating row backgrounds.
- **Table with Sticky Header** – header row stays visible on scroll.
- **Table with Fixed First Column** – frozen first column for wide tables.
- **Compact Table** – reduced padding for dense data.
- **Table with Row Hover** – highlight row on hover.
- **Selectable Table Row** – clicking row selects/activates it.
- **Table with Sort Icons** – sortable columns with up/down indicators.
- **Table with Status Column** – colored badges in a status column.
- **Table with Actions Column** – “…” menu / inline buttons per row.
- **Responsive Table → Cards** – table becomes stacked cards on mobile.
- **Key Metrics Row** – summary row at top or bottom with totals/averages.
- **Inline Editable Cell** – click cell to edit value.
- **Log / Console Table** – monospace table styling for logs.
- **Kanban Column** – vertical stack of draggable cards.
- **Kanban Board** – multiple Kanban columns laid out horizontally.
- **Calendar Grid** – month view with days as cells.
- **Timeline / Activity Feed** – vertical feed of events with time + icon.
- **Tag Cloud** – keywords with size/weight differences.

---

💬 Communication & Social UI
----------------------------

- **Chat Bubble (Incoming)** – aligned left with distinct color.
- **Chat Bubble (Outgoing)** – aligned right with accent color.
- **Chat Message Group** – multiple messages grouped under one avatar.
- **Chat Input Bar** – textarea/input with send button and icons.
- **Conversation List Item** – avatar + name + preview + timestamp.
- **Notification Bell Icon + Badge** – bell icon with count badge.
- **Notification List Item** – icon + short text + timestamp.
- **Comment Thread** – nested comments with indentation.
- **Comment Input** – small editor for new comment/reply.
- **User Mention Chip** – `@user` styled inline element.
- **Reaction Bar** – emoji / icon reactions under a message or post.
- **Like / Favorite Button** – icon that toggles filled/outline.
- **Share Button Row** – horizontal row of social icons.
- **Profile Header Block** – avatar, name, handle, brief bio.
- **User Presence Indicator** – online/offline dot on avatar.

---

🔐 Auth & Account Flows
-----------------------

- **Auth Layout** – centered card with background illustration/gradient.
- **Login Form** – email/username + password + submit.
- **Signup Form** – name + email + password + confirm password.
- **Social Login Buttons** – Google/GitHub/etc. buttons.
- **Password Input with Toggle** – show/hide password icon.
- **Forgot Password Link** – small text link under password field.
- **Reset Password Form** – new password + confirm password.
- **Two-Factor Code Input** – 4–6 individual input boxes in a row.
- **Security Settings Panel** – list of security options with toggles/buttons.
- **Devices / Sessions List** – table or list of active sessions.
- **Profile Settings Form** – name, handle, avatar, etc.
- **Billing Info Panel** – card details, invoices section.

---

📄 Page Sections (Marketing & Docs)
-----------------------------------

- **Hero Section (Left Text, Right Visual)** – headline, copy, CTA, mockup.
- **Hero Section (Centered)** – big headline + subtext + primary/secondary buttons.
- **CTA Strip** – slim band with text + single CTA button.
- **Feature Grid** – 3–6 feature blocks with icon + title + copy.
- **Alternating Feature Rows** – image left/text right, then flipped.
- **Testimonial Card** – quote + name + role + avatar.
- **Testimonial Carousel Shell** – layout for multiple testimonials.
- **Logos Row** – “Trusted by” band with partner logos.
- **Pricing Section** – 3–4 plan cards with highlighted “most popular”.
- **FAQ Accordion** – question rows that expand/collapse.
- **Stats Section** – large numeric stats (e.g., “12M requests/day”).
- **Newsletter Signup** – input + button, small privacy note.
- **Footer (Simple)** – logo + copyright + small links.
- **Footer (Multi-Column)** – nav columns, newsletter, social icons.
- **Docs Sidebar Layout** – sidebar nav + content area.
- **Docs Article Header** – title, last updated date, tags.
- **Docs Feedback Row** – “Was this helpful? 👍 / 👎”.

---

🛠 Dev-Tool / Builder-Specific Components
-----------------------------------------

- **Code Editor Panel** – header (filename, tabs) + code area.
- **File Tree Sidebar** – nested list of files/folders with icons.
- **Diff View** – side-by-side or inline compare for added/removed lines.
- **Terminal Panel** – dark background, monospace, prompt styling.
- **Command Log List** – list of commands + statuses/icons.
- **Status Bar** – bottom bar with environment / branch / status indicators.
- **Environment Pill** – “Dev”, “Staging”, “Prod” pill with color coding.
- **Build Status Badge** – success/fail/in-progress indicator.
- **Pipeline Step List** – vertical list of pipeline steps with status icons.
- **Inspector Panel** – right-side panel for details of selected item.
- **Property Grid** – label + control pairs (sliders, toggles, dropdowns).
- **Resizable Split View** – two panels with draggable divider.
- **Output Console** – area that shows logs, warnings, errors.
- **Error Stack Trace Block** – formatted multi-line stack trace.
- **Shortcut Cheat Sheet** – modal/card with keyboard shortcuts layout.

---

🤖 AI / LLM UX Elements
-----------------------

- **Prompt Input Box** – large, multi-line box with “Send” button.
- **Prompt Toolbar** – model selector, temperature, tools, etc.
- **Message Bubble (AI)** – styled differently from user’s bubble (icon, color).
- **Message Metadata Row** – model name, time, tokens, etc.
- **Code Block with Copy Button** – code panel + “Copy” icon.
- **Inline Tool Call Block** – mini card showing a tool call + result.
- **Suggestion Chips** – quick prompt suggestions under the chat.
- **System / Info Message** – different style for system notices.
- **Thread Sidebar** – list of recent chats or conversation branches.
- **Run History List** – list of prior runs with status + duration.
- **Model Card** – description of a model with capabilities/limits.
- **AI Output Diff Block** – compare two responses side-by-side.
- **Rating / Feedback Row** – thumbs up/down + free-text feedback.

---

🧩 Meta: Utility / Structure Around All This
--------------------------------------------

- **Component Category Tags** – e.g., `layout`, `data`, `marketing`, `devtool`, `ai-ux`.
- **Complexity Level** – `basic`, `intermediate`, `advanced`.
- **Usage Frequency** – `core`, `nice-to-have`, `rare`.
- **Platform Fit** – `web app`, `marketing site`, `dashboard`, `mobile web`.

---

🧾 Forms & Validation System
----------------------------

### Form Layout & Structure

- **Base Form Layout** – stacked form with label → field → helper/error.
- **Form Section Group** – visual group with title + description + body.
- **Form Actions Row** – bottom row with primary/secondary/cancel actions.
- **Inline Form (Compact)** – horizontal layout for compact forms (e.g., newsletter).
- **Two-Column Form Layout** – labels/descriptions left, inputs right.

### Field-Level Components & States

- **Text Input (Base)** – shared styling for text/email/password inputs.
- **Textarea (Multi-line)** – multi-line input with min-height.
- **Select / Dropdown Field** – styled select or custom dropdown shell.
- **Checkbox Field** – checkbox + label + optional description.
- **Radio Group** – stacked or inline radios with labels.
- **Toggle Switch** – boolean on/off switch.
- **Slider / Range Input** – range input with styled track + thumb.
- **Input with Icon / Addons** – prefix/suffix icons or text inside input.
- **Input with Counter / Max Length** – shows “34 / 120” style character counter.

### Validation & Messaging

- **Field-Level Error State** – error styling for fields + error text.
- **Field-Level Success / Info State** – success/info visual states.
- **Form-Level Error Banner** – summary alert at top of form after submit.
- **Required / Optional Indicators** – consistent required/optional markers.
- **Validation Summary List** – list of errors near top, pointing to fields.

### UX / Comfort Features

- **Placeholder vs Label Patterns** – standardized approach (floating labels/top labels).
- **Inline Hint / Helper Text** – low-contrast helper text under labels.
- **Password Field with Visibility Toggle** – show/hide password icon and behavior.
- **Date / Time Field Shell** – layout shell for date/time pickers.
- **Autocomplete / Suggestion Field Shell** – input + suggestion dropdown.
- **Multi-Select Chip Field** – input that turns entries into removable chips/tags.

### Flow-Level Form Patterns

- **Multi-Step Form / Wizard** – step header, progress bar, next/prev buttons.
- **Review & Confirm Step** – summary of form data before final submit.
- **Save Draft / Autosave Indicator** – pattern for “Saved · Just now” vs unsaved.
- **Loading / Submitting State** – disabled fields + spinner on submit.
- **Success Confirmation Screen** – post-submit confirmation panel + next steps.

### Accessibility & Behavior Helpers

- **Error Linking & Focus Management Shell** – convention for focusing first invalid field.
- **Required Fields Legend / Explanation Row** – note explaining required/optional fields.
- **Keyboard-Friendly Focus Styles** – consistent focus ring across fields and buttons.