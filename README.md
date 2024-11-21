# llml

A CLI tool for cloning GitHub repositories and creating local symlinks.

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
```

## What it does

1. Creates a `.llml-src` directory in your home folder to store cloned repositories
2. Creates a `.llml` directory in your current working directory
3. Clones the specified repository to `.llml-src` (if it doesn't exist)
4. Creates a symlink from the cloned repository to `.llml/[repo-name]`

## Example

```bash
# Clone and link a repository
npx llml facebook/react

# This will:
# 1. Clone https://github.com/facebook/react to ~/.llml-src/react
# 2. Create a symlink at ./.llml/react pointing to ~/.llml-src/react
```
