import './engagement.css';
import { challenge } from './turnstile';

type Comment = {
  id: string;
  author: string;
  body: string;
  created_at: string;
  pending?: boolean;
};
type Draft = {
  id: string;
  token: string;
  author: string;
  body: string;
  sent?: boolean;
};
type Saved = {
  voterToken: string;
  likes: number;
  tokens: Record<string, string>;
  draft?: Draft;
};
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('');
const node = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = ''
) => {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
};
async function api(url: string, method = 'GET', data?: unknown) {
  const response = await fetch(url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = new Error(`Request failed (${response.status})`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return response.json();
}

export function init(container: HTMLElement) {
  const slug = container.dataset.engagement || '';
  const url = `/api/discussion/${encodeURIComponent(slug)}`;
  const key = `blog-discussion:v1:${slug}`;
  const draftKey = `blog-comment-draft:v1:${slug}`;
  const tokenKey = (id: string) => `blog-comment-token:v1:${slug}:${id}`;
  const attemptsKey = 'blog-comment-attempts:v1';
  let saved: Saved = { voterToken: '', likes: 0, tokens: {} };
  let storageAvailable = false;
  try {
    const probe = `${key}:probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (
        typeof parsed.voterToken === 'string' &&
        Number.isInteger(parsed.likes) &&
        parsed.likes >= 0 &&
        parsed.likes <= 10 &&
        parsed.tokens &&
        typeof parsed.tokens === 'object'
      )
        saved = parsed;
    }
    const legacyDraft = saved.draft;
    if (legacyDraft && !localStorage.getItem(draftKey))
      localStorage.setItem(
        draftKey,
        JSON.stringify({ ...legacyDraft, sent: true })
      );
    for (const [id, value] of Object.entries(saved.tokens)) {
      if (!localStorage.getItem(tokenKey(id)))
        localStorage.setItem(tokenKey(id), value);
    }
    delete saved.draft;
    if (legacyDraft) localStorage.setItem(key, JSON.stringify(saved));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  function save(): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(saved));
      return true;
    } catch {
      storageAvailable = false;
      render();
      return false;
    }
  }
  let comments: Comment[] = [];
  let totalLikes = 0;
  let loaded = false;
  let siteKey: string | null = null;
  let posting = false;
  let inflight = false;
  let scheduled: ReturnType<typeof setTimeout> | undefined;
  let lastSynced = saved.likes;
  let likeError = false;
  function readDraft(): Draft | undefined {
    const raw = localStorage.getItem(draftKey);
    return raw ? (JSON.parse(raw) as Draft) : undefined;
  }
  function ownedToken(id: string): string | null {
    return localStorage.getItem(tokenKey(id)) ?? saved.tokens[id] ?? null;
  }
  function attempts(): Array<{ id: string; at: number }> {
    const value: unknown = JSON.parse(
      localStorage.getItem(attemptsKey) || '[]'
    );
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is { id: string; at: number } =>
        item &&
        typeof item.id === 'string' &&
        typeof item.at === 'number' &&
        item.at > Date.now() - 60_000 &&
        item.at <= Date.now()
    );
  }

  container.replaceChildren();
  const top = node('div', 'engagement-heading');
  const heading = node('h2', '', 'Discussion');
  const actions = node('div', 'engagement-actions');
  const like = node('button', 'engagement-like');
  like.type = 'button';
  const heart = node('span', 'engagement-heart', '♥');
  heart.setAttribute('aria-hidden', 'true');
  const count = node('span', 'engagement-like-count');
  like.append(heart, count);
  const reset = node('button', 'engagement-reset', '×');
  reset.type = 'button';
  reset.setAttribute('aria-label', 'Reset your likes for this article');
  actions.append(reset, like);
  top.append(heading, actions);
  const list = node('div', 'engagement-comments');
  const form = node('form', 'engagement-form');
  const title = node('h3', '', 'Leave a comment');
  const nameLabel = node('label', '', 'Name (optional)');
  const name = node('input');
  name.name = 'name';
  name.autocomplete = 'name';
  name.maxLength = 80;
  name.placeholder = 'Guest';
  nameLabel.append(name);
  const messageLabel = node('label', '', 'Comment');
  const message = node('textarea');
  message.name = 'comment';
  message.required = true;
  message.maxLength = 1000;
  message.rows = 4;
  message.placeholder = 'Share a thought…';
  messageLabel.append(message);
  const widget = node('div', 'engagement-turnstile');
  const submit = node('button', 'engagement-submit', 'Post comment');
  submit.type = 'submit';
  form.append(title, nameLabel, messageLabel, widget, submit);
  const status = node('p', 'engagement-status');
  status.setAttribute('role', 'status');
  const retry = node('button', 'engagement-retry', 'Retry');
  retry.type = 'button';
  retry.hidden = true;
  container.append(top, list, form, status, retry);
  function setStatus(text: string, error = false) {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }
  function render() {
    form.hidden = !storageAvailable || !loaded || !siteKey;
    submit.disabled = posting;
    like.disabled = !storageAvailable || !loaded || saved.likes >= 10;
    reset.hidden = !storageAvailable || !loaded || saved.likes === 0;
    count.textContent = loaded
      ? String(Math.max(0, totalLikes + saved.likes - lastSynced))
      : '–';
    const scale = 1 + saved.likes * 0.035;
    for (const [prop, value] of Object.entries({
      '--heart-scale': scale,
      '--heart-pop': scale * 1.35,
      '--heart-dip': scale * 0.91,
      '--heart-settle': scale * 1.08,
    }))
      heart.style.setProperty(prop, String(value));
    like.classList.toggle('has-likes', saved.likes > 0);
    like.setAttribute(
      'aria-label',
      !storageAvailable
        ? 'Enable browser storage to like this article'
        : saved.likes >= 10
          ? 'You have given the maximum of 10 likes'
          : `Like this article, ${saved.likes} of 10 given`
    );
    list.replaceChildren();
    if (loaded && !comments.length)
      list.append(
        node(
          'p',
          'engagement-empty',
          'No comments yet. Be the first to share a thought.'
        )
      );
    for (const comment of comments) {
      const item = node('article', 'engagement-comment');
      const meta = node('div', 'engagement-comment-meta');
      const author = node('strong', '', comment.author);
      const date = node(
        'time',
        '',
        new Date(comment.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      date.dateTime = comment.created_at;
      meta.append(author, date);
      if (comment.pending)
        meta.append(node('span', 'engagement-pending', 'Posting…'));
      else if (storageAvailable && ownedToken(comment.id)) {
        const remove = node('button', 'engagement-delete', 'Delete');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Delete your comment');
        remove.addEventListener('click', async () => {
          const index = comments.findIndex((item) => item.id === comment.id);
          comments = comments.filter((item) => item.id !== comment.id);
          render();
          try {
            await api(url, 'DELETE', {
              id: comment.id,
              token: ownedToken(comment.id),
            });
            localStorage.removeItem(tokenKey(comment.id));
            delete saved.tokens[comment.id];
            if (save()) setStatus('Comment deleted.');
          } catch {
            comments.splice(Math.min(index, comments.length), 0, comment);
            render();
            setStatus('Could not delete the comment. Please try again.', true);
          }
        });
        const separator = node('span', 'engagement-separator', '·');
        separator.setAttribute('aria-hidden', 'true');
        meta.append(separator, remove);
      }
      item.append(meta, node('p', '', comment.body));
      list.append(item);
    }
    if (!storageAvailable)
      setStatus('Enable browser storage to like or comment.', true);
    else if (loaded && !siteKey)
      setStatus('Comment verification is temporarily unavailable.', true);
  }
  function scheduleLikes(delay = 600) {
    clearTimeout(scheduled);
    scheduled = setTimeout(syncLikes, delay);
  }
  async function syncLikes() {
    if (inflight || !storageAvailable || !loaded || !saved.voterToken) return;
    const sent = saved.likes;
    inflight = true;
    try {
      const result = await api(url, 'PUT', {
        token: saved.voterToken,
        count: sent,
      });
      totalLikes = result.likes;
      lastSynced = sent;
      likeError = false;
      retry.hidden = true;
      setStatus('');
    } catch {
      likeError = true;
      retry.hidden = false;
      setStatus('Could not save your likes. Retry to sync them.', true);
    } finally {
      inflight = false;
      render();
      if (!likeError && saved.likes !== sent) scheduleLikes();
    }
  }
  function changeLikes(next: number) {
    if (!storageAvailable || !loaded) return;
    const before = { ...saved };
    if (!saved.voterToken) saved.voterToken = token();
    saved.likes = next;
    render();
    if (!save()) {
      saved = before;
      render();
      return;
    }
    scheduleLikes();
  }
  like.addEventListener('click', () => {
    if (saved.likes >= 10) return;
    changeLikes(saved.likes + 1);
    heart.classList.remove('is-bouncing');
    void heart.offsetWidth;
    heart.classList.add('is-bouncing');
  });
  reset.addEventListener('click', () => {
    changeLikes(0);
    like.focus();
  });
  retry.addEventListener('click', () => {
    if (likeError) {
      retry.hidden = true;
      scheduleLikes(0);
    } else load();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!storageAvailable || posting || !loaded || !siteKey) return;
    const content = message.value.trim();
    if (!content) {
      message.setCustomValidity('Write a comment first.');
      message.reportValidity();
      return;
    }
    const author = name.value.trim() || 'Guest';
    posting = true;
    render();
    try {
      const pending = readDraft();
      if (pending && (pending.body !== content || pending.author !== author)) {
        setStatus(
          'Your previous comment is unconfirmed. Restore and retry it before posting a different one.',
          true
        );
        name.value = pending.author === 'Guest' ? '' : pending.author;
        message.value = pending.body;
        return;
      }
      const draft = pending ?? {
        id: crypto.randomUUID(),
        token: token(),
        author,
        body: content,
      };
      const recent = attempts();
      const previouslySent = recent.some((item) => item.id === draft.id);
      const wasSent = !!pending?.sent;
      if (!wasSent && !previouslySent && recent.length >= 2) {
        setStatus(
          'You can post two comments per minute. Please try again shortly.',
          true
        );
        return;
      }
      localStorage.setItem(tokenKey(draft.id), draft.token);
      localStorage.setItem(draftKey, JSON.stringify(draft));
      const optimistic: Comment = {
        id: draft.id,
        author,
        body: content,
        created_at: new Date().toISOString(),
        pending: true,
      };
      comments = [
        ...comments.filter((comment) => comment.id !== draft.id),
        optimistic,
      ];
      message.value = '';
      render();
      setStatus('');
      let sent = false;
      try {
        const proof = await challenge(widget, siteKey!);
        const latest = attempts();
        if (!wasSent && !latest.some((item) => item.id === draft.id))
          localStorage.setItem(
            attemptsKey,
            JSON.stringify([...latest, { id: draft.id, at: Date.now() }])
          );
        localStorage.setItem(
          draftKey,
          JSON.stringify({ ...draft, sent: true })
        );
        sent = true;
        const result = await api(url, 'POST', { ...draft, challenge: proof });
        comments = comments.map((comment) =>
          comment.id === draft.id ? result.comment : comment
        );
        if (readDraft()?.id === draft.id) localStorage.removeItem(draftKey);
        setStatus('Comment posted.');
      } catch (error) {
        comments = comments.filter((comment) => comment.id !== draft.id);
        message.value = content;
        if (
          error instanceof DOMException &&
          ['QuotaExceededError', 'SecurityError'].includes(error.name)
        )
          storageAvailable = false;
        const rejected =
          error instanceof Error && 'status' in error && error.status === 403;
        if ((!sent || rejected) && !wasSent) {
          try {
            if (readDraft()?.id === draft.id) localStorage.removeItem(draftKey);
            localStorage.removeItem(tokenKey(draft.id));
          } catch {
            storageAvailable = false;
          }
        }
        if (rejected && !wasSent) {
          try {
            localStorage.setItem(
              attemptsKey,
              JSON.stringify(attempts().filter((item) => item.id !== draft.id))
            );
          } catch {
            storageAvailable = false;
          }
        }
        setStatus(
          error instanceof Error &&
            (error.message.startsWith('Verification') ||
              ('status' in error && error.status === 403))
            ? 'Verification failed. Please try again.'
            : 'Could not confirm your comment. Retry to avoid posting it twice.',
          true
        );
      }
    } catch (error) {
      storageAvailable = false;
      setStatus('Enable browser storage to like or comment.', true);
    } finally {
      posting = false;
      render();
    }
  });
  message.addEventListener('input', () => message.setCustomValidity(''));
  async function load() {
    retry.hidden = true;
    try {
      const result = await api(url);
      comments = result.comments;
      totalLikes = result.likes;
      siteKey =
        typeof result.turnstileSiteKey === 'string'
          ? result.turnstileSiteKey
          : null;
      loaded = true;
      const pending = storageAvailable ? readDraft() : undefined;
      if (pending && comments.some((comment) => comment.id === pending.id)) {
        if (readDraft()?.id === pending.id) localStorage.removeItem(draftKey);
      } else if (pending) {
        name.value = pending.author === 'Guest' ? '' : pending.author;
        message.value = pending.body;
        setStatus(
          'Your last comment could not be confirmed. Retry to avoid posting it twice.',
          true
        );
      } else setStatus('');
      render();
      // Reconcile the locally saved desired count even if an earlier response was lost.
      if (storageAvailable && saved.voterToken) scheduleLikes(0);
    } catch {
      loaded = false;
      render();
      if (storageAvailable) {
        setStatus('Discussion could not be loaded.', true);
        retry.hidden = false;
      }
    }
  }
  setStatus('Loading discussion…');
  render();
  void load();
}
