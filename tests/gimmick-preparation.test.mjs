import assert from 'node:assert/strict';
import test from 'node:test';
import { createPreparedGimmick } from '../src/backend/gimmick-preparation.js';

const valid = () => ({ valid: true, errors: [] });
const invalid = () => ({ valid: false, errors: ['invalid'] });

function recorder() {
  const records = [];
  return { records, insert: async (value) => { records.push(value); return value; } };
}

test('valid content without image inserts once without preparation', async () => {
  let preparations = 0;
  const db = recorder();
  await createPreparedGimmick({ title: 'x' }, {
    validate: valid,
    prepareImage: async () => { preparations += 1; },
    insert: db.insert
  });
  assert.equal(preparations, 0);
  assert.equal(db.records.length, 1);
});

test('successful image preparation inserts prepared Wix media URL once', async () => {
  let options;
  const db = recorder();
  await createPreparedGimmick({ title: 'x', mainImage: 'https://example.test/a.jpg' }, {
    validate: valid,
    prepareImage: async (_url, value) => { options = value; return 'https://media.wix.com/a.webp?f=webp&q=80&w=1200&h=900'; },
    insert: db.insert
  });
  assert.equal(db.records.length, 1);
  assert.match(db.records[0].mainImage, /media\.wix\.com/);
  assert.deepEqual(options, { format: 'webp', quality: 80, resize: { width: 1200, height: 900 } });
});

test('repeated image preparation failure remains explicit with zero inserts', async () => {
  const db = recorder();
  const dependencies = {
    validate: valid,
    prepareImage: async () => { throw new Error('upload failed'); },
    insert: db.insert
  };
  await assert.rejects(() => createPreparedGimmick({ title: 'x', mainImage: 'bad' }, dependencies), /upload failed/);
  await assert.rejects(() => createPreparedGimmick({ title: 'x', mainImage: 'bad' }, dependencies), /upload failed/);
  assert.equal(db.records.length, 0);
});

test('invalid content performs neither image preparation nor insert', async () => {
  let preparations = 0;
  const db = recorder();
  await assert.rejects(() => createPreparedGimmick({ title: '', mainImage: 'x' }, {
    validate: invalid,
    prepareImage: async () => { preparations += 1; },
    insert: db.insert
  }), /invalid/);
  assert.equal(preparations, 0);
  assert.equal(db.records.length, 0);
});
