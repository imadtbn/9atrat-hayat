const { isConfigured, PLACEHOLDER } = require('../assets/js/site-tags.js');

describe('isConfigured', () => {
    it('should return false for null', () => {
        expect(isConfigured(null)).toBe(false);
    });

    it('should return false for undefined', () => {
        expect(isConfigured(undefined)).toBe(false);
    });

    it('should return false for an empty string', () => {
        expect(isConfigured("")).toBe(false);
    });

    it('should return false for the PLACEHOLDER value', () => {
        expect(isConfigured(PLACEHOLDER)).toBe(false);
    });

    it('should return false for false boolean', () => {
        expect(isConfigured(false)).toBe(false);
    });

    it('should return true for a valid configuration string (e.g., GTM ID)', () => {
        expect(isConfigured("GTM-K9579C56")).toBe(true);
    });

    it('should return true for another valid configuration string (e.g., GA4 ID)', () => {
        expect(isConfigured("G-YQFRBCDS5B")).toBe(true);
    });
});
