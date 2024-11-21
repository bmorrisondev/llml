#!/usr/bin/env node

import { Command } from 'commander';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import inquirer from 'inquirer';

const program = new Command();

// Function to update selected repositories
async function updateSelectedRepos() {
  const homeDir = os.homedir();
  const srcDir = path.join(homeDir, '.llml-src');

  try {
    // Ensure source directory exists
    try {
      await fs.access(srcDir);
    } catch {
      console.log('No repositories found in .llml-src');
      return;
    }

    // Get all subdirectories in .llml-src
    const dirs = await fs.readdir(srcDir);
    const repositories = [];
    
    for (const dir of dirs) {
      const repoPath = path.join(srcDir, dir);
      const stat = await fs.stat(repoPath);
      
      if (stat.isDirectory()) {
        repositories.push(dir);
      }
    }

    if (repositories.length === 0) {
      console.log('No repositories found in .llml-src');
      return;
    }

    // Show interactive selection
    const { selectedRepos } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedRepos',
        message: 'Select repositories to update (use spacebar to select/unselect):',
        choices: repositories,
        pageSize: 10
      }
    ]);

    if (selectedRepos.length === 0) {
      console.log('No repositories selected');
      return;
    }

    // Update selected repositories
    for (const dir of selectedRepos) {
      const repoPath = path.join(srcDir, dir);
      try {
        console.log(`\nUpdating ${dir}...`);
        const git = simpleGit(repoPath);
        await git.pull();
        console.log(`Successfully updated ${dir}`);
      } catch (error) {
        console.error(`Error updating ${dir}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

program
  .name('llml')
  .description('Clone and symlink GitHub repositories')
  .argument('[repository]', 'GitHub repository URL or owner/repo')
  .option('--update', 'Update selected repositories')
  .action(async (repository, options) => {
    if (options.update) {
      await updateSelectedRepos();
      return;
    }

    if (!repository) {
      console.error('Error: repository argument is required when not using --update');
      process.exit(1);
    }

    try {
      // Normalize repository URL
      const repoUrl = repository.startsWith('http') 
        ? repository 
        : `https://github.com/${repository}`;
      
      // Extract repo name from URL
      const repoName = repoUrl.split('/').pop().replace('.git', '');
      
      // Create necessary directories
      const homeDir = os.homedir();
      const srcDir = path.join(homeDir, '.llml-src');
      const localDir = path.join(process.cwd(), '.llml');
      const repoDir = path.join(srcDir, repoName);
      const linkDir = path.join(localDir, repoName);

      // Ensure source and local directories exist
      await fs.mkdir(srcDir, { recursive: true });
      await fs.mkdir(localDir, { recursive: true });

      // Check and update .gitignore
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      try {
        let gitignoreContent = '';
        try {
          gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
        }

        if (!gitignoreContent.split('\n').some(line => line.trim() === '.llml/')) {
          const newContent = gitignoreContent
            ? `${gitignoreContent.trim()}\n.llml/\n`
            : '.llml/\n';
          await fs.writeFile(gitignorePath, newContent);
          console.log('Added .llml/ to .gitignore');
        }
      } catch (err) {
        console.warn('Warning: Could not update .gitignore:', err.message);
      }

      // Clone repository if it doesn't exist
      const git = simpleGit();
      if (!await fs.access(repoDir).then(() => true).catch(() => false)) {
        console.log(`Cloning ${repoUrl}...`);
        await git.clone(repoUrl, repoDir);
      }

      // Create symlink
      try {
        await fs.symlink(repoDir, linkDir, 'dir');
        console.log(`Successfully linked ${repoName} to .llml/${repoName}`);
      } catch (err) {
        if (err.code === 'EEXIST') {
          console.log(`Link already exists at .llml/${repoName}`);
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
