#!/usr/bin/env node

import { Command } from 'commander';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const program = new Command();

program
  .name('llml')
  .description('Clone and symlink GitHub repositories')
  .argument('<repository>', 'GitHub repository URL or owner/repo')
  .action(async (repository) => {
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
