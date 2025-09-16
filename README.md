# YT Recycle Bin Finder

A simple web tool to generate search queries for finding YouTube videos with few to no views.

**[Go to the Live Tool Here!](https://YourUsername.github.io/YourRepositoryName/)** 

[![image.png](https://i.postimg.cc/ZR6T8TSV/image.png)](https://postimg.cc/wyT8HY3m)

## About The Project

This project is a web-based tool that makes it easy to explore the hidden corners of YouTube. It's based on the incredible community-sourced map of search patterns originally created by **KVN AUST & Mika_Virus**, which helps uncover videos with default filenames, unlisted-like titles, and other obscure patterns.

This app is a standalone tool that implements those patterns without needing any API keys or special access. Just filter, click, and discover.

### Features

*   **Large Library of Templates:** Includes dozens of search patterns for new, old, and forgotten videos, categorized for easy browsing.
*   **No YouTube API Needed:** Runs entirely in your browser.
*   **Randomized Variables:** Automatically generates random dates and numbers for dynamic search queries.
*   **Manual Override:** Turn off randomization to enter your own specific values (like an exact date).
*   **Template Search & Filtering:** Quickly find the exact type of template you're looking for.
*   **Simple, Clean Interface:** No clutter, just the tools you need.

## How to Use

1.  **Go to the live site** using the link at the top of this page.
2.  **Filter Templates (Right Panel):** Use the tabs (`All`, `New`, `Old`), subcategory chips, and the search bar to find a template.
3.  **Click "Find Random Video":** This will open a YouTube search in a new tab. If you have a template "Picked", it will use that one. If not, it will select a random one based on your filters.
4.  **Customize:** Use the toggles on the left to control randomization and whether to sort by upload date.

## Contributing

Contributions are what make open-source projects great! The easiest way to contribute is by adding new search templates.

### Adding a New Template

1.  **Fork** the repository.
2.  Open the **`templates.js`** file.
3.  At the end of the `TEMPLATES` array, add your new template object. Follow the existing structure:
    ```javascript
    {
      id: 'UNIQUE_ID', 
      label: 'My New Template (Device)', 
      pattern: 'SEARCH PATTERN XXXX', 
      vars: [{name:'XXXX', type:'digits', len:4}], // or vars: [] if none
      category: 'new', // or 'old'
      sub: 'misc' // or any other subcategory
    },
    ```
4.  **Submit a pull request** with a brief description of the template you've added.

Bug fixes and feature suggestions are also welcome. Feel free to open an issue to discuss your ideas.

## Acknowledgements

*   This project would not be possible without the original research and map compiled by **KVN AUST & Mika_Virus**.
*   Original Source/Map: [x.com/MingKasterMK](https://x.com/MingKasterMK)
