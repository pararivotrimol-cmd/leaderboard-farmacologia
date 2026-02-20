#!/usr/bin/env node

/**
 * Interactive test script for UNIRIO scraper
 * Usage: node test-scraper.mjs
 * 
 * This script helps validate and debug the UNIRIO scraper by:
 * 1. Testing credential validation
 * 2. Capturing page structure and HTML
 * 3. Testing class scraping
 * 4. Testing student scraping
 * 5. Saving debug information for analysis
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

puppeteer.use(StealthPlugin());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function testCredentials(cpf, password) {
  console.log('\n[TEST] Validating credentials...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log('[TEST] Navigating to portal...');
    await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

    // Save initial page structure
    const initialHtml = await page.content();
    fs.writeFileSync('debug-initial-page.html', initialHtml);
    console.log('[TEST] Initial page saved to debug-initial-page.html');

    // Wait for login form
    console.log('[TEST] Waiting for login form...');
    await page.waitForSelector('input[type="text"], input[name*="cpf"], input[name*="usuario"]', {
      timeout: 10000,
    }).catch(() => console.warn('[TEST] Login form selector not found, trying alternatives...'));

    // Get all input fields for debugging
    const inputs = await page.$$eval('input', els =>
      els.map(el => ({
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.getAttribute('id'),
        placeholder: el.getAttribute('placeholder'),
      }))
    );
    console.log('[TEST] Found input fields:', inputs);

    // Try to find and fill CPF field
    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"], input[name*="login"]');
    if (cpfInputs.length === 0) {
      console.error('[TEST] No login fields found!');
      const pageHtml = await page.content();
      fs.writeFileSync('debug-no-login-fields.html', pageHtml);
      return false;
    }

    console.log(`[TEST] Found ${cpfInputs.length} input fields, filling CPF...`);
    await cpfInputs[0].type(cpf, { delay: 50 });

    // Fill password
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      console.log('[TEST] Filling password...');
      await passwordInputs[0].type(password, { delay: 50 });
    } else {
      console.warn('[TEST] Password field not found');
    }

    // Submit form
    console.log('[TEST] Looking for submit button...');
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Entrar")');
    if (submitButton) {
      console.log('[TEST] Found submit button, clicking...');
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
      console.log('[TEST] Form submitted');
    } else {
      console.warn('[TEST] Submit button not found');
    }

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Save page after login
    const afterLoginHtml = await page.content();
    fs.writeFileSync('debug-after-login.html', afterLoginHtml);
    console.log('[TEST] After-login page saved to debug-after-login.html');

    // Check for error messages
    const errorMessages = await page.evaluate(() => {
      const errors = document.querySelectorAll('.error, .alert-danger, [role="alert"], .text-danger');
      return Array.from(errors).map((e) => e.textContent?.trim() || '');
    });

    if (errorMessages.length > 0) {
      console.error('[TEST] Login errors found:', errorMessages);
      return false;
    }

    console.log('[TEST] Credentials validated successfully!');
    return true;
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testClassScraping(cpf, password) {
  console.log('\n[TEST] Testing class scraping...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Login
    console.log('[TEST] Logging in...');
    await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
    if (cpfInputs.length > 0) {
      await cpfInputs[0].type(cpf, { delay: 50 });
    }

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(password, { delay: 50 });
    }

    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
    }

    await page.waitForTimeout(2000);

    // Navigate to classes page
    console.log('[TEST] Navigating to classes page...');
    const possibleUrls = [
      'https://portal.unirio.br/turmas',
      'https://portal.unirio.br/minhas-turmas',
      'https://portal.unirio.br/docente/turmas',
    ];

    let classPageFound = false;
    for (const url of possibleUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
        await page.waitForTimeout(1000);
        classPageFound = true;
        console.log(`[TEST] Classes page found at: ${url}`);
        break;
      } catch (e) {
        console.log(`[TEST] URL ${url} not accessible`);
      }
    }

    // Save classes page HTML
    const classPageHtml = await page.content();
    fs.writeFileSync('debug-classes-page.html', classPageHtml);
    console.log('[TEST] Classes page saved to debug-classes-page.html');

    // Extract all table rows and list items for debugging
    const pageStructure = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const rows = document.querySelectorAll('table tbody tr, .class-row, .turma-item, [data-class], [data-turma]');
      const divs = document.querySelectorAll('div[class*="turma"], div[class*="class"]');

      return {
        tableCount: tables.length,
        rowCount: rows.length,
        divCount: divs.length,
        firstFewRows: Array.from(rows).slice(0, 3).map(row => ({
          html: row.innerHTML,
          text: row.textContent?.trim().substring(0, 100),
        })),
      };
    });

    console.log('[TEST] Page structure:', JSON.stringify(pageStructure, null, 2));

    // Try to extract classes
    const classes = await page.evaluate(() => {
      const classElements = document.querySelectorAll('table tbody tr, .class-row, .turma-item, [data-class], [data-turma]');
      const result = [];

      classElements.forEach((el) => {
        try {
          const cells = el.querySelectorAll('td');
          if (cells.length >= 2) {
            const code = cells[0]?.textContent?.trim() || '';
            const name = cells[1]?.textContent?.trim() || '';
            const professor = cells[2]?.textContent?.trim() || '';
            const period = cells[3]?.textContent?.trim() || '';

            if (code && name) {
              result.push({ code, name, professor, period });
            }
          }
        } catch (e) {
          // Skip
        }
      });

      return result;
    });

    console.log(`[TEST] Found ${classes.length} classes:`, classes);
    return classes;
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testStudentScraping(cpf, password) {
  console.log('\n[TEST] Testing student scraping...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Login
    console.log('[TEST] Logging in...');
    await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
    if (cpfInputs.length > 0) {
      await cpfInputs[0].type(cpf, { delay: 50 });
    }

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(password, { delay: 50 });
    }

    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
    }

    await page.waitForTimeout(2000);

    // Navigate to students page
    console.log('[TEST] Navigating to students page...');
    const possibleUrls = [
      'https://portal.unirio.br/alunos',
      'https://portal.unirio.br/turmas/alunos',
      'https://portal.unirio.br/docente/alunos',
    ];

    let studentPageFound = false;
    for (const url of possibleUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
        await page.waitForTimeout(1000);
        studentPageFound = true;
        console.log(`[TEST] Students page found at: ${url}`);
        break;
      } catch (e) {
        console.log(`[TEST] URL ${url} not accessible`);
      }
    }

    // Save students page HTML
    const studentPageHtml = await page.content();
    fs.writeFileSync('debug-students-page.html', studentPageHtml);
    console.log('[TEST] Students page saved to debug-students-page.html');

    // Extract students
    const students = await page.evaluate(() => {
      const studentElements = document.querySelectorAll('table tbody tr, .student-row, .aluno-item, [data-student], [data-aluno]');
      const result = [];

      studentElements.forEach((el) => {
        try {
          const cells = el.querySelectorAll('td');
          if (cells.length >= 2) {
            const name = cells[0]?.textContent?.trim() || '';
            const email = cells[1]?.textContent?.trim() || '';
            const matricula = cells[2]?.textContent?.trim() || '';

            if (name && email && email.includes('@')) {
              result.push({ name, email, matricula });
            }
          }
        } catch (e) {
          // Skip
        }
      });

      return result;
    });

    console.log(`[TEST] Found ${students.length} students:`, students.slice(0, 5));
    return students;
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         UNIRIO Scraper Test Suite                          ║');
  console.log('║  This tool helps validate the scraper with real credentials ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const cpf = await question('\nEnter professor CPF (11 digits): ');
  const password = await question('Enter professor password: ');

  console.log('\n[TEST] Starting tests...');

  // Test 1: Validate credentials
  const credentialsValid = await testCredentials(cpf, password);
  if (!credentialsValid) {
    console.error('\n[TEST] Credentials validation failed. Check debug files for details.');
    rl.close();
    return;
  }

  // Test 2: Scrape classes
  const classes = await testClassScraping(cpf, password);

  // Test 3: Scrape students
  const students = await testStudentScraping(cpf, password);

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║ Credentials Valid:  ${credentialsValid ? '✓ YES' : '✗ NO'}                                    ║`);
  console.log(`║ Classes Found:      ${classes.length} classes                                    ║`);
  console.log(`║ Students Found:     ${students.length} students                                  ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║ Debug Files Generated:                                     ║');
  console.log('║ - debug-initial-page.html (login page structure)           ║');
  console.log('║ - debug-after-login.html (after login)                     ║');
  console.log('║ - debug-classes-page.html (classes page)                   ║');
  console.log('║ - debug-students-page.html (students page)                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  rl.close();
}

main().catch(console.error);
