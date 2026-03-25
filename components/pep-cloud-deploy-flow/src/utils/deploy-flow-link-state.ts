export interface DeployFlowLinkState {
    isDeploying: boolean;
    isDeploymentFinished: boolean;
}

/**
 * 仅在“处于部署流程中”时，才允许走伪浏览器打开。
 * 其余状态（未开始部署/已结束部署）统一走真实浏览器 _blank。
 */
export function shouldOpenEmbeddedByFlowState(state: DeployFlowLinkState): boolean {
    return state.isDeploying && !state.isDeploymentFinished;
}
