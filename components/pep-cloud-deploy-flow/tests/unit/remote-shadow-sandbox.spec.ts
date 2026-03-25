import { describe, expect, it } from 'vitest';
import {
    buildRemoteIframeSrcdoc,
    escapeCssForStyleElement
} from '../../src/utils/remoteShadowSandbox';

describe('remoteShadowSandbox', () => {
    it('escapeCssForStyleElement breaks closing style injection', () => {
        expect(escapeCssForStyleElement('a{color:red}</style><script>')).toContain('<\\/style');
    });

    it('buildRemoteIframeSrcdoc embeds chrome + remote css and help shell', () => {
        const doc = buildRemoteIframeSrcdoc('.help-content p{color:blue}', '<p>x</p>');
        expect(doc).toContain('<!DOCTYPE html>');
        expect(doc).toContain('.help-content p{color:blue}');
        expect(doc).toContain('class="support-content"');
        expect(doc).toContain('class="support-main"');
        expect(doc).toContain('<p>x</p>');
    });
});
