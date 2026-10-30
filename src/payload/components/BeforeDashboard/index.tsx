import { Banner } from '@payloadcms/ui/elements/Banner';
import React from 'react';


import './index.scss';

const baseClass = 'before-dashboard';

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to the HMM ITB Content Panel!</h4>
      </Banner>

      <div className={`${baseClass}__content`}>
        <p>
          This Content Panel manages the public HMM ITB website, which is the set of pages outside
          the LMS such as the home page, <code>/about</code>, <code>/news</code>,{' '}
          <code>/event</code>, <code>/achievements</code> and <code>/gallery</code>. Your account
          is copied from the LMS each time you sign in there, using the same email and password.
        </p>

        <h5>Content Pillar (posts with their own pages):</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>News</strong>: articles listed on <code>/news</code>, each with its own page at{' '}
            <code>/news/&lt;slug&gt;</code>. Add a cover image and an executive summary because the
            news cards use both.{' '}
            <a href="/docs/admin/cms-news" rel="noopener noreferrer" target="_blank">
              Guide
            </a>
          </li>
          <li>
            <strong>Events</strong>: activities listed on <code>/event</code> with start/end dates,
            category, location and a banner or poster. Each event has its own page at{' '}
            <code>/event/&lt;slug&gt;</code>.{' '}
            <a href="/docs/admin/cms-events" rel="noopener noreferrer" target="_blank">
              Guide
            </a>
          </li>
          <li>
            <strong>Achievements</strong>: competition wins and awards listed on{' '}
            <code>/achievements</code>, with award level, date, team members and NIMs. Each
            achievement has its own page at <code>/achievements/&lt;slug&gt;</code>.{' '}
            <a href="/docs/admin/cms-achievements" rel="noopener noreferrer" target="_blank">
              Guide
            </a>
          </li>
          <li>
            <strong>Galleries</strong>: photo albums shown as cards on <code>/gallery</code>. An
            album has no page of its own. Its card opens the album&apos;s Google Drive folder, so
            share the folder as &quot;Anyone with the link&quot; first.{' '}
            <a href="/docs/admin/cms-gallery" rel="noopener noreferrer" target="_blank">
              Guide
            </a>
          </li>
        </ul>

        <h5>External Home Page Contents (sections of the home page):</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>External Manifesto</strong>: the hero section with the punch line, support
            text, hero image, cabinet name and cabinet logo. Only one should be active.
          </li>
          <li>
            <strong>External Spotlight</strong>: the title and caption that introduce the editorial
            grid. Only one should be active.
          </li>
          <li>
            <strong>External Highlight</strong>: the editorial grid cards, each with an image, a
            Study/Society/Solidarity tag, a caption, an optional link and a layout (Feature or
            Default).
          </li>
          <li>
            <strong>External Pillar</strong>: the Study, Society and Solidarity pillar sections.
            The page reads them by <strong>Display Order</strong>, so keep them in that order.
          </li>
          <li>
            <strong>External Heritage Timeline</strong>: the year-by-year entries in the heritage
            section, sorted by <strong>Display Order</strong>.
          </li>
          <li>
            <strong>External Contact</strong>: the email, Instagram, TikTok and LINE links in the
            Solidarity call-to-action. Only the first active entry is used.
          </li>
        </ul>

        <h5>External About Page Contents (sections of /about):</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>External About</strong>: the hero (cabinet name and logo, heading, lead text
            and wallpaper) and the text between the vision and mission sections. Only one should be
            active.
          </li>
          <li>
            <strong>External Logo Meaning</strong>: the parts of the cabinet logo and what each
            means, sorted by <strong>Display Order</strong>.
          </li>
          <li>
            <strong>External Organogram</strong>: departments, bureaus and divisions. The checkboxes
            put each item in the Prince, Directing, Executing &amp; Supporting, or External &amp;
            Advisory section. <strong>Detail Type</strong> picks a featured detail (tagline,
            paragraphs and people) or a roster (role and name rows).
          </li>
          <li>
            <strong>External Visi</strong>: the vision heading, lead, TL;DR, core values and an
            optional image. Only one should be active.
          </li>
          <li>
            <strong>External Misi</strong>: the mission section, made of groups of mission cards.
            Each card has its own Active checkbox and Display Order. Only one mission section
            should be active.
          </li>
        </ul>

        <h5>External Images:</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>External Image</strong>: background images on the home page, looked up by{' '}
            <strong>Image Key</strong>. The keys in use are <code>hero</code>,{' '}
            <code>heritage</code> and <code>cta</code>. Type a key exactly, because an image with
            the wrong key is never shown.
          </li>
        </ul>

        <h5>Content Collections (shared):</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>Media</strong>: every uploaded image and file, stored on DigitalOcean Spaces.
            Always fill in the alt text.
          </li>
          <li>
            <strong>Categories</strong>: nested categories. These are not shown on the public
            website yet.
          </li>
          <li>
            <strong>Users</strong>: CMS accounts, synced from LMS accounts with the Admin or
            Superadmin role.
          </li>
        </ul>

        <h5>Publishing Checklist:</h5>
        <ul className={`${baseClass}__instructions`}>
          <li>
            For News, Events, Achievements and Galleries, set <strong>Publishing Status</strong> to{' '}
            <strong>Published</strong> <em>and</em> click <strong>Publish changes</strong>. A post
            only appears on the website when both are done.
          </li>
          <li>
            For External collections, tick <strong>Active</strong> and click{' '}
            <strong>Publish changes</strong>. Untick Active to hide an item without deleting it.
            Where only one entry should be active, deactivate the old one when you activate a new
            one.
          </li>
          <li>
            Autosaved drafts are never public. After editing a published item, click{' '}
            <strong>Publish changes</strong> again or the website keeps the previous version.
          </li>
          <li>
            Use the arrow next to <strong>Publish changes</strong> to{' '}
            <strong>Schedule Publish</strong>, the <strong>Versions</strong> tab to restore an
            earlier save, and the eye icon to open <strong>Live Preview</strong> (News, Events and
            Achievements).
          </li>
          <li>
            Use the <strong>SEO</strong> tab on News, Events and Achievements to set the meta
            title, description and preview image.
          </li>
          <li>
            For step-by-step guides, see the{' '}
            <a href="/docs/admin" rel="noopener noreferrer" target="_blank">
              Admin Documentation
            </a>
            .
          </li>
        </ul>

        <p className={`${baseClass}__tip`}>
          <strong>Admin Roles:</strong> Superadmins have full access, including user management.
          Admins can create, edit and delete content but cannot manage other users.
        </p>
      </div>
    </div>
  );
};

export default BeforeDashboard;
