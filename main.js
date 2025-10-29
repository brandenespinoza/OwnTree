// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

/**
 * Main function to fetch config and populate the page
 */
async function loadProfile() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();

        // Set page theme
        document.body.dataset.theme = config.theme || 'dark';

        // Populate all sections
        populateMeta(config.meta);
        populateHeader(config.identity);
        populatePrimaryActions(config.primaryActions);
        populateLinkGroups(config.linkGroups);
        populateFooter(config.footer);

    } catch (error) {
        console.error('Failed to load profile config:', error);
        // Fallback content in HTML will be shown
    }
}

/**
 * Populates <head> meta tags for SEO and social unfurling (PRD 8.4)
 */
function populateMeta(meta) {
    if (!meta) return;
    
    document.title = meta.title || 'Profile';
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:image"]', 'content', meta.ogImage);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
}

/**
 * Helper to find and set meta tag content
 */
function setMeta(selector, attribute, value) {
    const el = document.querySelector(selector);
    if (el && value) {
        el.setAttribute(attribute, value);
    }
}

/**
 * Populates the header with identity info (PRD 5.1)
 */
function populateHeader(identity) {
    if (!identity) return;
    
    const header = document.getElementById('identity');
    if (!header) return;

    // Clear fallback content
    header.innerHTML = ''; 

    if (identity.avatar) {
        const avatar = document.createElement('img');
        avatar.src = identity.avatar;
        avatar.alt = `${identity.name}'s avatar`;
        avatar.className = 'avatar';
        header.appendChild(avatar);
    }

    if (identity.name) {
        const name = document.createElement('h1');
        name.textContent = identity.name;
        header.appendChild(name);
    }

    if (identity.tagline) {
        const tagline = document.createElement('p');
        tagline.className = 'tagline';
        tagline.textContent = identity.tagline;
        header.appendChild(tagline);
    }

}

/**
 * Populates the primary action buttons (PRD 5.2)
 */
function populatePrimaryActions(actions) {
    const container = document.getElementById('primary-actions');
    if (!actions || !container) return;

    container.innerHTML = ''; // Clear fallback

    actions.forEach(action => {
        const link = createLink(action, 'btn-primary');
        container.appendChild(link);
    });
}

/**
 * Populates the grouped sections of links (PRD 5.3)
 */
function populateLinkGroups(groups) {
    const container = document.getElementById('link-groups');
    if (!groups || !container) return;

    container.innerHTML = ''; // Clear fallback
    const sections = [];

    groups.forEach(group => {
        if (!group.links || group.links.length === 0) return;

        const section = document.createElement('section');
        section.className = 'link-group';

        const title = document.createElement('h2');
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'link-group__toggle';

        const toggleLabel = document.createElement('span');
        toggleLabel.className = 'link-group__label';
        toggleLabel.textContent = group.title || 'Links';
        toggle.appendChild(toggleLabel);

        const listId = `link-group-${sections.length}`;
        toggle.setAttribute('aria-controls', listId);
        toggle.setAttribute('aria-expanded', 'false');

        title.appendChild(toggle);
        section.appendChild(title);

        const list = document.createElement('div');
        list.className = 'link-group__links';
        list.id = listId;
        list.hidden = true;

        group.links.forEach(linkData => {
            const link = createLink(linkData, 'btn-standard');
            list.appendChild(link);
        });

        section.appendChild(list);
        container.appendChild(section);

        sections.push({ section, toggle, list });
    });

    sections.forEach(({ toggle }, activeIndex) => {
        toggle.addEventListener('click', () => {
            const { section, list } = sections[activeIndex];
            const isCurrentlyOpen = toggle.getAttribute('aria-expanded') === 'true';

            if (isCurrentlyOpen) {
                section.classList.remove('is-open');
                list.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                return;
            }

            section.classList.add('is-open');
            list.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
        });
    });
}

/**
 * Populates the footer (PRD 5.4)
 */
function populateFooter(footer) {
    const container = document.getElementById('footer');
    if (!footer || !container) return;
    
    container.innerHTML = ''; // Clear fallback

    if (footer.message) {
        const message = document.createElement('p');
        if (footer.message_link) {
            const link = document.createElement('a');
            link.href = footer.message_link;
            link.textContent = footer.message;
            if (!footer.message_link.startsWith('#') && !footer.message_link.startsWith('mailto:')) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            message.appendChild(link);
        } else {
            message.textContent = footer.message;
        }
        container.appendChild(message);
    }
    
    if (footer.copyright) {
        const copyright = document.createElement('p');
        copyright.textContent = footer.copyright;
        container.appendChild(copyright);
    }
}

/**
 * Utility function to create a single link element
 * @param {object} linkData - { label, url, subtext }
 * @param {string} baseClass - 'btn-primary' or 'btn-standard'
 * @returns {HTMLAnchorElement}
 */
function createLink(linkData, baseClass) {
    const link = document.createElement('a');
    link.href = linkData.url;
    link.className = `btn ${baseClass}`;

    // Security: Set rel for external links (PRD 9.1)
    if (!linkData.url.startsWith('#') && !linkData.url.startsWith('mailto:')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }

    // Main label
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = linkData.label;
    link.appendChild(label);

    // Optional subtext (PRD 5.3)
    if (linkData.subtext) {
        const subtext = document.createElement('span');
        subtext.className = 'subtext';
        subtext.textContent = linkData.subtext;
        link.appendChild(subtext);
    }

    return link;
}
