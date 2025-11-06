// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

let toastTimeoutId = null;

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
    setLink('link[rel="canonical"]', 'href', meta.url);

    setMeta('meta[property="og:title"]', 'content', meta.ogTitle || meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.ogDescription || meta.description);
    setMeta('meta[property="og:type"]', 'content', meta.type || 'website');
    setMeta('meta[property="og:url"]', 'content', meta.url);
    setMeta('meta[property="og:image"]', 'content', meta.ogImage || meta.twitterImage);
    setMeta('meta[property="og:image:alt"]', 'content', meta.ogImageAlt || meta.imageAlt || meta.twitterImageAlt);
    setMeta('meta[property="og:site_name"]', 'content', meta.siteName || meta.title);
    setMeta('meta[property="og:locale"]', 'content', meta.locale || 'en_US');

    setMeta('meta[name="twitter:card"]', 'content', meta.twitterCard || 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', meta.twitterTitle || meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.twitterDescription || meta.description);
    setMeta('meta[name="twitter:image"]', 'content', meta.twitterImage || meta.ogImage);
    setMeta('meta[name="twitter:image:alt"]', 'content', meta.twitterImageAlt || meta.ogImageAlt || meta.imageAlt);
    setMeta('meta[name="twitter:site"]', 'content', meta.twitterSite);
    setMeta('meta[name="twitter:creator"]', 'content', meta.twitterCreator);

    setMeta('meta[name="theme-color"]', 'content', meta.themeColor);
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
 * Helper to find and set link attributes such as canonical URLs
 */
function setLink(selector, attribute, value) {
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
    const hasUrl = typeof linkData.url === 'string' && linkData.url.length > 0;
    const hasClipboard = typeof linkData.clipboard === 'string' && linkData.clipboard.length > 0;
    const element = document.createElement(hasUrl ? 'a' : 'button');

    element.className = `btn ${baseClass}`;

    if (hasUrl) {
        element.href = linkData.url;

        if (shouldOpenInNewTab(linkData.url)) {
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
        }
    } else {
        element.type = 'button';
    }

    // Main label
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = linkData.label;
    element.appendChild(label);

    // Optional subtext (PRD 5.3)
    if (linkData.subtext) {
        const subtext = document.createElement('span');
        subtext.className = 'subtext';
        subtext.textContent = linkData.subtext;
        element.appendChild(subtext);
    }

    if (hasClipboard || !hasUrl) {
        element.addEventListener('click', async (event) => {
            await handleLinkInteraction(event, linkData, { hasUrl, hasClipboard });
        });
    }

    return element;
}

/**
 * Handles clipboard copy and navigation for link interactions
 */
async function handleLinkInteraction(event, linkData, { hasUrl, hasClipboard }) {
    if (!hasClipboard && hasUrl) {
        return;
    }

    event.preventDefault();

    let copiedSuccessfully = true;

    if (hasClipboard) {
        copiedSuccessfully = await copyToClipboard(linkData.clipboard);
        showToast(
            copiedSuccessfully ? 'Copied to clipboard' : 'Unable to copy to clipboard',
            !copiedSuccessfully
        );
    }

    if (!hasUrl) {
        return;
    }

    const openInNewTab = shouldOpenInNewTab(linkData.url);

    if (openInNewTab) {
        const openedWindow = window.open(linkData.url, '_blank', 'noopener,noreferrer');
        if (!openedWindow) {
            window.location.href = linkData.url;
        }
    } else if (linkData.url.startsWith('#')) {
        const targetId = linkData.url.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        window.location.href = linkData.url;
    }
}

/**
 * Determines whether a link should open in a new tab
 */
function shouldOpenInNewTab(url) {
    const normalized = url.toLowerCase();
    return !(
        normalized.startsWith('#') ||
        normalized.startsWith('mailto:') ||
        normalized.startsWith('tel:')
    );
}

/**
 * Copies text to the clipboard with a fallback for older browsers
 */
async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard write failed, falling back to execCommand', error);
        }
    }
    return fallbackCopyToClipboard(text);
}

/**
 * Legacy clipboard fallback using a temporary textarea
 */
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    document.body.appendChild(textarea);

    let success = false;

    try {
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        success = document.execCommand('copy');
    } catch (error) {
        console.error('Fallback clipboard copy failed', error);
        success = false;
    } finally {
        document.body.removeChild(textarea);
    }

    return success;
}

/**
 * Shows a lightweight toast notification near the bottom of the viewport
 */
function showToast(message, isError = false) {
    let toast = document.getElementById('toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle('toast--error', Boolean(isError));

    // Restart animation by forcing a reflow if the toast is already visible
    toast.classList.remove('is-visible');
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    if (toastTimeoutId) {
        clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2000);
}
