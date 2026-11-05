# keysflatsfishing.com — ShadowCaster Keys Flats Fishing

Static website built with [Eleventy](https://www.11ty.dev/), stored on GitHub and hosted on Netlify.
Rebuilt by Saltwater Marketing in November 2026 from the old WordPress/Elementor site (same design and copy, much faster).

## Making changes

**Client (no code):** go to **https://keysflatsfishing.com/admin/**, log in with GitHub, edit, and press **Publish**.
The live site updates in about a minute.

- **Fishing Reports** → New Fishing Report. Add a title, date, main photo and the report. Photos can be dropped straight in; they are resized automatically.
- **Settings → Trips & Prices** changes the price everywhere on the site at once (home page cards, every rates table, the contact form).
- **Settings → Phone, Email, Booking & Menu** changes the phone number, email, FareHarbor link, menu and footer.
- **Pages** → open a page, expand "Page sections" and edit the text or swap a photo. Wrap words in `*stars*` in a heading to make them blue.

**SWM (with Claude):** open a task with this repo attached and describe the change.

## Where things live

| What | File |
|---|---|
| Phone, email, booking link, menu, tracking IDs | `src/_data/site.json` |
| Trip names and prices (one place for the whole site) | `src/_data/trips.json` |
| Captains | `src/_data/captains.json` |
| Reviews shown on the home page | `src/_data/reviews.json` |
| Each page's content (sections, in order) | `src/pages/*.md` |
| Fishing reports (one file each) | `src/posts/*.md` |
| Fishing Reports listing page | `src/fishing-reports.njk` |
| Section designs | `src/_includes/sections/*.njk` |
| All styles | `src/assets/css/site.css` |
| Old WordPress addresses → new addresses | `src/_redirects` |
| Editor setup | `src/admin/config.yml` |

## Speed notes

- Home page video: compressed from 12 MB (loaded twice) to 5.5 MB desktop / 2.6 MB phones, and it only starts downloading after the page has appeared. A still frame shows instantly.
- Captain John's video: 47 MB → 13.7 MB and only downloads when someone presses play.
- Images converted to WebP (page images 36 MB → 9.6 MB; report photos 274 MB → 41 MB), with sizes set and lazy-loading below the fold.
- Fonts are self-hosted. No WordPress, plugins, jQuery or page builder.
- Tracking (Google Tag Manager + Google tag) only loads on keysflatsfishing.com, so previews and local tests never count as visits.

## Running it locally (developers)

```bash
npm install
npm start        # http://localhost:8080
npm run build    # outputs _site/
```

## Launch checklist (one time)

1. Repo lives in the client's GitHub; SWM team members added as collaborators; Claude GitHub app approved on the repo.
2. Netlify → Add new site → Import from GitHub → pick this repo → Deploy (settings come from `netlify.toml`).
3. Editor login: Netlify → Site configuration → Access & security → OAuth → Install provider → GitHub (needs a GitHub OAuth app: Homepage `https://keysflatsfishing.com`, callback `https://api.netlify.com/auth/done`). Then put the repo name in `src/admin/config.yml` (`repo:`).
4. Netlify → Forms → enable form detection; set a notification email for the "contact" form.
5. Domain: Netlify → Domain management → add keysflatsfishing.com, then update DNS at the registrar.
6. Test: contact form, Book Now buttons (FareHarbor), GTM/GA4 real-time, a few old URLs redirecting.
7. Keep the WordPress site (and a full backup) for about two weeks before cancelling hosting.
