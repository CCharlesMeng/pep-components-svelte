import { createComponentConfig } from '../../shared/config/vite.factory';

export default createComponentConfig({
    cwd: process.cwd(),
    name: '{{COMPONENT_NAME_PASCAL}}'
});
