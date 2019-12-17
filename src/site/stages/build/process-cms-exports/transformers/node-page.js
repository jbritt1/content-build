const moment = require('moment-timezone');
const { flatten, isEmpty } = require('lodash');
const { getDrupalValue, createMetaTag } = require('./helpers');

function pageTransform(entity) {
  const {
    title,
    changed,
    fieldIntroText,
    fieldPageLastBuilt,
    fieldAlert,
    fieldDescription,
    moderationState: [{ value: published }],
    metatag: { value: metaTags },
  } = entity;

  const transformed = Object.assign({}, entity, {
    title: getDrupalValue(title),
    entityBundle: 'page',
    entityUrl: {
      path: entity.path[0].alias.replace(/\\/g, ''),
    },
    fieldAdministration: entity.fieldAdministration[0],

    fieldIntroText: getDrupalValue(fieldIntroText),
    fieldDescription: getDrupalValue(fieldDescription),
    changed: new Date(getDrupalValue(changed)).getTime() / 1000,
    fieldPageLastBuilt: {
      // Assume the raw data is in UTC
      date: moment
        .tz(getDrupalValue(fieldPageLastBuilt), 'UTC')
        .format('YYYY-MM-DD HH:mm:ss UTC'),
    },
    // fieldPageLastBuilt: new Date(
    //   getDrupalValue(fieldPageLastBuilt),
    // ).toUTCString(),

    entityPublished: published === 'published',
    entityMetaTags: [
      createMetaTag('MetaValue', 'title', metaTags.title),
      createMetaTag('MetaValue', 'twitter:card', metaTags.twitter_cards_type),
      createMetaTag('MetaProperty', 'og:site_name', metaTags.og_site_name),
      createMetaTag('MetaValue', 'twitter:title', metaTags.twitter_cards_title),
      createMetaTag('MetaValue', 'twitter:site', metaTags.twitter_cards_site),
      createMetaTag('MetaProperty', 'og:title', metaTags.og_title),
    ],
  });

  transformed.fieldAlert = !isEmpty(flatten(fieldAlert)) ? fieldAlert[0] : null;

  delete transformed.moderationState;
  delete transformed.metatag;
  delete transformed.path;

  return transformed;
}

module.exports = {
  filter: [
    'field_intro_text',
    'field_description',
    'field_featured_content',
    'field_content_block',
    'field_alert',
    'field_related_links',
    'field_administration',
    'field_page_last_built',
    'metatag',
    'changed',
    'moderation_state',
    'path',
  ],
  transform: pageTransform,
};
