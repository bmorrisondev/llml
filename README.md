# llml

A CLI tool for cloning GitHub repositories and creating local symlinks in the current working directory. This is used by LLMs to reference code from GitHub repositories in thier generated code.

## Installation

```bash
npx llml <repository>
```

## Usage

You can use llml with either a full GitHub URL or a shorthand owner/repo format:

```bash
# Using full URL
npx llml https://github.com/owner/repo

# Using shorthand format
npx llml owner/repo

# Update existing repositories
npx llml --update
```

## What it does

1. Creates a `.llml-src` directory in your home folder to store cloned repositories
2. Creates a `.llml` directory in your current working directory
3. Clones the specified repository to `.llml-src` (if it doesn't exist)
4. Creates a symlink from the cloned repository to `.llml/[repo-name]`

When using `--update`:
1. Shows an interactive list of all repositories in `.llml-src`
2. Allows you to select repositories using spacebar
3. Runs `git pull` on each selected repository to update them

## Example

```bash
# Clone and link a repository
npx llml facebook/react

# This will:
# 1. Clone https://github.com/facebook/react to ~/.llml-src/react
# 2. Create a symlink at ./.llml/react pointing to ~/.llml-src/react

# Update existing repositories
npx llml --update

# This will:
# 1. Show a list of all repositories in ~/.llml-src
# 2. Let you select which ones to update using spacebar
# 3. Run git pull on the selected repositories
```
