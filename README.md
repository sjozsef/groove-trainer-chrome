# Groove Trainer for Chrome

This is a YouTube-specific Chrome extension that helps you train your inner groove.

## How it works

When you activate the extension on a YouTube tab, it will randomly set the video's volume to zero and then back to its original level. Your task is to tap the beat on a table or play an instrument so that you don't lose time even when the music is silenced.

## How to use
1. Install the extension from the Chrome Web Store.
2. Open a video on YouTube and activate the extension by clicking its icon in the toolbar.
3. Use accurately recorded music.
4. Start with easy settings and basic music with a stable 4/4 time signature.

## Tips and Tricks

- **Count Subdivisions:** During the muted periods, keep the pulse by counting subdivisions (like "1-e-and-a-2-e-and-a...") in your head. This helps maintain accuracy.
- **Gradual Progression:** Begin with longer unmuted times and shorter muted times. As you improve, you can challenge yourself by increasing the muted duration in the Options.
- **Engage Your Body:** Tap your foot, nod your head, or use some other physical motion to keep time. This internalizes the beat and makes it easier to stay on track during silence.
- **Focus on the 'One':** If you get lost, focus on finding the downbeat (the 'one' of each measure) when the music comes back. This is the foundation of the groove.

## Options

You can configure the minimum and maximum duration for both muted and unmuted periods. Right-click the extension icon and select "Options" to access the settings page.

The available settings are:
- **Unmuted Time Min/Max (s):** The range of time a tab will stay unmuted.
- **Muted Time Min/Max (s):** The range of time a tab will be muted.

The extension will pick a random duration within these ranges for each cycle.

## Development

To set up a development environment for this extension:
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the project directory.

Any changes to the code will require you to reload the extension from the `chrome://extensions` page.

## Contribution

Contributions are welcome! If you have ideas for improvements or find any bugs, feel free to open an issue or submit a pull request.
