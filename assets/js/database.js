// Supabase Configuration
// Using the credentials provided for dynamic backend functionality

const SUPABASE_URL = 'https://btbbkxsfmhaabnueideh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t2XAjgU69wmUA_fwGiv38g_ZqltN9Wy';

// Initialize the Supabase client safely
function getSupabase() {
    if (window.supabase) {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    console.error('Supabase CDN not loaded!');
    return null;
}

const supabase = getSupabase();

/**
 * AUTHENTICATION FUNCTIONS
 */

async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    });

    if (!error && data.user) {
        // Create profile entry immediately
        await supabase.from('profiles').insert([{ id: data.user.id, username }]);
    }
    return { data, error };
}

async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
}

async function signOut() {
    return await supabase.auth.signOut();
}

async function getSession() {
    return await supabase.auth.getSession();
}

/**
 * PROFILE FUNCTIONS
 */

async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

async function updateProfile(userId, updates) {
    return await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
}

/**
 * CONTENT FUNCTIONS
 */

async function submitPost(postData) {
    if (!supabase) return { error: 'Backend connection failed' };

    const session = await getSession();
    const userId = session.data.session?.user.id;

    const { data, error } = await supabase
        .from('community_posts')
        .insert([
            {
                title: postData.title,
                content: postData.content,
                author_id: userId,
                author_name: postData.author,
                category: postData.category,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        ]);

    return { data, error };
}

async function fetchApprovedPosts() {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
            *,
            profiles:author_id (username)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    return data;
}

async function isAdmin() {
    if (!supabase) return false;
    const { data: { session } } = await getSession();
    const userEmail = session?.user?.email;
    const administrators = ['contribute@designershub.com', 'admin@designershub.com'];
    return administrators.includes(userEmail);
}