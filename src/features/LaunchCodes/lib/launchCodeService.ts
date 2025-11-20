import { LaunchCodeRepository } from "./launchCodeRepository";

export interface LaunchCodeValidationResult {
    valid: boolean;
    code?: any;
    error?: string;
    errorType?: 'not_found' | 'expired' | 'limit_reached' | 'inactive';
}

/**
 * Service for launch code business logic
 * Handles validation, expiry checks, and usage tracking
 */
export class LaunchCodeService {
    private repository: LaunchCodeRepository;

    constructor() {
        this.repository = new LaunchCodeRepository();
    }

    /**
     * Validate a launch code for use
     * Checks if code exists, is active, not expired, and under usage limit
     */
    async validateCode(code: string): Promise<LaunchCodeValidationResult> {
        // Empty code is considered invalid (not an error, just no code provided)
        if (!code || code.trim() === '') {
            return {
                valid: false,
                errorType: 'not_found'
            };
        }

        // Get the code from database
        const launchCode = await this.repository.getByCode(code);

        if (!launchCode) {
            return {
                valid: false,
                error: 'Invalid launch code',
                errorType: 'not_found'
            };
        }

        // Check if code is active
        if (!launchCode.isActive) {
            return {
                valid: false,
                error: 'This launch code has been deactivated',
                errorType: 'inactive'
            };
        }

        // Check if code has expired
        const now = new Date();
        const validUntil = new Date(launchCode.validUntil);

        if (now > validUntil) {
            return {
                valid: false,
                error: `This code expired on ${validUntil.toLocaleDateString()}`,
                errorType: 'expired'
            };
        }

        // Check usage limit
        if (launchCode.maxUses !== null && launchCode.currentUses >= launchCode.maxUses) {
            return {
                valid: false,
                error: 'This code has reached its usage limit',
                errorType: 'limit_reached'
            };
        }

        return {
            valid: true,
            code: launchCode
        };
    }

    /**
     * Record usage of a launch code
     * Should be called after successfully using a code
     */
    async recordUsage(code: string): Promise<void> {
        const launchCode = await this.repository.getByCode(code);

        if (!launchCode) {
            throw new Error('Launch code not found');
        }

        await this.repository.incrementUsage(launchCode.id);
    }

    /**
     * Check if a specific code is valid without detailed error messages
     * Useful for quick validation in UI
     */
    async isCodeValid(code: string): Promise<boolean> {
        const result = await this.validateCode(code);
        return result.valid;
    }

    /**
     * Get all active codes (admin functionality)
     */
    async getAllActiveCodes() {
        return await this.repository.getAllActive();
    }

    /**
     * Deactivate a code (rollback/emergency functionality)
     */
    async deactivateCode(code: string): Promise<void> {
        const launchCode = await this.repository.getByCode(code);

        if (!launchCode) {
            throw new Error('Launch code not found');
        }

        await this.repository.deactivate(launchCode.id);
    }
}
