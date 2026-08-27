import { Banner } from '@payloadcms/ui/elements/Banner';
import React from 'react';

import { SeedButton } from './SeedButton';

import './index.scss';

const baseClass = 'before-dashboard';

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to the HMM CMS Dashboard!</h4>
      </Banner>

      <div className={`${baseClass}__content`}>
        <p>
          This content management system helps you manage the HMM (Himpunan Mahasiswa Mesin)
          website. As an admin, you can create and manage various types of content to keep the
          community informed and engaged.
        </p>

        <h5>Collections You Can Manage:</h5>
        <ul className={`${baseClass}__collections`}>
          <li>
            <strong>Posts</strong> - Blog articles and announcements with rich content, categories,
            and SEO optimization
          </li>
          <li>
            <strong>Pages</strong> - Static pages with hero sections, content blocks, and custom
            layouts
          </li>
          <li>
            <strong>Events</strong> - Manage events, workshops, and activities with dates,
            locations, and registration details
          </li>
          <li>
            <strong>News</strong> - Latest news and updates with featured images and executive
            summaries
          </li>
          <li>
            <strong>Achievements</strong> - Showcase competition wins, awards, and team
            accomplishments with detailed member information
          </li>
          <li>
            <strong>Categories</strong> - Organize content into nested categories for better
            navigation
          </li>
          <li>
            <strong>Media</strong> - Upload and manage images, documents, and files (stored on
            DigitalOcean Spaces)
          </li>
          <li>
            <strong>Users</strong> - Manage admin accounts with role-based access control
            (Superadmin & Admin)
          </li>
        </ul>

        <h5>Available Features:</h5>
        <ul className={`${baseClass}__features`}>
          <li>
            <strong>SEO Management</strong> - Built-in SEO fields for meta titles, descriptions, and
            social previews
          </li>
          <li>
            <strong>URL Redirects</strong> - Manage redirects for pages and posts when content moves
          </li>
          <li>
            <strong>Form Builder</strong> - Create custom forms for surveys, registrations, and
            feedback
          </li>
          <li>
            <strong>Full-Text Search</strong> - Powerful search functionality across posts and
            content
          </li>
          <li>
            <strong>Live Preview</strong> - See changes in real-time before publishing
          </li>
          <li>
            <strong>Draft & Schedule</strong> - Save drafts and schedule content for future
            publication
          </li>
        </ul>

        <h5>Getting Started:</h5>
        <ul className={`${baseClass}__instructions`}>
          <li>
            <SeedButton />
            {' with sample content to explore the dashboard features, then '}
            <a href="/" target="_blank">
              visit your website
            </a>
            {' to see the results.'}
          </li>
          <li>
            Navigate to the <strong>Media</strong> collection to upload your first images and
            documents
          </li>
          <li>
            Create <strong>Categories</strong> to organize your content structure
          </li>
          <li>
            Start creating content in <strong>Posts</strong>, <strong>Events</strong>, or{' '}
            <strong>News</strong> collections
          </li>
          <li>
            Use the <strong>SEO</strong> tab when editing content to optimize for search engines
          </li>
          <li>
            For detailed documentation, visit the{' '}
            <a
              href="https://payloadcms.com/docs/getting-started/what-is-payload"
              rel="noopener noreferrer"
              target="_blank"
            >
              Payload CMS Getting Started Guide
            </a>
          </li>
        </ul>

        <p className={`${baseClass}__tip`}>
          <strong>Admin Roles:</strong> Superadmins have full access including user management,
          while Admins can create and edit content but cannot manage other users.
        </p>

        {/* <p className={`${baseClass}__removal`}>
          This onboarding component can be removed by updating your{' '}
          <strong>payload.config.ts</strong> file.
        </p> */}
      </div>
    </div>
  );
};

export default BeforeDashboard;
