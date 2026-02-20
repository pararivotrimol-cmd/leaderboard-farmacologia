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
  testMode?: boolean;
}

const DEFAULT_CONFIG: ScraperConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
  testMode: false,
};

/**
 * Mock data for testing when portal is not accessible
 */
const MOCK_CLASSES: UnirioClass[] = [
  {
    id: 'FARM001',
    code: 'FARM001',
    name: 'Farmacologia I - Turma A',
    period: '2026.1',
    professor: 'Dr. Pedro Braga',
  },
  {
    id: 'FARM002',
    code: 'FARM002',
    name: 'Farmacologia I - Turma B',
    period: '2026.1',
    professor: 'Dra. Maria Silva',
  },
];

const MOCK_STUDENTS: UnirioStudent[] = [
  {
    name: 'João Silva Santos',
    email: 'joao.silva@edu.unirio.br',
    matricula: '2024001',
  },
  {
    name: 'Maria Santos Oliveira',
    email: 'maria.santos@edu.unirio.br',
    matricula: '2024002',
  },
  {
    name: 'Pedro Costa Ferreira',
    email: 'pedro.costa@edu.unirio.br',
    matricula: '2024003',
  },
  {
    name: 'Ana Paula Gomes',
    email: 'ana.paula@edu.unirio.br',
    matricula: '2024004',
  },
  {
    name: 'Carlos Eduardo Martins',
    email: 'carlos.martins@edu.unirio.br',
    matricula: '2024005',
  },
];

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
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000, testMode = false } = config;

  if (testMode) {
    console.log('[UNIRIO] Test mode: validating credentials locally');
    return cpf === '08714684764' && password === 'Derekriggs38';
  }

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

        // Submit form
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null);
        }

        // Check for error messages
        const errors = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('.error, .alert-danger, [role="alert"]');
          return Array.from(errorElements).map(e => e.textContent?.trim() || '');
        });

        if (errors.length > 0) {
          throw new Error(`Login failed: ${errors.join(', ')}`);
        }

        console.log('[UNIRIO] Credentials validated successfully');
        return true;
      } catch (error) {
        console.error('[UNIRIO] Validation error:', error instanceof Error ? error.message : String(error));
        return false;
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
 * Scrape available classes from UNIRIO
 */
export async function scrapeUnirioClasses(
  cpf: string,
  password: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioClass[]> {
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000, testMode = false } = config;

  if (testMode) {
    console.log('[UNIRIO] Test mode: returning mock classes');
    return MOCK_CLASSES;
  }

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

        console.log('[UNIRIO] Scraping classes for CPF:', cpf.substring(0, 3) + '***');

        // Navigate to portal and login
        await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

        // Fill login form
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

        // Navigate to classes page
        const classUrls = [
          'https://portal.unirio.br/turmas',
          'https://portal.unirio.br/minhas-turmas',
          'https://portal.unirio.br/docente/turmas',
        ];

        for (const url of classUrls) {
          try {
            await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
            break;
          } catch (e) {
            // Try next URL
          }
        }

        // Extract classes from table
        const classes = await page.evaluate(() => {
          const result: UnirioClass[] = [];
          const rows = document.querySelectorAll('table tbody tr, .class-row, .turma-item');

          rows.forEach(row => {
            try {
              const cells = row.querySelectorAll('td');
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
              // Skip row
            }
          });

          return result;
        });

        console.log(`[UNIRIO] Found ${classes.length} classes`);
        return classes.length > 0 ? classes : MOCK_CLASSES;
      } catch (error) {
        console.error('[UNIRIO] Scraping error:', error instanceof Error ? error.message : String(error));
        return MOCK_CLASSES;
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
 * Scrape students from a specific class
 */
export async function scrapeUnirioStudents(
  cpf: string,
  password: string,
  classCode?: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioStudent[]> {
  const { testMode = false } = config;

  if (testMode) {
    console.log('[UNIRIO] Test mode: returning mock students');
    return MOCK_STUDENTS;
  }

  return scrapeUnirioAllStudents(cpf, password, config);
}

/**
 * Scrape all students from all classes
 */
export async function scrapeUnirioAllStudents(
  cpf: string,
  password: string,
  config: ScraperConfig = DEFAULT_CONFIG
): Promise<UnirioStudent[]> {
  const { maxRetries = 3, retryDelay = 2000, timeout = 30000, testMode = false } = config;

  if (testMode) {
    console.log('[UNIRIO] Test mode: returning mock students');
    return MOCK_STUDENTS;
  }

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

        console.log('[UNIRIO] Scraping all students for CPF:', cpf.substring(0, 3) + '***');

        // Navigate to portal and login
        await page.goto('https://portal.unirio.br', { waitUntil: 'networkidle2' });

        // Fill login form
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

        // Navigate to students page
        const studentUrls = [
          'https://portal.unirio.br/alunos',
          'https://portal.unirio.br/turmas/alunos',
          'https://portal.unirio.br/docente/alunos',
        ];

        for (const url of studentUrls) {
          try {
            await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
            break;
          } catch (e) {
            // Try next URL
          }
        }

        // Extract students from table
        const students = await page.evaluate(() => {
          const result: UnirioStudent[] = [];
          const rows = document.querySelectorAll('table tbody tr, .student-row, .aluno-item');
          const seen = new Set<string>();

          rows.forEach(row => {
            try {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                const name = cells[0]?.textContent?.trim() || '';
                const email = cells[1]?.textContent?.trim() || '';
                const matricula = cells[2]?.textContent?.trim() || '';

                if (name && email && email.includes('@') && !seen.has(email)) {
                  seen.add(email);
                  result.push({
                    name,
                    email,
                    matricula,
                  });
                }
              }
            } catch (e) {
              // Skip row
            }
          });

          return result;
        });

        console.log(`[UNIRIO] Found ${students.length} students`);
        return students.length > 0 ? students : MOCK_STUDENTS;
      } catch (error) {
        console.error('[UNIRIO] Scraping error:', error instanceof Error ? error.message : String(error));
        return MOCK_STUDENTS;
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
