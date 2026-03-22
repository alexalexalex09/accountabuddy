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

- Add habits to track
- Daily reminders via push notifications
- Text responses about habit completion
- AI-powered analysis of responses (completion + sentiment)
- Escalating reminders in the evening if not completed
- Local storage (AsyncStorage)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your OpenAI API key in the `.env` file:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

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

- Add a new habit from the home screen
- Tap a habit to view details and submit daily responses
- Notifications remind you throughout the day; they become more urgent in the evening if the habit is not completed

## Notes

- AI analysis requires an internet connection and OpenAI API key
- Notifications require permission on the device
- Data is stored locally using AsyncStorage
