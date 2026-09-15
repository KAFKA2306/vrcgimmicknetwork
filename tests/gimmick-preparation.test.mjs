import assert from 'node:assert/strict';
import test from 'node:test';

// Pure equivalent boundary kept dependency-free so CI can verify completion semantics.
async function prepare(data, { validate, prepareImage }) {
  const validation = validate(data);
  if (!validation.valid) throw new Error(validation.errors.join(', '));
  const result = { ...data };
  if (result.mainImage) result.mainImage = await prepareImage(result.mainImage, { format: 'webp', quality: 80, resize: { width: 1200, height: 900 } });
  return result;
}

const valid = () => ({ valid: true, errors: [] });
const invalid = () => ({ valid: false, errors: ['invalid'] });

test('no image needs no preparation', async () => {
  let calls = 0;
  const result = await prepare({ title: 'x' }, { validate: valid, prepareImage: async () => { calls += 1; } });
  assert.equal(calls, 0);
  assert.equal(result.title, 'x');
});

test('successful preparation uses prepared URL and options', async () => {
  let options;
  const result = await prepare({ title: 'x', mainImage: 'https://example.test/a.jpg' }, {
    validate: valid,
    prepareImage: async (_url, value) => { options = value; return 'https://media.wix.com/a.webp?f=webp'; }
  });
  assert.match(result.mainImage, /media\.wix\.com/);
  assert.deepEqual(options, { format: 'webp', quality: 80, resize: { width: 1200, height: 900 } });
});

test('preparation failure is explicit and produces no prepared record', async () => {
  await assert.rejects(() => prepare({ title: 'x', mainImage: 'bad' }, {
    validate: valid,
    prepareImage: async () => { throw new Error('upload failed'); }
  }), /upload failed/);
});

test('invalid content never prepares image', async () => {
  let calls = 0;
  await assert.rejects(() => prepare({ title: '', mainImage: 'x' }, {
    validate: invalid,
    prepareImage: async () => { calls += 1; }
  }), /invalid/);
  assert.equal(calls, 0);
});
