import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { Button } from '@ospinajuanp-macroboard/shared';
import { ButtonSchema } from '../ws/schemas';
import { createLogger } from '../lib/logger';

const log = createLogger('config-service');

export const ObsConfigSchema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  password: z.string().max(256),
});

export const ServerConfigSchema = z.object({
  buttons: z.array(ButtonSchema),
  autoOpen: z.boolean().optional(),
  obs: ObsConfigSchema,
});

export const DEFAULT_CONFIG: z.infer<typeof ServerConfigSchema> = {
  buttons: [],
  obs: {
    host: 'localhost',
    port: 4455,
    password: '',
  },
};

export interface ConfigServiceOptions {
  configPath: string;
}

export class ConfigService {
  private readonly configPath: string;
  private cache: z.infer<typeof ServerConfigSchema> | null = null;

  constructor(options: ConfigServiceOptions) {
    this.configPath = options.configPath;
  }

  get path(): string {
    return this.configPath;
  }

  load(): z.infer<typeof ServerConfigSchema> {
    if (this.cache) return this.cache;

    log.info('Loading config', { path: this.configPath });

    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = ServerConfigSchema.safeParse(parsed);
        if (!result.success) {
          log.error('Config validation failed, falling back to defaults', {
            issues: result.error.issues,
          });
          this.cache = structuredClone(DEFAULT_CONFIG);
          return this.cache;
        }
        log.info('Config loaded successfully', { buttons: result.data.buttons.length });
        this.cache = result.data;
        return this.cache;
      }
      log.info('No config file found, using defaults');
    } catch (err) {
      log.error('Error loading config, using defaults', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    this.cache = structuredClone(DEFAULT_CONFIG);
    return this.cache;
  }

  save(config: z.infer<typeof ServerConfigSchema>): void {
    const result = ServerConfigSchema.safeParse(config);
    if (!result.success) {
      log.error('Refusing to save invalid config', { issues: result.error.issues });
      throw new Error('Invalid config: ' + result.error.message);
    }
    const validated = result.data;

    const configDir = path.dirname(this.configPath);
    try {
      if (!fs.existsSync(configDir)) {
        log.info('Creating config directory', { dir: configDir });
        fs.mkdirSync(configDir, { recursive: true });
      }

      if (fs.existsSync(this.configPath)) {
        const backupPath = `${this.configPath}.backup`;
        fs.copyFileSync(this.configPath, backupPath);
        log.debug('Backup created', { backup: backupPath });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(validated, null, 2));
      log.info('Config saved', { path: this.configPath });
      this.cache = validated;
    } catch (err) {
      log.error('Error saving config', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  updateButtons(buttons: Button[]): z.infer<typeof ServerConfigSchema> {
    const current = this.load();
    const next = { ...current, buttons };
    this.save(next);
    return next;
  }

  invalidate(): void {
    this.cache = null;
  }
}