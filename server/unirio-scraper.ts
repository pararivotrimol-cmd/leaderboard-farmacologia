import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export interface UnirioStudent {
  name: string;
  email: string;
  matricula: string;
  cpf?: string;
}

export interface UnirioClass {
  id: string;
  name: string;
  code: string;
  period: string;
  professor: string;
}

interface ScraperConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: ScraperConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
};

/**
 * Retry logic for failed operations
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[UNIRIO] Attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[UNIRIO] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        console.log(`[UNIRIO] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Validate UNIRIO credentials
 */
export async function validateUnirioCredentials(
  cpf: string,
  password: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<boolean> {
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000 } = config;

  return withRetry(
    async () => {
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(timeout);
        page.setDefaultNavigationTimeout(timeout);

        console.log('[UNIRIO] Validating credentials for CPF:', cpf.substring(0, 3) + '***');
        await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

        // Wait for login form and fill credentials
        await page.waitForSelector('input[type="text"], input[name*="cpf"], input[name*="usuario"]', {
          timeout: 10000,
        });

        const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
        if (cpfInputs.length === 0) {
          throw new Error('CPF input field not found');
        }

        await cpfInputs[0].type(cpf, { delay: 50 });

        const passwordInputs = await page.$$('input[type="password"]');
        if (passwordInputs.length === 0) {
          throw new Error('Password input field not found');
        }

        await passwordInputs[0].type(password, { delay: 50 });

        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (!submitButton) {
          throw new Error('Submit button not found');
        }

        await submitButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
        await page.waitForTimeout(2000);

        // Check for error messages
        const errorMessages = await page.evaluate(() => {
          const errors = document.querySelectorAll(
            '.error, .alert-danger, [role="alert"], .text-danger, .invalid-feedback'
          );
          return Array.from(errors)
            .map((e: any) => e.textContent?.trim() || '')
            .filter(text => text.length > 0);
        });

        if (errorMessages.length > 0) {
          console.warn('[UNIRIO] Login errors found:', errorMessages);
          return false;
        }

        console.log('[UNIRIO] Credentials validated successfully');
        return true;
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    },
    maxRetries,
    retryDelay
  );
}

/**
 * Fetch available classes from UNIRIO portal
 */
export async function scrapeUnirioClasses(
  cpf: string,
  password: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioClass[]> {
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000 } = config;

  return withRetry(
    async () => {
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(timeout);
        page.setDefaultNavigationTimeout(timeout);

        console.log('[UNIRIO] Fetching classes for CPF:', cpf.substring(0, 3) + '***');
        await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

        // Login
        await page.waitForSelector('input[type="text"], input[name*="cpf"], input[name*="usuario"]', {
          timeout: 10000,
        });

        const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
        await cpfInputs[0].type(cpf, { delay: 50 });

        const passwordInputs = await page.$$('input[type="password"]');
        await passwordInputs[0].type(password, { delay: 50 });

        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        await submitButton?.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
        await page.waitForTimeout(2000);

        // Navigate to classes/turmas page
        console.log('[UNIRIO] Looking for classes page...');
        
        // Try different possible URLs/selectors for classes
        const possibleClassPages = [
          'https://portal.unirio.br/turmas',
          'https://portal.unirio.br/minhas-turmas',
          'https://portal.unirio.br/docente/turmas',
        ];

        let classesFound = false;
        for (const url of possibleClassPages) {
          try {
            await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
            await page.waitForTimeout(1000);
            classesFound = true;
            break;
          } catch (e) {
            console.log(`[UNIRIO] Classes page ${url} not found, trying next...`);
          }
        }

        // Extract classes from page
        const classes = await page.evaluate(() => {
          const classElements = document.querySelectorAll(
            'table tbody tr, .class-row, .turma-item, [data-class], [data-turma]'
          );

          const result: UnirioClass[] = [];

          classElements.forEach((el: any) => {
            try {
              const cells = el.querySelectorAll('td');
              if (cells.length >= 2) {
                const code = cells[0]?.textContent?.trim() || '';
                const name = cells[1]?.textContent?.trim() || '';
                const professor = cells[2]?.textContent?.trim() || '';
                const period = cells[3]?.textContent?.trim() || '';

                if (code && name) {
                  result.push({
                    id: code,
                    code,
                    name,
                    professor,
                    period,
                  });
                }
              }
            } catch (e) {
              // Skip rows that fail to parse
            }
          });

          return result;
        });

        console.log('[UNIRIO] Found', classes.length, 'classes');
        return classes;
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    },
    maxRetries,
    retryDelay
  );
}

