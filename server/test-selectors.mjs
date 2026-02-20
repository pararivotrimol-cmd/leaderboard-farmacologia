#!/usr/bin/env node

/**
 * Interactive CSS Selector Tester for UNIRIO Portal
 * 
 * This script helps test and validate CSS selectors against the UNIRIO portal.
 * It allows you to:
 * 1. Navigate to specific pages
 * 2. Test selectors interactively
 * 3. View matching elements
 * 4. Extract data using selectors
 * 5. Save working selectors
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSelectors() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           CSS Selector Tester - UNIRIO Portal              ║');
  console.log('║  Test and validate selectors interactively                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const cpf = await question('Enter professor CPF (11 digits): ');
  const password = await question('Enter professor password: ');

  let browser;
  let page;
  let currentUrl = '';
  const workingSelectors = {};

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

    page = await browser.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    console.log('\n[INFO] Launching browser and navigating to portal...');
    await page.goto('https://portal.unirio.br', { waitUntil: 'domcontentloaded' });
    currentUrl = page.url();

    // Login
    console.log('[INFO] Logging in with provided credentials...');
    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
    if (cpfInputs.length > 0) {
      await cpfInputs[0].type(cpf, { delay: 30 });
    }

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(password, { delay: 30 });
    }

    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => null);
      await sleep(2000);
    }

    currentUrl = page.url();
    console.log(`[INFO] Logged in successfully. Current URL: ${currentUrl}\n`);

    // Main menu
    let running = true;
    while (running) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║                    Main Menu                               ║');
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log('║ 1. Navigate to URL                                         ║');
      console.log('║ 2. Test CSS Selector                                       ║');
      console.log('║ 3. Extract Data with Selector                              ║');
      console.log('║ 4. List All Input Fields                                   ║');
      console.log('║ 5. List All Buttons                                        ║');
      console.log('║ 6. List All Tables                                         ║');
      console.log('║ 7. Save Page HTML                                          ║');
      console.log('║ 8. View Working Selectors                                  ║');
      console.log('║ 9. Exit                                                    ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      const choice = await question('Select option (1-9): ');

      switch (choice) {
        case '1': {
          // Navigate to URL
          const url = await question('\nEnter URL (or relative path): ');
          try {
            if (!url.startsWith('http')) {
              const baseUrl = new URL(currentUrl).origin;
              await page.goto(baseUrl + (url.startsWith('/') ? url : '/' + url), {
                waitUntil: 'domcontentloaded',
              });
            } else {
              await page.goto(url, { waitUntil: 'domcontentloaded' });
            }
            currentUrl = page.url();
            console.log(`\n[SUCCESS] Navigated to: ${currentUrl}`);
          } catch (error) {
            console.error(`\n[ERROR] Failed to navigate: ${error.message}`);
          }
          break;
        }

        case '2': {
          // Test CSS Selector
          const selector = await question('\nEnter CSS selector to test: ');
          try {
            const results = await page.evaluate(sel => {
              const elements = document.querySelectorAll(sel);
              return {
                count: elements.length,
                elements: Array.from(elements).slice(0, 5).map((el, idx) => ({
                  index: idx,
                  tag: el.tagName,
                  id: el.id,
                  class: el.className,
                  text: el.textContent?.trim().substring(0, 100),
                  html: el.outerHTML.substring(0, 200),
                })),
              };
            }, selector);

            console.log(`\n[RESULT] Found ${results.count} elements matching "${selector}"`);
            if (results.count > 0) {
              console.log('\nFirst 5 matches:');
              results.elements.forEach(el => {
                console.log(`\n  [${el.index}] <${el.tag}>`);
                if (el.id) console.log(`      id="${el.id}"`);
                if (el.class) console.log(`      class="${el.class}"`);
                console.log(`      text: "${el.text}"`);
              });
              workingSelectors[selector] = results.count;
            } else {
              console.log('[WARNING] No elements found with this selector');
            }
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '3': {
          // Extract Data with Selector
          const selector = await question('\nEnter CSS selector: ');
          const dataType = await question('Extract: (1) text, (2) HTML, (3) attributes, (4) table data? [1-4]: ');

          try {
            let data;

            if (dataType === '1') {
              // Extract text
              data = await page.evaluate(sel => {
                return Array.from(document.querySelectorAll(sel)).map(el => el.textContent?.trim());
              }, selector);
              console.log('\n[EXTRACTED TEXT]');
            } else if (dataType === '2') {
              // Extract HTML
              data = await page.evaluate(sel => {
                return Array.from(document.querySelectorAll(sel)).map(el => el.outerHTML.substring(0, 300));
              }, selector);
              console.log('\n[EXTRACTED HTML]');
            } else if (dataType === '3') {
              // Extract attributes
              data = await page.evaluate(sel => {
                return Array.from(document.querySelectorAll(sel)).map(el => ({
                  tag: el.tagName,
                  id: el.id,
                  class: el.className,
                  name: el.getAttribute('name'),
                  type: el.getAttribute('type'),
                  placeholder: el.getAttribute('placeholder'),
                  value: el.getAttribute('value'),
                }));
              }, selector);
              console.log('\n[EXTRACTED ATTRIBUTES]');
            } else if (dataType === '4') {
              // Extract table data
              data = await page.evaluate(sel => {
                const rows = document.querySelectorAll(sel);
                return Array.from(rows).map(row => {
                  const cells = row.querySelectorAll('td, th');
                  return Array.from(cells).map(cell => cell.textContent?.trim());
                });
              }, selector);
              console.log('\n[EXTRACTED TABLE DATA]');
            }

            if (data && data.length > 0) {
              console.log(JSON.stringify(data.slice(0, 10), null, 2));
              if (data.length > 10) {
                console.log(`\n... and ${data.length - 10} more items`);
              }
            } else {
              console.log('[WARNING] No data extracted');
            }
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '4': {
          // List all input fields
          try {
            const inputs = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('input')).map((input, idx) => ({
                index: idx,
                type: input.type,
                name: input.name,
                id: input.id,
                placeholder: input.placeholder,
                value: input.value,
                visible: input.offsetParent !== null,
              }));
            });

            console.log(`\n[INPUT FIELDS] Found ${inputs.length} input fields:\n`);
            inputs.forEach(inp => {
              console.log(`  [${inp.index}] <input type="${inp.type}" ${inp.visible ? '✓' : '✗'}>`);
              if (inp.name) console.log(`      name="${inp.name}"`);
              if (inp.id) console.log(`      id="${inp.id}"`);
              if (inp.placeholder) console.log(`      placeholder="${inp.placeholder}"`);
            });
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '5': {
          // List all buttons
          try {
            const buttons = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]')).map(
                (btn, idx) => ({
                  index: idx,
                  tag: btn.tagName,
                  type: btn.getAttribute('type'),
                  text: btn.textContent?.trim().substring(0, 50),
                  id: btn.id,
                  class: btn.className,
                })
              );
            });

            console.log(`\n[BUTTONS] Found ${buttons.length} buttons:\n`);
            buttons.slice(0, 20).forEach(btn => {
              console.log(`  [${btn.index}] <${btn.tag} ${btn.type ? `type="${btn.type}"` : ''}>`);
              if (btn.text) console.log(`      text: "${btn.text}"`);
              if (btn.id) console.log(`      id="${btn.id}"`);
            });
            if (buttons.length > 20) {
              console.log(`\n  ... and ${buttons.length - 20} more buttons`);
            }
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '6': {
          // List all tables
          try {
            const tables = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('table')).map((table, idx) => {
                const rows = table.querySelectorAll('tbody tr');
                const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent?.trim());
                const firstRow = rows[0]
                  ? Array.from(rows[0].querySelectorAll('td')).map(td => td.textContent?.trim().substring(0, 30))
                  : [];

                return {
                  index: idx,
                  id: table.id,
                  class: table.className,
                  rows: rows.length,
                  headers,
                  firstRow,
                };
              });
            });

            console.log(`\n[TABLES] Found ${tables.length} tables:\n`);
            tables.forEach(tbl => {
              console.log(`  [${tbl.index}] <table> (${tbl.rows} rows)`);
              if (tbl.id) console.log(`      id="${tbl.id}"`);
              if (tbl.class) console.log(`      class="${tbl.class}"`);
              if (tbl.headers.length > 0) {
                console.log(`      headers: [${tbl.headers.join(', ')}]`);
              }
              if (tbl.firstRow.length > 0) {
                console.log(`      first row: [${tbl.firstRow.join(', ')}]`);
              }
            });
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '7': {
          // Save page HTML
          try {
            const html = await page.content();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `debug-page-${timestamp}.html`;
            fs.writeFileSync(filename, html);
            console.log(`\n[SUCCESS] Page HTML saved to: ${filename}`);
          } catch (error) {
            console.error(`[ERROR] ${error.message}`);
          }
          break;
        }

        case '8': {
          // View working selectors
          console.log('\n[WORKING SELECTORS]');
          if (Object.keys(workingSelectors).length === 0) {
            console.log('  No selectors tested yet');
          } else {
            Object.entries(workingSelectors).forEach(([selector, count]) => {
              console.log(`  ✓ "${selector}" (${count} matches)`);
            });
          }
          break;
        }

        case '9': {
          // Exit
          running = false;
          console.log('\n[INFO] Exiting...');
          break;
        }

        default:
          console.log('[ERROR] Invalid option. Please select 1-9.');
      }
    }

    // Save working selectors to file
    if (Object.keys(workingSelectors).length > 0) {
      const filename = 'working-selectors.json';
      fs.writeFileSync(filename, JSON.stringify(workingSelectors, null, 2));
      console.log(`\n[SUCCESS] Working selectors saved to: ${filename}`);
    }
  } catch (error) {
    console.error(`\n[FATAL ERROR] ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    rl.close();
  }
}

testSelectors().catch(console.error);
