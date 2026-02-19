import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

interface UnirioStudent {
  name: string;
  email: string;
  matricula: string;
  cpf?: string;
}

/**
 * Scrape students from UNIRIO portal
 * @param cpf - Professor CPF (e.g., "08714684764")
 * @param password - Professor password
 * @returns Array of students
 */
export async function scrapeUnirioStudents(cpf: string, password: string): Promise<UnirioStudent[]> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Navigate to UNIRIO portal
    await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

    // Wait for login form
    await page.waitForSelector('input[name="cpf"], input[name="usuario"], input[name="login"]', { timeout: 10000 }).catch(() => null);

    // Try to find and fill CPF field
    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"], input[name*="login"]');
    if (cpfInputs.length === 0) {
      console.warn('[UNIRIO] No login fields found');
      return [];
    }

    // Fill CPF
    await cpfInputs[0].type(cpf);

    // Find and fill password field
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(password);
    }

    // Submit form
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
    }

    // Wait for page to load after login
    await page.waitForTimeout(2000);

    // Try to find students table or list
    const students: UnirioStudent[] = [];

    // Look for table rows with student data
    const rows = await page.$$('table tbody tr, .student-row, [data-student]');
    
    for (const row of rows) {
      try {
        // Try to extract student info from row
        const cells = await row.$$('td');
        if (cells.length >= 2) {
          const nameEl = await cells[0].evaluate((el: any) => el.textContent?.trim() || '');
          const emailEl = await cells[1].evaluate((el: any) => el.textContent?.trim() || '');
          const matriculaEl = cells[2] ? await cells[2].evaluate((el: any) => el.textContent?.trim() || '') : '';

          if (nameEl && emailEl) {
            students.push({
              name: nameEl,
              email: emailEl,
              matricula: matriculaEl || '',
            });
          }
        }
      } catch (err) {
        console.warn('[UNIRIO] Error parsing row:', err);
      }
    }

    return students;
  } catch (error) {
    console.error('[UNIRIO] Scraping error:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Validate UNIRIO credentials
 */
export async function validateUnirioCredentials(cpf: string, password: string): Promise<boolean> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="text"], input[name*="cpf"], input[name*="usuario"]', { timeout: 5000 }).catch(() => null);

    const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
    if (cpfInputs.length === 0) return false;

    await cpfInputs[0].type(cpf);

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(password);
    }

    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
    }

    // Check if login was successful by looking for error messages
    const errorMessages = await page.evaluate(() => {
      const errors = document.querySelectorAll('.error, .alert-danger, [role="alert"]');
      return Array.from(errors).map((e: any) => e.textContent?.trim() || '');
    });

    return errorMessages.length === 0;
  } catch (error) {
    console.error('[UNIRIO] Validation error:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
