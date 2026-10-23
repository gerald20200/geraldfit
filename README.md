# Geraldfit

Personal training dashboard built with React, Vite, Tailwind CSS, Lucide, and Firebase Authentication.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Firebase web app values. In Firebase Console, enable Email/Password and Google under **Authentication > Sign-in method**, create a Firestore database, and add your local/production hosts under **Authentication > Settings > Authorized domains**. Restart Vite after changing environment variables. Demo Mode is enabled automatically in local development and disabled in production unless `VITE_ENABLE_DEMO_MODE=true` is explicitly set.

Deploy `firestore.rules` to the configured Firebase project before accepting bookings. Booking requests are stored in Firestore and readable by their owner or a trusted admin with the `admin` custom claim. Set admin claims only from a trusted server using the Firebase Admin SDK. Configure an admin review/notification process before launch; Firestore storage alone does not email the coach. The workout builder uses local templates and the prompt studio copies prompts; neither sends data to an AI service.

## Production build

```sh
npm run build
npm run preview
```

For Firebase Hosting, select your Firebase project with `npx firebase-tools use --add`, then run `npm run build` and `npx firebase-tools deploy`. The deploy config publishes `dist` and the booking security rules. You still need to configure the Firebase environment variables and authorized domains for the deployed hostname.

For Vercel, import the repository and use the Vite defaults: build command `npm run build`, output directory `dist`, and install command `npm install`. Add the `VITE_FIREBASE_*` variables from `.env.example` in the Vercel project settings for Production and Preview as needed. Keep `VITE_ENABLE_DEMO_MODE` unset or `false` for production. Deploy `firestore.rules` to Firebase separately; Vercel does not deploy Firebase rules. `vercel.json` provides SPA rewrites for direct navigation to app routes.

For GitHub Pages, push this repository to a `main` branch and enable **Settings > Pages > Build and deployment > GitHub Actions**. Add the six `VITE_FIREBASE_*` values as repository Actions variables; these are client-side Firebase project identifiers, not server credentials. The included workflow builds and deploys the site, using hash routing so app routes work on GitHub Pages. Add the Pages hostname to Firebase Authentication's authorized domains and deploy `firestore.rules` separately. This workspace still needs to be pushed to a GitHub repository before the workflow can run.