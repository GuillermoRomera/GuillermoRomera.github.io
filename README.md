# Hello World

A minimal hello world site hosted on GitHub Pages.

## How to deploy

1. Create a new repository on GitHub (e.g. `hello-world`). For a user site, name it `your-username.github.io` instead.
2. Add `index.html` (and this README) to the repo and push:

   ```bash
   git init
   git add index.html README.md
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/hello-world.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
5. Wait a minute or two. Your site will be live at:
   - `https://your-username.github.io/hello-world/` (project site), or
   - `https://your-username.github.io/` (if the repo is named `your-username.github.io`)
