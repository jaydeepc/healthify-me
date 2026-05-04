import { ParamsLoader } from './params.js';
import fs from 'fs';
import path from 'path';

async function loadParams() {
    try {
        const paramsLoader = new ParamsLoader({
            serviceName: '{{REPO_NAME}}'
        });

        const params = await paramsLoader.loadParams();

        console.log('Parameters fetched successfully');

        Object.entries(params).forEach(([key, value]) => {
            process.env[key] = value;
        });

        const envExportPath = path.resolve(process.cwd(), '.env.export');
        let exportContent = '';
        
        Object.entries(params).forEach(([key, value]) => {
            const escapedValue = value && value.toString().replace(/"/g, '\\"');
            exportContent += `export ${key}="${escapedValue}"\n`;
        });
        
        fs.writeFileSync(envExportPath, exportContent);
        console.log(`Environment variables exported to ${envExportPath}`);

        console.log('Parameters loaded successfully');
    } catch (error) {
        console.error(`Failed to load parameters: ${error.message}`);
        process.exit(1);
    }
}

loadParams();
