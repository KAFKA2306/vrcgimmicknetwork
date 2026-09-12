import test from 'node:test';
import assert from 'node:assert/strict';

import { ContentValidator } from '../src/backend/content-validator.js';
import {
    MAIN_IMAGE_OPTIONS,
    createGimmickSubmission
} from '../src/backend/gimmick-submission.js';

function createHarness(optimizeImage) {
    const inserted = [];
    let optimizationCalls = 0;

    return {
        inserted,
        get optimizationCalls() {
            return optimizationCalls;
        },
        dependencies: {
            validateGimmick: ContentValidator.validateGimmick,
            optimizeImage: async (...args) => {
                optimizationCalls += 1;
                return optimizeImage(...args);
            },
            insert: async (collection, record) => {
                inserted.push({ collection, record });
                return record;
            }
        }
    };
}

test('valid content without an image inserts once without image preparation', async () => {
    const harness = createHarness(async () => {
        throw new Error('image preparation should not run');
    });
    const data = { title: 'Portal', content: 'Moves the player.' };

    await createGimmickSubmission(data, harness.dependencies);

    assert.equal(harness.optimizationCalls, 0);
    assert.equal(harness.inserted.length, 1);
    assert.equal(harness.inserted[0].collection, 'GimmickInfo');
    assert.deepEqual(harness.inserted[0].record, data);
});

test('successful image preparation inserts the prepared media URL with canonical options', async () => {
    const preparedUrl = 'https://static.wixstatic.com/media/prepared.webp?f=webp&q=80&w=1200&h=900';
    const harness = createHarness(async (imageUrl, options) => {
        assert.equal(imageUrl, 'https://example.com/source.png');
        assert.deepEqual(options, MAIN_IMAGE_OPTIONS);
        return preparedUrl;
    });

    await createGimmickSubmission({
        title: 'Door',
        content: 'Opens on interaction.',
        mainImage: 'https://example.com/source.png'
    }, harness.dependencies);

    assert.equal(harness.optimizationCalls, 1);
    assert.equal(harness.inserted.length, 1);
    assert.equal(harness.inserted[0].record.mainImage, preparedUrl);
});

test('image preparation failure stays explicit and never inserts, including reruns', async () => {
    const harness = createHarness(async () => {
        throw new Error('upload failed');
    });
    const data = {
        title: 'Mirror',
        content: 'Shows an avatar reflection.',
        mainImage: 'https://example.com/source.png'
    };

    await assert.rejects(
        createGimmickSubmission(data, harness.dependencies),
        /upload failed/
    );
    await assert.rejects(
        createGimmickSubmission(data, harness.dependencies),
        /upload failed/
    );

    assert.equal(harness.optimizationCalls, 2);
    assert.equal(harness.inserted.length, 0);
});

test('invalid content performs neither image preparation nor insert', async () => {
    const harness = createHarness(async () => 'https://static.wixstatic.com/media/prepared.webp');

    await assert.rejects(
        createGimmickSubmission({
            title: '   ',
            content: '',
            mainImage: 'https://example.com/source.png'
        }, harness.dependencies),
        /タイトルは必須です。/
    );

    assert.equal(harness.optimizationCalls, 0);
    assert.equal(harness.inserted.length, 0);
});
