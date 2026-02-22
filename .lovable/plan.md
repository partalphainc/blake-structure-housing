

# Implementation Plan

This plan covers 6 changes you requested:

## 1. Forgot Password / Reset Password Flow
- Add a "Forgot password?" link on the Sign In tab in `src/pages/Auth.tsx`
- When clicked, show a form asking for email, then call the password reset function
- Create a new `src/pages/ResetPassword.tsx` page where users land after clicking the email link — shows a "set new password" form
- Add `/reset-password` route in `src/App.tsx`

## 2. Bigger White Fade Between Sections
- In `src/pages/Index.tsx`, increase the `WhiteFade` component height from `h-24 md:h-32` to `h-48 md:h-64` and boost the white opacity from `via-white/15` to `via-white/40` so it extends halfway into adjacent sections

## 3. Inquire Button Opens a Pop-Up Form
- In `src/components/AvailableUnitsSection.tsx`, replace the current `<a href="#contact">Inquire</a>` link with a dialog/modal pop-up
- The pop-up collects: Name, Phone Number, Email
- On submit, show a success toast (no backend needed for now, or can be wired to the contact form logic later)

## 4. Lighten the Background Video
- In `src/components/HeroSection.tsx`, increase the video opacity from `opacity-50` to `opacity-70` and reduce the gradient overlay darkness (from `from-background/60 via-background/40` to `from-background/40 via-background/20`) so the walkthrough video is more visible

## 5. Fix Portal Login "Blinking" Issue
- The login blink happens because the `useEffect` in `Auth.tsx` checks for an existing session on mount and triggers navigation, which causes a flash. Fix by adding a loading state that shows a spinner while the session check runs, preventing the form from rendering and then immediately redirecting

## 6. Remove Lovable Branding
- In `index.html`: replace the `og:image` and `twitter:image` URLs pointing to `lovable.dev` with placeholder or remove them, and remove the `twitter:site` `@Lovable` meta tag
- Note: The `lovable-tagger` in `vite.config.ts` and the edge function's AI gateway URL are internal infrastructure and cannot be removed

---

## Technical Details

**Files to create:**
- `src/pages/ResetPassword.tsx` — password reset form page

**Files to modify:**
- `src/pages/Auth.tsx` — add forgot password link/form + fix blink with loading state
- `src/App.tsx` — add `/reset-password` route
- `src/pages/Index.tsx` — increase white fade height/opacity
- `src/components/AvailableUnitsSection.tsx` — add inquiry dialog with name/phone/email fields
- `src/components/HeroSection.tsx` — increase video opacity, reduce overlay
- `index.html` — remove Lovable branding from meta tags

