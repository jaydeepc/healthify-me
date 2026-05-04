import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export class ParamsLoader {
    constructor(options = {}) {
        this.options = {
            serviceName: options.serviceName,
            envFile: path.join(process.cwd(), '.env'),
            isLocal: process.env.TERM_PROGRAM,
            environment: process.env['application.env'] === 'byot' ? 'prod' : (process.env['application.env'] || 'prod'),
            awsKeyId: process.env['application.config.awsParameterStoreKeyId'],
            awsAccessKey: process.env['application.config.awsParameterStoreAccessKey'],
            region: options.region || 'ap-south-1',
        };
    }

    async loadParams() {
        try {
            let params = {};

            if (this.options.isLocal) {
                params = this._loadLocalParams();

                try {
                    const secretParams = this._loadSecrets();
                    const processedSecrets = this._processVariableSubstitution(secretParams, { ...params, ...secretParams });

                    params = { ...params, ...processedSecrets };
                } catch (error) {
                    console.error(`Error loading secrets: ${error.message}`);
                }
            } else {
                params = await this._loadAwsParams();
            }

            return params;
        } catch (error) {
            console.error(`Error loading parameters: ${error.message}`);
            throw error;
        }
    }

    _processVariableSubstitution(secrets, allParams) {
        const processedSecrets = { ...secrets };
        let hasChanges = true;
        let iterations = 0;
        const MAX_ITERATIONS = 10;

        while (hasChanges && iterations < MAX_ITERATIONS) {
            hasChanges = false;
            iterations++;

            for (const [key, value] of Object.entries(processedSecrets)) {
                if (typeof value !== 'string') continue;

                const regex = /\${([^}]+)}/g;
                let match;
                let newValue = value;
                let valueChanged = false;

                while ((match = regex.exec(value)) !== null) {
                    const varName = match[1];

                    if (allParams[varName] !== undefined) {
                        newValue = newValue.replace(`\${${varName}}`, allParams[varName]);
                        valueChanged = true;
                    } else {
                        throw new Error(`Variable \${${varName}} in ${key}=${value} is not defined in .env or .secrets files`);
                    }
                }

                if (valueChanged) {
                    processedSecrets[key] = newValue;
                    hasChanges = true;
                }
            }
        }

        if (iterations === MAX_ITERATIONS) {
            console.warn(`Variable substitution reached maximum iterations (${MAX_ITERATIONS}). There might be circular references.`);
        }

        return processedSecrets;
    }

    _loadLocalParams() {
        try {
            if (fs.existsSync(this.options.envFile)) {
                console.log(`Loading environment from ${this.options.envFile}`);
                const envConfig = dotenv.config({ path: this.options.envFile });

                if (envConfig.error) {
                    throw envConfig.error;
                }

                return { ...envConfig.parsed };
            } else {
                console.warn(`.env file not found at ${this.options.envFile}`);
                return { ...process.env };
            }
        } catch (error) {
            console.error(`Error loading local parameters: ${error.message}`);
            throw error;
        }
    }

    _loadSecrets() {
        try {
            const userspacePath = process.env.USERSPACE_BASE_PATH;

            if (!userspacePath) {
                const errorMsg = 'USERSPACE_BASE_PATH environment variable is not set. Cannot load secrets.';
                console.error(errorMsg);
                throw new Error(errorMsg);
            }

            const secretsFilePath = path.join(userspacePath, '.secrets');

            if (!fs.existsSync(secretsFilePath)) {
                const errorMsg = `.secrets file not found at ${secretsFilePath}. Cannot load secrets.`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }

            console.log(`Loading secrets from ${secretsFilePath}`);
            const secretsContent = fs.readFileSync(secretsFilePath, 'utf8');

            const secrets = {};
            const lines = secretsContent.split('\n');

            for (const line of lines) {
                if (!line || line.trim().startsWith('#')) {
                    continue;
                }

                const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';

                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.slice(1, -1);
                    }

                    secrets[key] = value;
                }
            }

            console.log(`Loaded ${Object.keys(secrets).length} secrets...`);

            if (Object.keys(secrets).length > 0) {
                console.log('Secret keys loaded:');
                Object.keys(secrets).forEach(key => {
                    console.log(`- ${key}`);
                });
                console.log('');
            }

            return secrets;
        } catch (error) {
            console.error(`Error loading secrets: ${error.message}`);
            throw error;
        }
    }

    async _loadAwsParams() {
        try {
            if (!this.options.awsKeyId || !this.options.awsAccessKey) {
                throw new Error(
                    'AWS Parameter Store Key ID or Access Key is missing. Set AWS_PARAMETER_STORE_KEY_ID and AWS_PARAMETER_STORE_ACCESS_KEY environment variables.'
                );
            }

            const ssmClient = new SSMClient({
                region: this.options.region,
                credentials: {
                    accessKeyId: this.options.awsKeyId,
                    secretAccessKey: this.options.awsAccessKey,
                },
            });

            const isLowerEnvironment = ['dev1', 'qa', 'stage'].includes(
                this.options.environment
            );

            const paramPath = `/${this.options.environment}/byot/${this.options.serviceName}/`;
            
            console.log(`Fetching parameters from AWS SSM at path: ${paramPath}secret`);

            const secretParams = await ssmClient.send(
                new GetParameterCommand({
                    Name: `${paramPath}secret`,
                    WithDecryption: true,
                }),
            );
            console.log('Fetched secret parameters from AWS SSM');

            const secretValue = secretParams.Parameter?.Value ?? '{}';

            try {
                return {
                    ...JSON.parse(secretValue),
                };
            } catch (error) {
                console.error('Error parsing parameters from AWS SSM');
                console.error(`Secret Value: ${secretValue}`);
                throw error;
            }
        } catch (error) {
            console.error(`Error fetching parameters from AWS SSM: ${error.message}`);
            throw error;
        }
    }
}

let paramsInstance = null;
const getParams = async (options = {}) => {
    if (!paramsInstance) {
        paramsInstance = new ParamsLoader(options);
    }
    return paramsInstance.loadParams();
};

export default getParams;