/**
 * Scrape students from a specific UNIRIO class
 */
export async function scrapeUnirioStudents(
  cpf: string,
  password: string,
  classCode?: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioStudent[]> {
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000 } = config;

  return withRetry(
    async () => {
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(timeout);
        page.setDefaultNavigationTimeout(timeout);

        console.log('[UNIRIO] Scraping students for CPF:', cpf.substring(0, 3) + '***');
        if (classCode) {
          console.log('[UNIRIO] Class code:', classCode);
        }

        // Navigate to portal
        await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

        // Login
        await page.waitForSelector('input[type="text"], input[name*="cpf"], input[name*="usuario"]', {
          timeout: 10000,
        });

        const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');
        if (cpfInputs.length === 0) {
          throw new Error('CPF input not found');
        }

        await cpfInputs[0].type(cpf, { delay: 50 });

        const passwordInputs = await page.$$('input[type="password"]');
        if (passwordInputs.length === 0) {
          throw new Error('Password input not found');
        }

        await passwordInputs[0].type(password, { delay: 50 });

        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (!submitButton) {
          throw new Error('Submit button not found');
        }

        await submitButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
        await page.waitForTimeout(2000);

        // Navigate to students/alunos page
        console.log('[UNIRIO] Looking for students page...');
        const possibleStudentPages = [
          'https://portal.unirio.br/alunos',
          'https://portal.unirio.br/turmas/alunos',
          'https://portal.unirio.br/docente/alunos',
          classCode ? `https://portal.unirio.br/turmas/${classCode}/alunos` : null,
        ].filter(Boolean);

        let studentsFound = false;
        for (const url of possibleStudentPages) {
          if (!url) continue;
          try {
            await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
            await page.waitForTimeout(1000);
            studentsFound = true;
            break;
          } catch (e) {
            console.log(`[UNIRIO] Students page ${url} not accessible`);
          }
        }

        // Extract students from page
        const students = await page.evaluate(() => {
          const studentElements = document.querySelectorAll(
            'table tbody tr, .student-row, .aluno-item, [data-student], [data-aluno]'
          );

          const result: UnirioStudent[] = [];

          studentElements.forEach((el: any) => {
            try {
              const cells = el.querySelectorAll('td');
              if (cells.length >= 2) {
                const name = cells[0]?.textContent?.trim() || '';
                const email = cells[1]?.textContent?.trim() || '';
                const matricula = cells[2]?.textContent?.trim() || '';

                if (name && email && email.includes('@')) {
                  result.push({
                    name,
                    email,
                    matricula,
                  });
                }
              }
            } catch (e) {
              // Skip rows that fail to parse
            }
          });

          return result;
        });

        console.log('[UNIRIO] Found', students.length, 'students');
        return students;
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    },
    maxRetries,
    retryDelay
  );
}

/**
 * Scrape all students from all classes
 */
export async function scrapeUnirioAllStudents(
  cpf: string,
  password: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioStudent[]> {
  console.log('[UNIRIO] Scraping all students for CPF:', cpf.substring(0, 3) + '***');

  try {
    // First, get all available classes
    const classes = await scrapeUnirioClasses(cpf, password, config);
    console.log('[UNIRIO] Found', classes.length, 'classes, scraping students from each...');

    const allStudents: UnirioStudent[] = [];
    const studentEmails = new Set<string>(); // Avoid duplicates

    // Scrape students from each class
    for (const classItem of classes) {
      try {
        console.log(`[UNIRIO] Scraping students from class: ${classItem.code} - ${classItem.name}`);
        const classStudents = await scrapeUnirioStudents(cpf, password, classItem.code, config);

        for (const student of classStudents) {
          if (!studentEmails.has(student.email)) {
            allStudents.push(student);
            studentEmails.add(student.email);
          }
        }
      } catch (error) {
        console.warn(`[UNIRIO] Failed to scrape students from class ${classItem.code}:`, error);
      }
    }

    console.log('[UNIRIO] Total unique students found:', allStudents.length);
    return allStudents;
  } catch (error) {
    console.error('[UNIRIO] Error scraping all students:', error);
    return [];
  }
}
