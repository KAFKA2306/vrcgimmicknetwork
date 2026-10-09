import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInquiryHref,
  classifyEvent,
  createCreatorProfile,
  createInquiry,
  publicInquiryReference,
  publishableProfiles,
  transitionInquiry
} from '../src/public/scripts/inquiry-contract.js';

test('detail route preserves source gimmick identity', () => {
  const href = buildInquiryHref({_id:'g-1', title:'Door', gimmickCategory:'World', source:'/gimmick-info/g-1'});
  const url = new URL(href, 'https://example.test');
  assert.equal(url.pathname, '/inquiry');
  assert.equal(url.searchParams.get('gimmick_id'), 'g-1');
  assert.equal(url.searchParams.get('title'), 'Door');
  assert.equal(url.searchParams.get('category'), 'World');
  assert.equal(url.searchParams.get('source'), '/gimmick-info/g-1');
});

test('inquiry lifecycle keeps private data out of public reference', () => {
  const draft = createInquiry({inquiry_id:'i-1', gimmick_id:'g-1', title:'Door', category:'World', source:'/gimmick-info/g-1', contact:'private@example.test', message:'help', synthetic:true});
  const submitted = transitionInquiry(draft, 'submitted');
  const reviewing = transitionInquiry(submitted, 'in_review');
  assert.equal(reviewing.gimmick.gimmick_id, 'g-1');
  const publicRef = publicInquiryReference(reviewing);
  assert.equal('private' in publicRef, false);
  assert.equal(JSON.stringify(publicRef).includes('private@example.test'), false);
  assert.throws(() => transitionInquiry(reviewing, 'submitted'));
});

test('creator publication is permission gated', () => {
  const base = {categories:['World'], portfolio_url:'https://example.test/work', acceptance_status:'open', contact_method:'form'};
  const granted = createCreatorProfile({...base, creator_id:'c-1', display_name:'Public', public_permission:'granted'});
  const withheld = createCreatorProfile({...base, creator_id:'c-2', display_name:'Private', public_permission:'withheld'});
  assert.deepEqual(publishableProfiles([granted, withheld]).map((p) => p.creator_id), ['c-1']);
});

test('synthetic events never count as real usage', () => {
  assert.deepEqual(classifyEvent({kind:'inquiry', synthetic:true}), {kind:'inquiry', synthetic:true, counts_as_real_usage:false});
  assert.deepEqual(classifyEvent({kind:'cta'}), {kind:'cta', synthetic:false, counts_as_real_usage:true});
});
