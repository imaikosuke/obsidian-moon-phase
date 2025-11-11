# Moon Phase

Display moon phase information in Obsidian with accurate calculations based on astronomical algorithms.

## Features

### Moon Phase Calculation
- Accurate moon age calculation using Julian Day
- Based on Meeus astronomical algorithms
- Calculates moon age (0-29.53 days)
- Calculates moon illumination percentage (0-100%)
- 8-phase moon phase detection (New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent)
- Calculates next new moon and full moon dates

### UI Display
- **Ribbon Icon**: Click the moon icon in the left sidebar to open the moon age modal
- **Status Bar**: Display moon phase with emoji, percentage, and phase name
- **Moon Age View**: Display moon phase emoji in the right sidebar
- **Moon Age Modal**: Shows detailed information in a dashboard layout:
  - Moon phase emoji and name (top row)
  - Moon age and illumination percentage with progress bar (center row, 2 columns)
  - Next new moon and full moon dates (event rows)
  - Hemisphere information (Northern/Southern)

### Commands
- **Show Moon Age**: Opens the moon age modal
- **Open Moon Age View**: Opens the moon age view in the right sidebar

### Settings
- Toggle status bar display on/off
- Toggle percentage display on/off
- Language selection (Auto, Japanese, English)
- Timezone/location selection:
  - Support for 17 timezones (including system default)
  - Use system default timezone
  - Automatic hemisphere detection based on timezone

### Internationalization
- Automatic language detection (uses Obsidian's `moment.locale()`)
- Manual language selection: Auto, Japanese, or English
- Supports Japanese and English
- Translated elements:
  - Command names
  - Ribbon icon tooltip
  - Settings screen items and descriptions
  - Modal text
  - Moon phase names
  - View names
  - Timezone selection display (all timezone names are translated)

### Timezone Support
Supports 17 timezones including:
- System Default
- Japan
- United States (Eastern)
- United Kingdom
- Germany
- France
- Australia (Sydney)
- China
- India
- Brazil (São Paulo)
- Canada (Toronto)
- Mexico
- Korea
- Singapore
- New Zealand
- South Africa
- Russia (Moscow)


## How to Use

### Installation
1. Open Obsidian Settings
2. Go to **Community plugins**
3. Search for "Moon Phase"
4. Click **Install** and then **Enable**

### Basic Usage
1. **View Moon Phase in Status Bar**: The moon phase is displayed in the status bar at the bottom of Obsidian (if enabled in settings)
2. **Open Moon Age Modal**: Click the moon icon (🌙) in the left sidebar, or use the command **Show Moon Age**
3. **Open Moon Age View**: Use the command **Open Moon Age View** to display the moon phase in the right sidebar

### Configuration
Go to **Settings → Moon Phase** to configure:
- **Show Status Bar**: Toggle moon phase display in the status bar
- **Show Percentage**: Toggle illumination percentage display
- **Language**: Select display language (Auto, Japanese, or English)
- **Timezone**: Select your timezone or use system default

## Development

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

### Prerequisites
- Node.js v16 or higher
- pnpm (install with `npm install -g pnpm`)

### Setup
1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development in watch mode:
   ```bash
   pnpm run dev
   ```
   This will compile TypeScript files and watch for changes.

### Project Structure
```
src/
  main.ts              # Plugin entry point
  settings.ts          # Settings interface and defaults
  types.ts             # TypeScript type definitions
  ui/
    MoonAgeView.ts     # Moon age view component
  utils/
    i18n.ts            # Internationalization utilities
    moonCalculation.ts # Moon phase calculation logic
    moonPhaseUtils.ts  # Moon phase utilities
    timezoneUtils.ts   # Timezone utilities
```

### Building for Production
```bash
pnpm run build
```

This will create `main.js` in the root directory, which can be used for distribution.

### First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS and pnpm (`npm install -g pnpm`), then run `pnpm install` in the command line under your repo folder.
- Run `pnpm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `pnpm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `pnpm version patch`, `pnpm version minor` or `pnpm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.


## Manually Installing the Plugin

For manual installation (e.g., for testing before release):

1. Build the plugin:
   ```bash
   pnpm run build
   ```

2. Copy the following files to your vault:
   ```
   VaultFolder/.obsidian/plugins/obsidian-moon-phase/
     - main.js
     - manifest.json
     - styles.css (if present)
   ```

3. Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Code Quality

### ESLint (Optional)
[ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.

To use eslint with this project:

1. Install eslint globally:
   ```bash
   pnpm add -g eslint
   ```
   Or using npm:
   ```bash
   npm install -g eslint
   ```

2. Analyze the source code:
   ```bash
   eslint ./src/
   ```
   
   ESLint will create a report with suggestions for code improvement by file and line number.

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
