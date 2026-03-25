import { describe, expect, it } from 'vitest';
import { shouldOpenEmbeddedByFlowState } from '../../src/utils/deploy-flow-link-state';

describe('shouldOpenEmbeddedByFlowState', () => {
    it('returns true only while deploying and not finished', () => {
        expect(
            shouldOpenEmbeddedByFlowState({
                isDeploying: true,
                isDeploymentFinished: false
            })
        ).toBe(true);
    });

    it('returns false when not started deployment', () => {
        expect(
            shouldOpenEmbeddedByFlowState({
                isDeploying: false,
                isDeploymentFinished: false
            })
        ).toBe(false);
    });

    it('returns false on finished deployment page', () => {
        expect(
            shouldOpenEmbeddedByFlowState({
                isDeploying: false,
                isDeploymentFinished: true
            })
        ).toBe(false);
    });

    it('returns false for inconsistent finished+deploying state', () => {
        expect(
            shouldOpenEmbeddedByFlowState({
                isDeploying: true,
                isDeploymentFinished: true
            })
        ).toBe(false);
    });
});
