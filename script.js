let friendsData = [];
const loadBtn = document.getElementById('loadBtn');
const searchInput = document.getElementById('searchInput');
const cardsContainer = document.getElementById('cards');
const statusSpan = document.getElementById('status');
loadBtn.addEventListener('click', loadFriends);
searchInput.addEventListener('input', handleFilter);
function loadFriends() {
  if (friendsData.length) {
    statusSpan.textContent = 'Already loaded. You can filter below!';
    return;
  }

  statusSpan.textContent = 'Loading...';
  cardsContainer.setAttribute('aria-busy', 'true');
  loadBtn.disabled = true;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'friends.json', true);

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        friendsData = JSON.parse(xhr.responseText);
        renderCards(friendsData);
        statusSpan.textContent = `Loaded ${friendsData.length} friends.`;
        searchInput.disabled = false;
        searchInput.focus();
      } catch (e) {
        console.error('JSON parse error:', e);
        statusSpan.textContent = 'Error: Invalid JSON format.';
        loadBtn.disabled = false;
      }
    } else {
      statusSpan.textContent = `Error: HTTP ${xhr.status}`;
      loadBtn.disabled = false;
    }
    cardsContainer.setAttribute('aria-busy', 'false');
  };

  xhr.onerror = function () {
    statusSpan.textContent = 'Network error while loading JSON.';
    cardsContainer.setAttribute('aria-busy', 'false');
    loadBtn.disabled = false;
  };

  xhr.send();
}

function handleFilter() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    renderCards(friendsData);
    statusSpan.textContent = `Showing all ${friendsData.length} friends.`;
    return;
  }
  const filtered = friendsData.filter(person => {
    return [
      person.name,
      person.relationship,
      ...(person.hobbies || []),
      ...(person.skills || []),
      person.location || ''
    ].some(field => field.toLowerCase().includes(term));
  });
  renderCards(filtered);
  statusSpan.textContent = filtered.length ? `Matched ${filtered.length} friend(s).` : 'No matches.';
}

function renderCards(list) {
  cardsContainer.innerHTML = '';
  if (!list.length) {
    cardsContainer.innerHTML = '<p>No friends to display.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach(person => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm friend-card';

    const header = document.createElement('div');
    header.className = 'card-header bg-primary-subtle fw-semibold';
    header.textContent = person.name;
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const rel = document.createElement('p');
    rel.className = 'text-secondary mb-2';
    rel.innerHTML = `<strong>Relationship:</strong> ${escapeHTML(person.relationship)}`;
    body.appendChild(rel);

    if (Array.isArray(person.hobbies)) {
      const hobbiesWrap = document.createElement('div');
      hobbiesWrap.className = 'mb-2';
      const label = document.createElement('strong');
      label.textContent = 'Hobbies:';
      hobbiesWrap.appendChild(label);
      const badgeContainer = document.createElement('div');
      badgeContainer.className = 'mt-1 d-flex flex-wrap gap-1';
      person.hobbies.forEach(hobby => {
        const span = document.createElement('span');
        span.className = 'badge text-bg-info-subtle border border-info-subtle';
        span.textContent = hobby;
        badgeContainer.appendChild(span);
      });
      hobbiesWrap.appendChild(badgeContainer);
      body.appendChild(hobbiesWrap);
    }

    if (Array.isArray(person.skills)) {
      const skillsWrap = document.createElement('p');
      skillsWrap.className = 'small mb-2';
      skillsWrap.innerHTML = `<strong>Skills:</strong> ${person.skills.map(s => escapeHTML(s)).join(', ')}`;
      body.appendChild(skillsWrap);
    }

    if (person.location) {
      const loc = document.createElement('p');
      loc.className = 'small text-body-secondary mb-2';
      loc.innerHTML = `<strong>Location:</strong> ${escapeHTML(person.location)}`;
      body.appendChild(loc);
    }

    if (person.contact && typeof person.contact === 'object') {
      const contactDiv = document.createElement('div');
      contactDiv.className = 'mt-auto pt-2 border-top small';
      const email = person.contact.email ? `<div>Email: <a href="mailto:${escapeAttr(person.contact.email)}">${escapeHTML(person.contact.email)}</a></div>` : '';
      const insta = person.contact.instagram ? `<div>IG: <a href="https://instagram.com/${escapeAttr(person.contact.instagram.replace('@',''))}" target="_blank" rel="noopener">${escapeHTML(person.contact.instagram)}</a></div>` : '';
      contactDiv.innerHTML = `<strong>Contact</strong>${email}${insta}`;
      body.appendChild(contactDiv);
    }

    card.appendChild(body);
    col.appendChild(card);
    fragment.appendChild(col);
  });

  cardsContainer.appendChild(fragment);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escapeAttr(str) {
  return escapeHTML(str).replace(/`/g, '&#096;');
}
