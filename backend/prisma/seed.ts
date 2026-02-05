import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Seed models
    const models = [
        {
            id: 'gpt-4-turbo',
            provider: 'openai',
            displayName: 'GPT-4 Turbo',
            costPer1kInput: 0.01,
            costPer1kOutput: 0.03,
            contextWindow: 128000,
            isAvailable: true,
            capabilities: { vision: true, functionCalling: true },
        },
        {
            id: 'gpt-3.5-turbo',
            provider: 'openai',
            displayName: 'GPT-3.5 Turbo',
            costPer1kInput: 0.0005,
            costPer1kOutput: 0.0015,
            contextWindow: 16385,
            isAvailable: true,
            capabilities: { functionCalling: true },
        },
        {
            id: 'claude-3-opus',
            provider: 'anthropic',
            displayName: 'Claude 3 Opus',
            costPer1kInput: 0.015,
            costPer1kOutput: 0.075,
            contextWindow: 200000,
            isAvailable: true,
            capabilities: { vision: true },
        },
        {
            id: 'claude-3-sonnet',
            provider: 'anthropic',
            displayName: 'Claude 3 Sonnet',
            costPer1kInput: 0.003,
            costPer1kOutput: 0.015,
            contextWindow: 200000,
            isAvailable: true,
            capabilities: { vision: true },
        },
        {
            id: 'claude-3-haiku',
            provider: 'anthropic',
            displayName: 'Claude 3 Haiku',
            costPer1kInput: 0.00025,
            costPer1kOutput: 0.00125,
            contextWindow: 200000,
            isAvailable: true,
            capabilities: {},
        },
    ];

    for (const model of models) {
        await prisma.model.upsert({
            where: { id: model.id },
            update: model,
            create: model,
        });
    }

    console.log(`✅ Seeded ${models.length} models`);

    // Create a sample workflow
    const workflow = await prisma.workflow.create({
        data: {
            name: 'Hello World Workflow',
            description: 'A simple workflow to test the system',
            retryBudget: 3,
            costBudget: 5.0,
            steps: {
                create: [
                    {
                        stepOrder: 1,
                        name: 'Generate Greeting',
                        modelId: 'gpt-3.5-turbo',
                        promptTemplate: 'Say hello and introduce yourself as an AI assistant.',
                        completionCriteria: {
                            type: 'rule',
                            rules: [
                                { type: 'contains', value: 'hello', caseSensitive: false },
                                { type: 'minLength', value: 10 },
                            ],
                            logic: 'AND',
                        },
                        retryLimit: 2,
                        contextMode: 'full',
                    },
                    {
                        stepOrder: 2,
                        name: 'Generate Joke',
                        modelId: 'gpt-3.5-turbo',
                        promptTemplate:
                            'Tell a short programming joke. Context from previous step: {{previous_output}}',
                        completionCriteria: {
                            type: 'rule',
                            rules: [
                                { type: 'minLength', value: 20 },
                                { type: 'maxLength', value: 500 },
                            ],
                            logic: 'AND',
                        },
                        retryLimit: 2,
                        contextMode: 'full',
                    },
                ],
            },
        },
    });

    console.log(`✅ Created sample workflow: ${workflow.name}`);
    console.log('\n🎉 Database seeded successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
