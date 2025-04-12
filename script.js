// WARNING: Do NOT put a real API key here if your code will be public.
// Use environment variables or a backend proxy in real projects.
// For this local/prototype example ONLY:
const GOOGLE_BOOKS_API_KEY = 'YOUR_API_KEY_HERE'; // !!! REPLACE WITH YOUR KEY !!!
if (!GOOGLE_BOOKS_API_KEY || GOOGLE_BOOKS_API_KEY === 'YOUR_API_KEY_HERE') {
     console.warn("Google Books API key is missing or not replaced. Book covers will not be fetched from Google.");
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const LOGIN_STATE_KEY = 'litLoungeUserLoggedIn';
    const DEFAULT_BOOK_PLACEHOLDER = 'images/ebook-placeholder.png'; // Update this if you use a different placeholder
    const USER_PLACEHOLDER = 'images/user-placeholder.png'; // Add this if needed

    // --- Login State Management ---
    const isUserLoggedIn = () => localStorage.getItem(LOGIN_STATE_KEY) === 'true';
    const setLoginState = (loggedIn) => {
        try {
            if (loggedIn) {
                localStorage.setItem(LOGIN_STATE_KEY, 'true'); console.log("User logged IN");
            } else {
                localStorage.removeItem(LOGIN_STATE_KEY);
                // Clear other user data too
                localStorage.removeItem('litLoungeCart_v2');
                localStorage.removeItem('litLoungeInterests_v2');
                cart = []; interests = [];
                console.log("User logged OUT");
            }
        } catch (e) { console.error("Error setting login state:", e); }
        updateNavBasedOnLogin(); // Always update nav after state change
    };

    // --- Data (with ISBNs) ---
    const allBooks = [
        { id: 1, title: "The Midnight Library", author: "Matt Haig", category: "Fiction", price: 14.99, isbn: "9780525559474", imageUrl: null, featured: true },
        { id: 2, title: "Project Hail Mary", author: "Andy Weir", category: "Science Fiction", price: 16.50, isbn: "9780593135204", imageUrl: null, featured: true },
        { id: 3, title: "The Thursday Murder Club", author: "Richard Osman", category: "Mystery", price: 12.99, isbn: "9781984880963", imageUrl: null, featured: false },
        { id: 4, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "Non-Fiction", price: 19.00, isbn: "9780062316097", imageUrl: null, featured: true },
        { id: 5, title: "Fourth Wing", author: "Rebecca Yarros", category: "Fantasy", price: 18.99, isbn: "9781649374042", imageUrl: null, featured: true },
        { id: 6, title: "Klara and the Sun", author: "Kazuo Ishiguro", category: "Fiction", price: 15.50, isbn: "9780593318171", imageUrl: null, featured: false },
        { id: 7, title: "Dune", author: "Frank Herbert", category: "Science Fiction", price: 11.75, isbn: "9780441172719", imageUrl: null, featured: false },
        { id: 8, title: "The Silent Patient", author: "Alex Michaelides", category: "Mystery", price: 10.25, isbn: "9781250301697", imageUrl: null, featured: true },
        { id: 9, title: "Atomic Habits", author: "James Clear", category: "Non-Fiction", price: 17.99, isbn: "9780735211292", imageUrl: null, featured: false },
        { id: 10, title: "A Court of Thorns and Roses", author: "Sarah J. Maas", category: "Fantasy", price: 13.50, isbn: "9781619634442", imageUrl: null, featured: false },
        { id: 11, title: "Where the Crawdads Sing", author: "Delia Owens", category: "Fiction", price: 10.99, isbn: "9780735219090", imageUrl: null, featured: false },
        { id: 12, title: "Children of Time", author: "Adrian Tchaikovsky", category: "Science Fiction", price: 15.00, isbn: "9780316452496", imageUrl: null, featured: true }
    ];
    const sampleReviews = [ { id: 101, bookId: 1, bookTitle: "The Midnight Library", reviewer: "Alice R.", rating: 5, category: "Fiction", text: "Profoundly moving and beautifully written. Explores choices and regrets in a unique way.", date: "2024-01-15" }, { id: 102, bookId: 2, bookTitle: "Project Hail Mary", reviewer: "Bob S.", rating: 5, category: "Science Fiction", text: "Incredible science, compelling characters, and laugh-out-loud moments. A masterpiece!", date: "2024-01-10" }, { id: 103, bookId: 3, bookTitle: "The Thursday Murder Club", reviewer: "Charlie T.", rating: 4, category: "Mystery", text: "Charming characters and a cozy mystery plot. Very entertaining, if a little meandering.", date: "2024-01-05" }, { id: 104, bookId: 4, bookTitle: "Sapiens: A Brief History of Humankind", reviewer: "Diana P.", rating: 4, category: "Non-Fiction", text: "Mind-expanding perspectives on human history. Dense but highly rewarding read.", date: "2023-12-28" }, { id: 105, bookId: 5, bookTitle: "Fourth Wing", reviewer: "Ethan H.", rating: 4, category: "Fantasy", text: "Action-packed and addictive! Loved the dragons and the world-building, characters could be deeper.", date: "2023-12-20" }, { id: 106, bookId: 1, bookTitle: "The Midnight Library", reviewer: "Fiona G.", rating: 4, category: "Fiction", text: "Made me reflect on my own life. A touching and thoughtful novel.", date: "2023-12-18" }, { id: 107, bookId: 7, bookTitle: "Dune", reviewer: "George K.", rating: 5, category: "Science Fiction", text: "Epic scope, intricate politics, and fascinating ecology. A classic for a reason.", date: "2023-12-15" }, { id: 108, bookId: 9, bookTitle: "Atomic Habits", reviewer: "Alice R.", rating: 5, category: "Non-Fiction", text: "Practical and actionable advice for building good habits. Highly recommended!", date: "2023-12-10" }, { id: 109, bookId: 8, bookTitle: "The Silent Patient", reviewer: "Ian M.", rating: 4, category: "Mystery", text: "Kept me hooked with its suspense and twists. A solid psychological thriller.", date: "2023-12-01" }, { id: 110, bookId: 10, bookTitle: "A Court of Thorns and Roses", reviewer: "Jade W.", rating: 3, category: "Fantasy", text: "Enjoyable romantasy, though the plot felt a bit predictable at times.", date: "2023-11-25" } ];

    // --- Theme Management ---
    const themeSelect = document.getElementById('theme-select'); const bodyElement = document.body; const THEME_STORAGE_KEY = 'litLoungeTheme_v2'; const applyTheme = (t) => { bodyElement.classList.remove('light-theme','dark-theme','reading-theme'); if(t==='dark')bodyElement.classList.add('dark-theme'); else if(t==='reading')bodyElement.classList.add('reading-theme'); else{bodyElement.classList.add('light-theme');t='light';} if(themeSelect)themeSelect.value=t; try{localStorage.setItem(THEME_STORAGE_KEY,t);}catch(e){console.error("Could not save theme:",e);} }; const loadTheme=()=>{let p='light';try{const s=localStorage.getItem(THEME_STORAGE_KEY);if(s&&['light','dark','reading'].includes(s)){p=s;}else if(window.matchMedia?.('(prefers-color-scheme: dark)').matches){p='dark';}}catch(e){console.error("Could not load theme:",e);} if(!bodyElement.classList.contains('light-theme')&&!bodyElement.classList.contains('dark-theme')&&!bodyElement.classList.contains('reading-theme')){bodyElement.classList.add('light-theme');} applyTheme(p);}; loadTheme();

    // --- Local Storage Helpers ---
    const saveToLocalStorage = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Error saving ${key}:`, e); } }; const loadFromLocalStorage = (key) => { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; } catch (e) { console.error(`Error loading ${key}:`, e); return null; } };

    // --- Cart State & Functions ---
    let cart = loadFromLocalStorage('litLoungeCart_v2') || [];
    const saveCart = () => saveToLocalStorage('litLoungeCart_v2', cart); const addToCart=(bId)=>{const b=allBooks.find(k=>k.id===bId);if(!b)return;const x=cart.find(i=>i.id===bId);if(!x){cart.push({...b,quantity:1});saveCart();updateCartDisplay();showFeedback(`${b.title} added to cart!`);}else{showFeedback(`${b.title} is already in your cart.`, 'info');}}; const removeFromCart=(bId)=>{const r=allBooks.find(k=>k.id===bId);cart=cart.filter(i=>i.id!==bId);saveCart();updateCartDisplay();showFeedback(`${r?r.title:'Item'} removed from cart.`);}; const clearCart=()=>{if(cart.length>0&&confirm('Empty cart?')){cart=[];saveCart();updateCartDisplay();showFeedback(`Cart cleared.`);}else if(cart.length===0){showFeedback('Cart is already empty.','info');}}; const calculateCartTotal = () => cart.reduce((t,i)=>t+(i.price*i.quantity),0);

    // --- Interests State & Functions ---
    let interests = loadFromLocalStorage('litLoungeInterests_v2') || [];
    const saveInterests = () => {const f=document.getElementById('interests-form'),m=document.getElementById('interests-saved-msg');if(!f||!m)return;interests=Array.from(f.querySelectorAll('input[name="interests"]:checked')).map(c=>c.value);saveToLocalStorage('litLoungeInterests_v2',interests);m.style.display='block';m.style.opacity='1';setTimeout(()=>{m.style.opacity='0';setTimeout(()=>{m.style.display='none';},500)},3000);console.log("Saved interests:", interests);}; const loadInterests=()=>{const f=document.getElementById('interests-form');if(!f)return;const s=loadFromLocalStorage('litLoungeInterests_v2')||[];f.querySelectorAll('input[name="interests"]').forEach(c=>{c.checked=s.includes(c.value);});console.log("Loaded interests:",s);};

    // --- UI Helper Functions ---
    const showFeedback=(m,t='success')=>{const p=t==='success'?'✅ Success:':t==='info'?'ℹ️ Info:':t==='error'?'❌ Error:':'';alert(`${p} ${m}`);console.log(`Feedback (${t}): ${m}`);}; const renderStars=(r)=>{const x=5;let h='';const f='<span class="star full">★</span>',e='<span class="star empty">☆</span>';for(let i=1;i<=x;i++)h+=(i<=r)?f:e;return `<span class="stars-wrapper">${h}</span>`;};

    // --- Navigation Update Logic ---
    const updateNavBasedOnLogin = () => { const l=isUserLoggedIn(),o=document.querySelectorAll('.nav-logged-out'),i=document.querySelectorAll('.nav-logged-in'),d='list-item'; o.forEach(e=>e.style.display=l?'none':d); i.forEach(e=>e.style.display=l?d:'none');};

    // --- Page Specific Initialization & Event Listeners ---
    const initializeCommon = () => { const n=document.querySelectorAll('header nav ul li a'),p=window.location.pathname.split('/').pop()||'index.html'; n.forEach(l=>{const h=l.getAttribute('href')?.split('/').pop()||'index.html',o=p==='index.html'||p==='',m=h==='index.html'||h===''; if((o&&m)||(h!=='index.html'&&h!==''&&h===p)){l.classList.add('active');}else{l.classList.remove('active');}}); if(themeSelect)themeSelect.addEventListener('change',(e)=>applyTheme(e.target.value)); updateNavBasedOnLogin(); };
    const initHomepage = () => { const f=document.getElementById('featured-books-grid'); if(!f)return; const d=()=>{f.innerHTML='';const e=allBooks.filter(b=>b.featured);if(e.length>0)displayBooks(e,f,false);else f.innerHTML='<p class="info-text">No featured books available.</p>';};d(); };
    const initStorepage = () => { const s=document.getElementById('store-books-grid'),b=document.getElementById('search-bar'),n=document.getElementById('search-btn'),f=document.getElementById('category-filter'); if(!s||!b||!n||!f)return; const l=()=>{const t=b.value.toLowerCase().trim(),c=f.value; let k=allBooks.filter(p=>(c==='All'||p.category===c)&&(t===''||p.title.toLowerCase().includes(t)||p.author.toLowerCase().includes(t))); displayBooks(k,s,true);}; const u=new URLSearchParams(window.location.search),c=u.get('category'); if(c){const o=Array.from(f.options).find(p=>p.value===c);if(o)f.value=c;} const h=u.get('search'); if(h)b.value=h; n.addEventListener('click',l); b.addEventListener('keyup',e=>{if(e.key==='Enter')l();}); f.addEventListener('change',l);l(); };

    // Google Books API Fetch
    const fetchAndUpdateCover=async(isbn,imgEl)=>{if(!GOOGLE_BOOKS_API_KEY||GOOGLE_BOOKS_API_KEY==='YOUR_API_KEY_HERE'){console.log(`API key missing, skip cover fetch ${isbn}`);imgEl.src=DEFAULT_BOOK_PLACEHOLDER;return;} const url=`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_BOOKS_API_KEY}`;try{const r=await fetch(url);if(!r.ok)throw new Error(`HTTP error! status:${r.status}`);const d=await r.json();const i=d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail||d.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail;if(i){imgEl.src=i.replace(/^http:/,'https://');}else{console.log(`No cover via API for ISBN ${isbn}`);imgEl.src=DEFAULT_BOOK_PLACEHOLDER;}}catch(e){console.error(`Error fetch cover ISBN ${isbn}:`,e);imgEl.src=DEFAULT_BOOK_PLACEHOLDER;}};

    // Create Book Card (uses fetchAndUpdateCover)
    const createBookCard=(book,isStorePage=!1,isSuggestion=!1)=>{const card=document.createElement('div'),cardClass=isSuggestion?'suggestion-item':'book-card';card.classList.add(cardClass);const initialImgUrl=book.imageUrl||DEFAULT_BOOK_PLACEHOLDER;let content=`<img src="${initialImgUrl}" alt="${book.title} Cover" loading="lazy" data-isbn="${book.isbn||''}" onerror="this.onerror=null;this.src='${DEFAULT_BOOK_PLACEHOLDER}';">`;if(isSuggestion){content+=`<h4>${book.title}</h4><p class="author">by ${book.author}</p><div class="suggestion-links"><a href="store.html?category=${encodeURIComponent(book.category)}#store-controls" class="link-category">${book.category}</a> | <a href="store.html?search=${encodeURIComponent(book.title)}#store-controls" class="link-view">View</a></div>`;}else{content+=`<div class="book-card-content"><h3>${book.title}</h3><p class="author">by ${book.author}</p>${isStorePage?`<p class="price">$${book.price.toFixed(2)}</p>`:''}</div><div class="book-card-actions">${isStorePage?`<button class="btn btn-secondary add-to-cart-btn" data-id="${book.id}">Add to Cart</button>`:''}${!isStorePage?`<a href="store.html?search=${encodeURIComponent(book.title)}#store-controls" class="btn btn-secondary btn-view">View Details</a>`:''}</div>`;} card.innerHTML=content;if(!isSuggestion){const btn=card.querySelector('.add-to-cart-btn');if(btn)btn.addEventListener('click',(e)=>{e.stopPropagation();addToCart(book.id);});} if(!book.imageUrl&&book.isbn){const img=card.querySelector('img');if(img){fetchAndUpdateCover(book.isbn,img);}} return card;};

    // Display Books Grid
    const displayBooks=(books,container,isStore=!1)=>{container.innerHTML='';if(!books||books.length===0){container.innerHTML='<p class="info-text">No books found matching criteria.</p>';return;} books.forEach(b=>container.appendChild(createBookCard(b,isStore)));};

    // Profile Page Init (with Logout)
    const initProfilePage = () => { const logoutBtn=document.getElementById('logout-btn'),clearCartBtn=document.getElementById('clear-cart-btn'),saveInterestsBtn=document.getElementById('save-interests-btn'); updateCartDisplay();loadInterests(); if(clearCartBtn)clearCartBtn.addEventListener('click',clearCart); if(saveInterestsBtn)saveInterestsBtn.addEventListener('click',saveInterests); if(logoutBtn){logoutBtn.addEventListener('click',(e)=>{e.preventDefault();if(confirm('Logout?')){setLoginState(false);window.location.href='login.html';}}); }else{console.warn("Logout button missing");}};

    // Update Cart Display
    const updateCartDisplay=()=>{const c=document.getElementById('cart-items'),t=document.getElementById('cart-total'),b=document.getElementById('clear-cart-btn');if(!c||!t)return;c.innerHTML='';if(cart.length===0){c.innerHTML='<p class="info-text">Cart is empty.</p>';t.textContent='Total: $0.00';if(b){b.disabled=!0;b.classList.add('btn-disabled');}}else{cart.forEach(i=>{const e=document.createElement('div');e.classList.add('cart-item');e.innerHTML=`<img src="${i.imageUrl||DEFAULT_BOOK_PLACEHOLDER}" alt="${i.title}" class="cart-item-image" onerror="this.onerror=null;this.src='${DEFAULT_BOOK_PLACEHOLDER}';"><div class="item-info"><strong>${i.title}</strong><span>by ${i.author}</span><span class="item-category">${i.category}</span></div><span class="item-price">$${i.price.toFixed(2)}</span><button class="remove-btn" data-id="${i.id}" title="Remove ${i.title}" aria-label="Remove ${i.title}"></button>`;e.querySelector('.remove-btn')?.addEventListener('click',()=>removeFromCart(i.id));c.appendChild(e);});t.textContent=`Total: $${calculateCartTotal().toFixed(2)}`;if(b){b.disabled=!1;b.classList.remove('btn-disabled');}}};

    // Login Page Init
    const initLoginPage=()=>{if(isUserLoggedIn()){window.location.href='profile.html';return;}const f=document.getElementById('login-form'),m=document.getElementById('login-message');if(!f)return;f.addEventListener('submit',(e)=>{e.preventDefault();const i=document.getElementById('email')?.value.trim(),p=document.getElementById('password')?.value;if(m)m.style.display='none';if(i&&p){showFeedback(`Welcome back! (Simulated Login for ${i})`);setLoginState(true);window.location.href='profile.html';}else{if(m){let s=!i&&!p?'Enter email/user & pw.':!i?'Enter email or user.':'Enter pw.';m.textContent=s;m.classList.add('error-message');m.style.display='block';}else{showFeedback('Fill all login fields.','error');}}});};

    // Reviews Page Init
    const initReviewsPage = () => { const c=document.getElementById('review-items-container'),b=document.getElementById('review-search-bar'),t=document.getElementById('review-search-btn'),g=document.getElementById('review-category-filter'),r=document.getElementById('review-rating-filter');if(!c||!b||!t||!g||!r)return; const f=()=>{const s=b.value.toLowerCase().trim(),e=g.value,a=parseInt(r.value,10)||0; let l=sampleReviews.filter(v=>(e==='All'||v.category===e)&&(v.rating>=a)&&(s===''||v.bookTitle.toLowerCase().includes(s)||v.reviewer.toLowerCase().includes(s)||v.text.toLowerCase().includes(s))); displayReviews(l,c);}; t.addEventListener('click',f); b.addEventListener('keyup',e=>{if(e.key==='Enter')f();}); g.addEventListener('change',f); r.addEventListener('change',f); f(); };

    // Display Reviews Helper
    const displayReviews=(reviews,container)=>{container.innerHTML='';if(!reviews||reviews.length===0){container.innerHTML='<p class="info-text">No reviews found.</p>';return;} reviews.forEach(r=>{const c=document.createElement('div');c.classList.add('review-card');const b=allBooks.find(k=>k.id===r.bookId||k.title===r.bookTitle);const u=b?.imageUrl||DEFAULT_BOOK_PLACEHOLDER;c.innerHTML=`<div class="review-card-header"><img src="${u}" alt="${r.bookTitle}" class="review-book-image" onerror="this.onerror=null;this.src='${DEFAULT_BOOK_PLACEHOLDER}';"><div class="review-card-title"><h3>${r.bookTitle}</h3><span class="review-category">${r.category}</span></div></div><div class="review-meta"><span class="review-author">By: ${r.reviewer}</span><span class="review-rating">Rating: ${renderStars(r.rating)}</span> ${r.date?`<span class="review-date">Reviewed: ${new Date(r.date).toLocaleDateString()}</span>`:''}</div><p class="review-text">${r.text}</p>`;container.appendChild(c);});};

    // Subscription Page Init
    const initSubscriptionPage = () => { const b=document.querySelectorAll('.subscribe-btn');b.forEach(t=>t.addEventListener('click',(e)=>{e.preventDefault();const p=t.getAttribute('data-plan');showFeedback(`Selected ${p} plan! (Simulation)`);}));};

    // Signup Page Init
    const initSignupPage = () => { const f=document.getElementById('signup-form'),m=document.getElementById('signup-message'),p=document.getElementById('signup-password'),c=document.getElementById('confirm-password'); if(!f||!m||!p||!c)return console.warn("Signup form elements missing."); f.addEventListener('submit',(e)=>{e.preventDefault(); m.style.display='none';m.classList.remove('success-message','error-message'); const fn=document.getElementById('fullname')?.value.trim(),u=document.getElementById('signup-username')?.value.trim(),em=document.getElementById('signup-email')?.value.trim(),pw=p.value,cp=c.value; if(!fn||!u||!em||!pw||!cp){m.textContent='Fill all fields.';m.classList.add('error-message');m.style.display='block';return;} if(pw.length<8){m.textContent='Password min 8 chars.';m.classList.add('error-message');m.style.display='block';p.focus();return;} if(pw!==cp){m.textContent='Passwords do not match.';m.classList.add('error-message');m.style.display='block';c.focus();c.value='';p.value='';return;} console.log('Simulating signup:',{fn,u,em}); m.textContent='Account created! Redirecting...'; m.classList.add('success-message');m.style.display='block'; setTimeout(()=>{window.location.href='login.html';},2000); }); };

    // --- Main Execution Logic ---
    initializeCommon();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    switch (currentPage) {
        case '': case 'index.html': initHomepage(); break;
        case 'store.html': initStorepage(); break;
        case 'profile.html': initProfilePage(); break;
        case 'login.html': initLoginPage(); break;
        case 'signup.html': initSignupPage(); break;
        case 'reviews.html': initReviewsPage(); break;
        case 'subscription.html': initSubscriptionPage(); break;
        default: console.log(`No specific init for: ${currentPage}`);
    }

    // --- Suggestion Modal Logic ---
    const suggestionButton = document.getElementById('suggestion-button'); const suggestionModal = document.getElementById('suggestion-modal'); const modalOverlay = document.getElementById('modal-overlay'); const closeModalBtn = document.getElementById('close-modal-btn'); const suggestionResultsContainer = document.getElementById('suggestion-results');
    const toggleSuggestionModal = (show) => { if (!suggestionModal || !modalOverlay || !closeModalBtn) return; if (show) { suggestionModal.classList.add('modal-active'); document.body.style.overflow = 'hidden'; closeModalBtn.focus(); } else { suggestionModal.classList.remove('modal-active'); document.body.style.overflow = ''; if(suggestionButton) suggestionButton.focus(); } }; const getSuggestions = (count = 4) => { if (!allBooks || allBooks.length === 0) return []; const cartIds=cart.map(i=>i.id); const avail=allBooks.filter(b=>!cartIds.includes(b.id)); const intr=loadFromLocalStorage('litLoungeInterests_v2')||[]; if(intr.length>0){let p=[],o=[];avail.forEach(b=>{intr.includes(b.category)?p.push(b):o.push(b);});p.sort(()=>0.5-Math.random());o.sort(()=>0.5-Math.random());const c=[...p,...o];return c.slice(0,Math.min(count,c.length));}else{const s=avail.sort(()=>0.5-Math.random());return s.slice(0,Math.min(count,s.length));} }; const displaySuggestions = (suggestions) => { if (!suggestionResultsContainer) return; suggestionResultsContainer.innerHTML = ''; suggestionResultsContainer.classList.remove('suggestion-results-grid'); if (!suggestions || suggestions.length === 0) { suggestionResultsContainer.innerHTML = '<p class="info-text">No suggestions available. Try setting interests!</p>'; return; } suggestionResultsContainer.classList.add('suggestion-results-grid'); suggestions.forEach(book => suggestionResultsContainer.appendChild(createBookCard(book, false, true))); };
    if (suggestionButton) suggestionButton.addEventListener('click', () => { if (!suggestionResultsContainer) return; suggestionResultsContainer.innerHTML = '<p class="info-text">Loading suggestions...</p>'; suggestionResultsContainer.classList.remove('suggestion-results-grid'); toggleSuggestionModal(true); setTimeout(() => { displaySuggestions(getSuggestions(4)); }, 250); });
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleSuggestionModal(false));
    if (modalOverlay) modalOverlay.addEventListener('click', () => toggleSuggestionModal(false));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && suggestionModal?.classList.contains('modal-active')) toggleSuggestionModal(false); });

}); // End DOMContentLoaded