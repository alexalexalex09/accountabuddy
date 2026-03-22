# AccountaBuddy

A Duolingo-style accountability companion that helps individuals achieve their goals through encouragement, reminders, nudges, and playful guilting.

## Product Vision

AccountaBuddy acts as a personal accountability buddy for one or more goals. The app uses behavioral tactics and AI to persuade users to follow through on whatever timescale they choose—daily, weekly, or longer.

### Core Requirements

1. **Goals**
   - On first launch, users are prompted to create a goal.
   - Goals are easy to modify at any time.
   - Goals always include daily reminders but can target any timescale (daily, weekly, monthly, etc.).

2. **Accountability**
   - The app uses encouragement, reminding, nudging, and playful guilting to persuade users to achieve their goal on their chosen timescale.

3. **AI Context**
   - The AI sees all input the user writes in the main interface and the content of the user’s goal, so responses can be contextual and tailored.

4. **Notifications**
   - Notification times are based on behavioral psychology best practices.
   - May include user input such as sleep schedule or other preferences to optimize timing.

5. **Platforms**
   - Android app and mobile website first.
   - iPhone app next.
   - Wearables afterward.

6. **Authentication**
   - Email/password sign-in.
   - Google sign-in.

## Current Implementation

The app is in early development. Implemented so far:

- Goals with timescale (daily/weekly/monthly)
- First-launch onboarding and goal creation
- Editable goals (name, description, timescale)
- Daily check-ins with AI analysis (completion + sentiment)
- Push notifications (mobile only)
- Email/password and Google sign-in (optional, via Supabase)
- Local storage (AsyncStorage) or cloud sync (Supabase) when signed in

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   # Optional: for auth and sync
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

3. (Optional) Supabase setup for auth and cloud sync:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase/migrations/001_goals.sql` in the SQL Editor
   - Enable Email and Google providers in Authentication → Providers
   - Add the redirect URL from `npx expo start` (or use `accountabuddy://`) in Authentication → URL Configuration

3. (Windows) Make sure your Java SDK is set to **Java 17**. Android builds can fail on newer JDKs (e.g. JDK 21/GraalVM).
   - Install Temurin 17 (or another JDK 17 distribution)
   - Set `JAVA_HOME` to the JDK 17 install directory (restart your terminal afterward). For example:
     ```powershell
     setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot"
     ```

4. Run a development build.

   - **Quick (Expo Dev Client on Android):**
     ```
     npm run android
     ```

   - **Using EAS (recommended for internal dev builds):**
     1. Install the EAS CLI (if you haven't already):
        ```
        npm install -g eas-cli
        ```

     2. Run a development build:
        ```
        npx eas build --profile development --platform android
        ```

   - **Start Metro (JS bundler) only:**
     ```
     npx expo start
     ```

## Usage

- Add goals from the home screen (or create your first goal on first launch)
- Tap a goal to view details and submit daily check-ins
- Edit goals from the detail screen
- Sign in with email or Google to sync goals across devices
- Continue without signing in to use local storage only

## Notes

- AI analysis requires an internet connection and OpenAI API key
- Notifications require permission on the device (mobile only)
- Data is stored locally when not signed in; cloud sync when signed in
