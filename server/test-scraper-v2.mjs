#!/usr/bin/env node

/**
 * Improved UNIRIO scraper test script with better error handling
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const CPF = process.argv[2] || '08714684764';
const PASSWORD = process.argv[3] || 'Derekriggs38';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         UNIRIO Scraper Test - Improved Version             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`[INFO] CPF: ${CPF}`);
console.log(`[INFO] Password: ${'*'.repeat(PASSWORD.length)}\n`);

async function testPortalAccess() {
  console.log('[TEST] Testing portal accessibility...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set longer timeouts
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    // Log all console messages
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    page.on('error', err => console.error(`[BROWSER ERROR] ${err}`));

    console.log('[TEST] Navigating to https://portal.unirio.br...');
    const response = await page.goto('https://portal.unirio.br', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log(`[TEST] Response status: ${response?.status()}`);

    // Save initial page
    const initialHtml = await page.content();
    fs.writeFileSync('debug-01-initial-page.html', initialHtml);
    console.log('[TEST] ✓ Initial page saved to debug-01-initial-page.html');

    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`[TEST] Page title: "${title}"`);
    console.log(`[TEST] Current URL: ${url}`);

    // Find all input fields
    console.log('[TEST] Looking for input fields...');
    const inputs = await page.evaluate(() => {
      const result = [];
      document.querySelectorAll('input').forEach((input, idx) => {
        result.push({
          idx,
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          visible: input.offsetParent !== null,
        });
      });
      return result;
    });

    console.log(`[TEST] Found ${inputs.length} input fields:`);
    inputs.forEach(inp => {
      console.log(`  [${inp.idx}] type="${inp.type}" name="${inp.name}" id="${inp.id}" placeholder="${inp.placeholder}" visible=${inp.visible}`);
    });

    // Find all buttons
    console.log('[TEST] Looking for buttons...');
    const buttons = await page.evaluate(() => {
      const result = [];
      document.querySelectorAll('button, input[type="submit"], a[role="button"]').forEach((btn, idx) => {
        result.push({
          idx,
          type: btn.tagName,
          text: btn.textContent?.trim().substring(0, 50),
          id: btn.id,
          class: btn.className,
        });
      });
      return result;
    });

    console.log(`[TEST] Found ${buttons.length} buttons:`);
    buttons.slice(0, 10).forEach(btn => {
      console.log(`  [${btn.idx}] ${btn.type} "${btn.text}" id="${btn.id}"`);
    });

    // Try to find and fill login form
    console.log('\n[TEST] Attempting to login...');
    
    // Try different selectors for CPF field
    const cpfSelectors = [
      'input[name="cpf"]',
      'input[name="usuario"]',
      'input[name="login"]',
      'input[type="text"]',
      'input[placeholder*="CPF"]',
      'input[placeholder*="Usuário"]',
    ];

    let cpfFilled = false;
    for (const selector of cpfSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`[TEST] Found CPF field with selector: ${selector}`);
          await element.focus();
          await element.type(CPF, { delay: 50 });
          cpfFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!cpfFilled) {
      console.warn('[TEST] Could not find CPF field, trying first text input...');
      const firstInput = await page.$('input[type="text"]');
      if (firstInput) {
        await firstInput.focus();
        await firstInput.type(CPF, { delay: 50 });
        cpfFilled = true;
      }
    }

    if (cpfFilled) {
      console.log('[TEST] ✓ CPF entered');
    } else {
      console.error('[TEST] ✗ Could not enter CPF');
    }

    // Fill password
    console.log('[TEST] Looking for password field...');
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.focus();
      await passwordInput.type(PASSWORD, { delay: 50 });
      console.log('[TEST] ✓ Password entered');
    } else {
      console.error('[TEST] ✗ Could not find password field');
    }

    // Submit form
    console.log('[TEST] Looking for submit button...');
    const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      console.log('[TEST] ✓ Found submit button, clicking...');
      await submitBtn.click();
      
      // Wait for navigation
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('[TEST] ✓ Navigation completed');
      } catch (e) {
        console.warn('[TEST] Navigation timeout, continuing...');
      }

      await page.waitForTimeout(3000);
    } else {
      console.error('[TEST] ✗ Could not find submit button');
    }

    // Save page after login
    const afterLoginHtml = await page.content();
    fs.writeFileSync('debug-02-after-login.html', afterLoginHtml);
    console.log('[TEST] ✓ After-login page saved to debug-02-after-login.html');

    // Check for errors
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error, .alert, [role="alert"], .text-danger, .alert-danger');
      return Array.from(errorElements).map(e => e.textContent?.trim() || '');
    });

    if (errors.length > 0) {
      console.error('[TEST] Errors found on page:');
      errors.forEach(err => console.error(`  - ${err}`));
    }

    // Check if login was successful by looking for dashboard elements
    const isDashboard = await page.evaluate(() => {
      return document.body.textContent.toLowerCase().includes('turma') ||
             document.body.textContent.toLowerCase().includes('aluno') ||
             document.body.textContent.toLowerCase().includes('classe');
    });

    console.log(`[TEST] Dashboard detected: ${isDashboard ? 'YES' : 'NO'}`);

    // Try to find classes/turmas
    console.log('\n[TEST] Looking for classes/turmas...');
    const classes = await page.evaluate(() => {
      const result = [];
      
      // Try to find in tables
      document.querySelectorAll('table tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          result.push({
            col1: cells[0]?.textContent?.trim().substring(0, 50),
            col2: cells[1]?.textContent?.trim().substring(0, 50),
            col3: cells[2]?.textContent?.trim().substring(0, 50),
          });
        }
      });

      return result;
    });

    console.log(`[TEST] Found ${classes.length} potential class rows:`);
    classes.slice(0, 5).forEach((cls, idx) => {
      console.log(`  [${idx}] ${cls.col1} | ${cls.col2} | ${cls.col3}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Test Summary                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Portal Accessible:  ✓ YES                                  ║`);
    console.log(`║ CPF Filled:         ${cpfFilled ? '✓ YES' : '✗ NO'}                                    ║`);
    console.log(`║ Dashboard Found:    ${isDashboard ? '✓ YES' : '✗ NO'}                                    ║`);
    console.log(`║ Classes Found:      ${classes.length} rows                                      ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ Debug Files Generated:                                     ║');
    console.log('║ - debug-01-initial-page.html                              ║');
    console.log('║ - debug-02-after-login.html                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return true;
  } catch (error) {
    console.error(`\n[ERROR] ${error.message}`);
    console.error(`[ERROR] Stack: ${error.stack}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test
testPortalAccess().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
