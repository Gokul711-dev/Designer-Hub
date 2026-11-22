document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Active Link Observer (for Sidebar) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.sidebar-list a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Track all sections with an ID for active state
    document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
    });

    // --- Search Simulation ---
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // This would normally fetch from search.json and filter
            console.log('Searching for:', query);
        });
    }

    // --- Hover Effects & Micro-animations ---
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add custom micro-animation logic if needed
        });
    });

    // --- Mobile Sidebar Toggle (if needed) ---
});
// --- Supabase Auth Integration for Navigation ---
async function updateNavigationAuth() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    // Check for Supabase presence (it might be loaded on some pages only)
    if (typeof getSession !== 'function') {
        console.warn('Auth functions not available on this page.');
        return;
    }

    const { data: { session } } = await getSession();

    if (session) {
        // Check if admin
        const adminStatus = await isAdmin();
        const relPath = getRelativePath();

        let adminLink = '';
        if (adminStatus) {
            adminLink = `<a href="${relPath}admin/index.html" class="btn" style="padding: 0.5rem 1rem; border: 1px solid var(--accent-primary); color: var(--accent-primary); font-size: 0.85rem;">Admin Hub</a>`;
        }

        // User is logged in
        authContainer.innerHTML = `
            <div style="display: flex; gap: var(--space-sm); align-items: center;">
                ${adminLink}
                <a href="${relPath}profile/index.html" class="btn" style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); font-size: 0.85rem;">Profile</a>
                <button onclick="handleGlobalLogout()" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Logout</button>
            </div>
        `;
    } else {
        // User is logged out
        authContainer.innerHTML = `
            <a href="${getRelativePath()}auth/login.html" class="btn btn-primary" style="padding: 0.5rem 1.5rem; font-size: 0.85rem;">Login</a>
        `;
    }
}

function getRelativePath() {
    const path = window.location.pathname;

    // Better detection: count depth excluding domain and base path
    // For static files on local disk or simple hosting:
    if (path.includes('/blog/') || path.includes('/community/') || path.includes('/ui-ux/') ||
        path.includes('/tools/') || path.includes('/profile/') || path.includes('/auth/') ||
        path.includes('/brand-identity/') || path.includes('/design-systems/') || path.includes('/cheatsheets/') ||
        path.includes('/admin/')) {
        return '../';
    }
    return '';
}

async function handleGlobalLogout() {
    if (typeof signOut === 'function') {
        await signOut();
        window.location.href = getRelativePath() + 'index.html';
    }
}

// Ensure auth updates on load
document.addEventListener('DOMContentLoaded', updateNavigationAuth);
