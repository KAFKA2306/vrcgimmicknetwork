export const INQUIRY_SCHEMA_VERSION = 'vrcgimmicknetwork.inquiry.v1';
export const CREATOR_PROFILE_SCHEMA_VERSION = 'vrcgimmicknetwork.creator-profile.v1';

const INQUIRY_STATES = new Set(['draft', 'submitted', 'in_review', 'closed']);
const PROFILE_ACCEPTANCE = new Set(['open', 'paused', 'closed']);
const PUBLIC_PERMISSION = new Set(['granted', 'withheld']);

function requiredString(value, name) {
    if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
    return value.trim();
}

export function buildInquiryHref(gimmick) {
    const id = requiredString(gimmick.gimmick_id || gimmick._id, 'gimmick_id');
    const params = new URLSearchParams({
        gimmick_id: id,
        title: requiredString(gimmick.title, 'title'),
        category: requiredString(Array.isArray(gimmick.category) ? gimmick.category[0] : (gimmick.category || gimmick.gimmickCategory), 'category'),
        source: requiredString(gimmick.source || `/gimmick-info/${id}`, 'source')
    });
    return `/inquiry?${params.toString()}`;
}

export function createInquiry({ inquiry_id, gimmick_id, title, category, source, contact, message = '', synthetic = false }) {
    return {
        schema_version: INQUIRY_SCHEMA_VERSION,
        inquiry_id: requiredString(inquiry_id, 'inquiry_id'),
        gimmick: {
            gimmick_id: requiredString(gimmick_id, 'gimmick_id'),
            title: requiredString(title, 'title'),
            category: requiredString(category, 'category'),
            source: requiredString(source, 'source')
        },
        private: {
            contact: requiredString(contact, 'contact'),
            message: String(message)
        },
        state: 'draft',
        synthetic: Boolean(synthetic)
    };
}

export function transitionInquiry(inquiry, nextState) {
    if (!INQUIRY_STATES.has(nextState)) throw new TypeError('invalid inquiry state');
    const allowed = {
        draft: new Set(['submitted']),
        submitted: new Set(['in_review', 'closed']),
        in_review: new Set(['closed']),
        closed: new Set()
    };
    if (!allowed[inquiry.state]?.has(nextState)) throw new TypeError(`invalid transition ${inquiry.state} -> ${nextState}`);
    return { ...inquiry, state: nextState };
}

export function publicInquiryReference(inquiry) {
    return {
        schema_version: inquiry.schema_version,
        inquiry_id: inquiry.inquiry_id,
        gimmick_id: inquiry.gimmick.gimmick_id,
        state: inquiry.state,
        synthetic: inquiry.synthetic
    };
}

export function createCreatorProfile({ creator_id, display_name, categories, portfolio_url, acceptance_status, contact_method, public_permission }) {
    if (!Array.isArray(categories) || categories.length === 0) throw new TypeError('categories are required');
    if (!PROFILE_ACCEPTANCE.has(acceptance_status)) throw new TypeError('invalid acceptance_status');
    if (!PUBLIC_PERMISSION.has(public_permission)) throw new TypeError('invalid public_permission');
    return {
        schema_version: CREATOR_PROFILE_SCHEMA_VERSION,
        creator_id: requiredString(creator_id, 'creator_id'),
        display_name: requiredString(display_name, 'display_name'),
        categories: categories.map((value) => requiredString(value, 'category')),
        portfolio_url: requiredString(portfolio_url, 'portfolio_url'),
        acceptance_status,
        contact_method: requiredString(contact_method, 'contact_method'),
        public_permission
    };
}

export function publishableProfiles(profiles) {
    return profiles.filter((profile) => profile.public_permission === 'granted');
}

export function classifyEvent({ kind, synthetic = false }) {
    if (!['cta', 'inquiry', 'profile'].includes(kind)) throw new TypeError('invalid event kind');
    return { kind, synthetic: Boolean(synthetic), counts_as_real_usage: !synthetic };
}
