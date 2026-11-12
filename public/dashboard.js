
// Commonly dashboard.js
// Frontend behavior for the HTML you supplied.

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const API = {
    posts: "/api/posts",
    profile: "/api/profile"
  };

  const STORAGE = {
    posts: "commonly_dashboard_posts",
    profile: "commonly_dashboard_profile"
  };

  const state = {
    posts: [],
    profile: {
      name: "Community member",
      username: "community",
      bio: "",
      location: "",
      contactPreference: "none"
    },
    mode: "offer",
    editingPostId: null,
    currentView: "home",
    type: "all",
    category: "all",
    search: "",
    page: 1,
    pageSize: 8,
    loading: false,
    apiAvailable: false,
    membership: null,
    paypalConfig: null
  };

  let toastTimer;

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function initials(name) {
    const words = String(name || "U").trim().split(/\s+/).filter(Boolean);

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";
  }

  function createId() {
    return "post_" + Date.now() + "_" +
      Math.random().toString(36).slice(2, 9);
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function normalizeType(value) {
    const type = String(value || "").toLowerCase();

    return type === "request" ? "request" : "offer";
  }

  function normalizePost(post) {
    return {
      id: String(post.id ?? post.post_id ?? post.postId ?? createId()),
      type: normalizeType(post.type ?? post.post_type),
      title: String(post.title ?? ""),
      description: String(post.description ?? ""),
      category: String(post.category ?? "Other"),
      location: String(post.location ?? ""),
      imageUrl: String(
        post.imageUrl ?? post.image_url ?? ""
      ),
      availableUntil: post.availableUntil ??
        post.available_until ??
        post.expires_at ??
        "",
      createdAt: post.createdAt ??
        post.created_at ??
        new Date().toISOString(),
      userId: String(
        post.userId ?? post.user_id ?? post.ownerId ?? ""
      ),
      username: String(
        post.username ?? post.ownerUsername ?? "community"
      ),
      authorName: String(
        post.authorName ?? post.ownerName ?? "Community member"
      ),
      thanks: Number(post.thanks ?? 0)
    };
  }

  function normalizeProfile(profile) {
    return {
      name: String(profile.name ?? profile.fullName ?? "Community member"),
      username: String(profile.username ?? "community").replace(/^@/, ""),
      bio: String(profile.bio ?? ""),
      location: String(profile.location ?? ""),
      contactPreference: String(
        profile.contactPreference ??
        profile.contact_preference ??
        "none"
      )
    };
  }

  function showToast(message) {
    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function saveLocalPosts() {
    try {
      localStorage.setItem(
        STORAGE.posts,
        JSON.stringify(state.posts)
      );
    } catch (error) {
      console.warn("Could not save posts locally.", error);
    }
  }

  function saveLocalProfile() {
    try {
      localStorage.setItem(
        STORAGE.profile,
        JSON.stringify(state.profile)
      );
    } catch (error) {
      console.warn("Could not save profile locally.", error);
    }
  }

  function readLocalPosts() {
    try {
      const saved = localStorage.getItem(STORAGE.posts);

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed.map(normalizePost)
        : [];
    } catch {
      return [];
    }
  }

  function readLocalProfile() {
    try {
      const saved = localStorage.getItem(STORAGE.profile);

      return saved
        ? normalizeProfile(JSON.parse(saved))
        : normalizeProfile({});
    } catch {
      return normalizeProfile({});
    }
  }

  // --------------------------------------------------
  // API
  // --------------------------------------------------

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? {
          "Content-Type": "application/json"
        } : {}),
        ...(options.headers || {})
      }
    });

    const text = await response.text();

    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed (${response.status})`;

      const error = new Error(message);
      error.status = response.status;
      error.code = data?.code || null;
      throw error;
    }

    return data;
  }

  function extractPosts(data) {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.posts)) return data.posts;

    if (Array.isArray(data?.data)) return data.data;

    return [];
  }

  async function loadPosts() {
    try {
      const data = await apiRequest(API.posts);

      state.posts = extractPosts(data).map(normalizePost);
      state.apiAvailable = true;

      saveLocalPosts();
    } catch (error) {
      console.warn("Posts API unavailable:", error);

      state.posts = readLocalPosts();
      state.apiAvailable = false;
    }

    renderDashboard();
  }

  async function loadProfile() {
    try {
      const data = await apiRequest(API.profile);

      const profile = data?.profile ?? data?.user ?? data;

      if (profile && typeof profile === "object") {
        state.profile = normalizeProfile(profile);
        state.apiAvailable = true;

        saveLocalProfile();
      }
    } catch (error) {
      console.warn("Profile API unavailable:", error);

      state.profile = readLocalProfile();
    }

    renderProfile();
  }

  async function createPostAPI(post) {
    return apiRequest(API.posts, {
      method: "POST",
      body: JSON.stringify(post)
    });
  }

  async function updatePostAPI(id, post) {
    return apiRequest(
      `${API.posts}/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(post)
      }
    );
  }

  async function deletePostAPI(id) {
    return apiRequest(
      `${API.posts}/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }

  async function saveProfileAPI(profile) {
    return apiRequest(API.profile, {
      method: "PUT",
      body: JSON.stringify(profile)
    });
  }

  async function loadMembership() {
    try {
      const data = await apiRequest("/api/membership");
      state.membership = data?.membership || null;
      renderMembership();
    } catch (error) {
      console.warn("Membership API unavailable:", error);
      state.membership = null;
      renderMembership();
    }
  }

  function renderMembership() {
    const membership = state.membership;
    const status = $("planStatus");
    const usage = $("planUsage");
    const button = $("openPlus");

    if (!status || !usage || !button) return;

    if (!membership) {
      status.textContent = "Your Commonly plan";
      usage.textContent = "Connect to your account to load membership details.";
      button.textContent = "View plans →";
      return;
    }

    if (membership.isPlus) {
      status.textContent = "Commonly Plus · Active";
      usage.textContent = membership.expiresAt
        ? `Unlimited offers, unlimited requests and GoodOne AI · Access until ${formatDate(membership.expiresAt)}`
        : "Unlimited offers, unlimited requests and GoodOne AI.";
      button.textContent = "Manage Plus →";
    } else {
      const offers = membership.limits?.offers?.used || 0;
      const requests = membership.limits?.requests?.used || 0;
      status.textContent = "Free plan · 1 offer + 1 request per day";
      usage.textContent = `Today: ${offers}/1 offers · ${requests}/1 requests. Plus unlocks unlimited posting and GoodOne AI.`;
      button.textContent = "Explore Plus →";
    }
  }

  let paypalSdkPromise = null;

  async function loadPayPalSdk(clientId, currency) {
    if (window.paypal?.Buttons) return;
    if (paypalSdkPromise) return paypalSdkPromise;

    paypalSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=" +
        encodeURIComponent(clientId) +
        "&currency=" + encodeURIComponent(currency) +
        "&intent=capture&components=buttons";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("PayPal checkout could not be loaded."));
      document.head.appendChild(script);
    });

    try {
      await paypalSdkPromise;
    } catch (error) {
      paypalSdkPromise = null;
      throw error;
    }
  }

  async function openPlusModal() {
    $("plusModal").classList.remove("hidden");
    $("paypalStatus").textContent = "Preparing secure PayPal checkout…";
    $("paypalButtonContainer").innerHTML = "";

    try {
      const config = await apiRequest("/api/paypal/config");
      state.paypalConfig = config;

      $("plusPrice").textContent = `${config.currency} ${Number(config.price).toFixed(2)}`;
      if (state.membership?.isPlus && state.membership.expiresAt) {
        $("plusExpiryNote").textContent =
          `Your current access ends ${formatDate(state.membership.expiresAt)}. A successful purchase adds another 30 days.`;
      }

      if (!config.configured || !config.clientId) {
        $("paypalStatus").textContent =
          "Checkout is not configured yet. Add your PayPal Sandbox credentials and set the Plus price in the server environment.";
        return;
      }

      await loadPayPalSdk(config.clientId, config.currency);
      if (!window.paypal?.Buttons) throw new Error("PayPal checkout did not initialize.");

      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 44 },
        createOrder: async () => {
          const order = await apiRequest("/api/paypal/create-order", {
            method: "POST",
            body: JSON.stringify({})
          });
          return order.orderID;
        },
        onApprove: async (data) => {
          $("paypalStatus").textContent = "Confirming your payment with PayPal…";
          const result = await apiRequest("/api/paypal/capture-order", {
            method: "POST",
            body: JSON.stringify({ orderID: data.orderID })
          });
          state.membership = result.membership || state.membership;
          renderMembership();
          $("paypalStatus").textContent = "Payment confirmed. Commonly Plus is active for 30 days.";
          $("plusExpiryNote").textContent = "Thank you for supporting Commonly.";
          showToast("Commonly Plus activated.");
        },
        onCancel: () => {
          $("paypalStatus").textContent = "Checkout cancelled. No membership change was made.";
        },
        onError: (error) => {
          console.error("PayPal checkout:", error);
          $("paypalStatus").textContent = "PayPal could not complete checkout. Please try again.";
        }
      }).render("#paypalButtonContainer");

      $("paypalStatus").textContent = "Secure one-time payment powered by PayPal.";
    } catch (error) {
      console.error("Could not initialize PayPal:", error);
      $("paypalStatus").textContent = error.message || "Unable to load checkout.";
    }
  }

  async function generatePostWithAI() {
    if (!state.membership?.isPlus) {
      openPlusModal();
      return;
    }

    const prompt = $("aiPrompt").value.trim();
    if (prompt.length < 8) {
      showToast("Describe your offer or request in a little more detail first.");
      $("aiPrompt").focus();
      return;
    }

    const button = $("generateWithAI");
    button.disabled = true;
    button.textContent = "Generating…";

    try {
      const result = await apiRequest("/api/ai/generate-post", {
        method: "POST",
        body: JSON.stringify({ prompt, type: state.mode })
      });
      const draft = result?.draft;
      if (!draft) throw new Error("The AI did not return a draft.");

      $("postTitle").value = draft.title || "";
      $("postDescription").value = draft.description || "";
      $("postCategory").value = draft.category || "Other";
      $("postLocation").value = draft.location || "";
      $("postImage").value = draft.imageUrl || "";

      if (draft.availableUntil) {
        const date = new Date(draft.availableUntil);
        if (!Number.isNaN(date.getTime())) {
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
          $("availableUntil").value = local.toISOString().slice(0, 16);
        }
      }

      showToast("Draft generated. Review and edit it before publishing.");
      $("postTitle").focus();
    } catch (error) {
      showToast(error.message || "Could not generate a draft.");
      if (error.status === 403) {
        state.membership = null;
        await loadMembership();
      }
    } finally {
      button.disabled = false;
      button.innerHTML = "<span>✦</span> Generate draft";
    }
  }

  // --------------------------------------------------
  // Profile
  // --------------------------------------------------

  function renderProfile() {
    const profile = state.profile;
    const initialsText = initials(profile.name);
    const username = "@" + profile.username;

    const values = {
      sidebarName: profile.name,
      sidebarUsername: username,
      topName: profile.name,
      profileDisplayName: profile.name,
      profileDisplayUsername: username
    };

    Object.entries(values).forEach(([id, value]) => {
      const element = $(id);

      if (element) element.textContent = value;
    });

    [
      "avatarInitials",
      "topInitials",
      "profileInitials"
    ].forEach((id) => {
      const element = $(id);

      if (element) element.textContent = initialsText;
    });
  }

  function openProfile() {
    const profile = state.profile;

    $("profileName").value = profile.name;
    $("profileUsername").value = profile.username;
    $("profileBio").value = profile.bio;
    $("profileLocation").value = profile.location;
    $("profileContact").value = profile.contactPreference;

    renderProfile();

    $("profileModal").classList.remove("hidden");

    $("profileName").focus();
  }

  function closeProfile() {
    $("profileModal").classList.add("hidden");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    const form = $("profileForm");

    if (!form.reportValidity()) return;

    const username = $("profileUsername").value.trim();

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      showToast("Username can contain letters, numbers, and underscores.");
      return;
    }

    const profile = normalizeProfile({
      name: $("profileName").value.trim(),
      username,
      bio: $("profileBio").value.trim(),
      location: $("profileLocation").value.trim(),
      contactPreference: $("profileContact").value
    });

    const button = $("saveProfile");

    button.disabled = true;

    try {
      await saveProfileAPI(profile);

      state.profile = profile;

      saveLocalProfile();
      renderProfile();
      closeProfile();

      showToast("Profile saved.");
    } catch (error) {
      // Keep the profile available locally when the API is not configured.
      state.profile = profile;

      saveLocalProfile();
      renderProfile();
      closeProfile();

      showToast("Profile saved on this device. " + error.message);
    } finally {
      button.disabled = false;
    }
  }

  // --------------------------------------------------
  // Create / edit posts
  // --------------------------------------------------

  function setPostMode(mode) {
    state.mode = normalizeType(mode);

    document.querySelectorAll(".mode-option").forEach((button) => {
      const active = button.dataset.mode === state.mode;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    $("modalTitle").textContent =
      state.editingPostId
        ? "Edit your post"
        : state.mode === "offer"
          ? "Share an offer"
          : "Make a request";

    $("submitPost").innerHTML =
      (state.editingPostId
        ? "Save changes"
        : state.mode === "offer"
          ? "Publish offer"
          : "Publish request") + " <span>→</span>";
  }

  function openPostModal(mode = "offer", post = null) {
    const form = $("postForm");

    form.reset();

    state.editingPostId = post ? String(post.id) : null;

    setPostMode(post ? post.type : mode);

    if (post) {
      $("postTitle").value = post.title;
      $("postDescription").value = post.description;
      $("postCategory").value = post.category;
      $("postLocation").value = post.location;
      $("postImage").value = post.imageUrl;

      if (post.availableUntil) {
        const date = new Date(post.availableUntil);

        if (!Number.isNaN(date.getTime())) {
          const local = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
          );

          $("availableUntil").value =
            local.toISOString().slice(0, 16);
        }
      }
    }

    $("postModal").classList.remove("hidden");

    const aiComposer = $("aiComposer");
    const aiButton = $("generateWithAI");
    const aiUpgrade = $("aiUpgrade");
    if (aiComposer && aiButton && aiUpgrade) {
      const isPlus = Boolean(state.membership?.isPlus);
      aiButton.classList.toggle("hidden", !isPlus);
      aiUpgrade.classList.toggle("hidden", isPlus);
      $("aiPrompt").value = "";
    }

    $("postTitle").focus();
  }

  function closePostModal() {
    $("postModal").classList.add("hidden");

    state.editingPostId = null;
  }

  function getPostFormData() {
    const availableUntil = $("availableUntil").value;

    return {
      type: state.mode,
      title: $("postTitle").value.trim(),
      description: $("postDescription").value.trim(),
      category: $("postCategory").value,
      location: $("postLocation").value.trim(),
      imageUrl: $("postImage").value.trim(),
      availableUntil: availableUntil
        ? new Date(availableUntil).toISOString()
        : null
    };
  }

  async function handlePostSubmit(event) {
    event.preventDefault();

    const form = $("postForm");

    if (!form.reportValidity()) return;

    const button = $("submitPost");

    button.disabled = true;

    const postData = getPostFormData();

    try {
      if (state.editingPostId) {
        const existing = state.posts.find(
          (post) => post.id === state.editingPostId
        );

        if (!existing) {
          throw new Error("Post not found.");
        }

        const updated = {
          ...existing,
          ...postData
        };

        await updatePostAPI(existing.id, postData);

        state.posts = state.posts.map((post) =>
          post.id === existing.id ? updated : post
        );

        showToast("Post updated.");
      } else {
        const created = {
          id: createId(),
          ...postData,
          userId: "",
          username: state.profile.username,
          authorName: state.profile.name,
          createdAt: new Date().toISOString(),
          thanks: 0
        };

        const response = await createPostAPI(postData);

        const serverPost =
          response?.post ??
          response?.data ??
          response;

        if (
          serverPost &&
          typeof serverPost === "object" &&
          (serverPost.id || serverPost.post_id)
        ) {
          state.posts.unshift(normalizePost({
            ...created,
            ...serverPost
          }));
        } else {
          state.posts.unshift(created);
        }

        showToast("Post published.");
      }

      saveLocalPosts();

      closePostModal();

      state.page = 1;

      renderDashboard();
    } catch (error) {
      // Server-side validation and quota errors must never be shown as
      // successful local posts; keep the editor open so the user can respond.
      if (error.status && error.status < 500) {
        showToast(error.message);
        await loadMembership();
        return;
      }

      // Preserve the original offline fallback for genuine API/network failures.
      if (state.editingPostId) {
        state.posts = state.posts.map((post) =>
          post.id === state.editingPostId
            ? { ...post, ...postData }
            : post
        );

        showToast("Changes saved locally. " + error.message);
      } else {
        state.posts.unshift({
          id: createId(),
          ...postData,
          userId: "",
          username: state.profile.username,
          authorName: state.profile.name,
          createdAt: new Date().toISOString(),
          thanks: 0
        });

        showToast("Post saved locally. " + error.message);
      }

      saveLocalPosts();

      closePostModal();

      state.page = 1;

      renderDashboard();
    } finally {
      button.disabled = false;
    }
  }

  // --------------------------------------------------
  // Ownership and post actions
  // --------------------------------------------------

  function isOwnPost(post) {
    if (post.userId && state.profile.id) {
      return String(post.userId) === String(state.profile.id);
    }

    return post.username.toLowerCase() ===
      state.profile.username.toLowerCase();
  }

  function editPost(id) {
    const post = state.posts.find(
      (item) => item.id === String(id)
    );

    if (!post || !isOwnPost(post)) {
      showToast("You can only edit your own posts.");
      return;
    }

    openPostModal(post.type, post);
  }

  async function deletePost(id) {
    const post = state.posts.find(
      (item) => item.id === String(id)
    );

    if (!post || !isOwnPost(post)) {
      showToast("You can only delete your own posts.");
      return;
    }

    if (!window.confirm("Delete this post?")) return;

    try {
      await deletePostAPI(post.id);
    } catch (error) {
      console.warn("Post API delete failed:", error);
    }

    state.posts = state.posts.filter(
      (item) => item.id !== post.id
    );

    saveLocalPosts();

    renderDashboard();

    showToast("Post deleted.");
  }


async function messagePostOwner(postId) {
    // 1. Find the selected post.
    const post = state.posts.find(
        (item) => String(item.id) === String(postId)
    );

    if (!post) {
        showToast("Post not found.");
        return;
    }

    // 2. Prevent messaging your own post.
    if (isOwnPost(post)) {
        showToast("This is your own post.");
        return;
    }

    // 3. Prepare the email subject.
    const subject = `Commonly - ${post.title}`;

    // 4. Prepare the email body.
    const body = [
        `Hi ${post.authorName || "there"},`,
        "",
        "I'm contacting you about your Commonly post:",
        "",
        `Title: ${post.title}`,
        `Type: ${post.type}`,
        `Category: ${post.category}`,
        post.location ? `Location: ${post.location}` : "",
        "",
        post.description || "",
        "",
        "I'd like to know more about this post.",
        "",
        "Thank you!"
    ]
        .filter(Boolean)
        .join("\n");

    // 5. Start with an empty recipient.
    let recipient = "";

    // 6. Try to retrieve the owner's email from the backend.
    try {
        const response = await fetch(
            `/api/posts/${encodeURIComponent(postId)}/contact`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                credentials: "same-origin"
            }
        );

        if (response.ok) {
            const data = await response.json();

            if (data.success && typeof data.ownerEmail === "string") {
                recipient = data.ownerEmail.trim();
            }
        }
    } catch (error) {
        console.error("Owner email lookup failed:", error);
    }

    // 7. Validate the recipient.
    const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

    // 8. Build the email compose URL.
    // If recipient is invalid, open Compose without a To address.
    const mailtoUrl =
        "mailto:" +
        (validEmail ? encodeURIComponent(recipient) : "") +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

    // 9. Open the configured email application.
    window.location.href = mailtoUrl;

    // 10. Notify the user.
    if (validEmail) {
        showToast("Opening email compose...");
    } else {
        showToast("Opening email compose. Enter the recipient's email.");
    }
}





  // --------------------------------------------------
  // Feed rendering
  // --------------------------------------------------

  function getFilteredPosts() {
    const search = state.search.toLowerCase();

    return state.posts.filter((post) => {
      const matchesType =
        state.type === "all" || post.type === state.type;

      const matchesCategory =
        state.category === "all" ||
        post.category === state.category;

      const searchable = [
        post.title,
        post.description,
        post.category,
        post.location,
        post.username
      ].join(" ").toLowerCase();

      const matchesSearch =
        !search || searchable.includes(search);

      const matchesView =
        state.currentView === "offers"
          ? post.type === "offer"
          : state.currentView === "requests"
            ? post.type === "request"
            : state.currentView === "activity"
              ? isOwnPost(post)
              : true;

      return (
        matchesType &&
        matchesCategory &&
        matchesSearch &&
        matchesView
      );
    });
  }


function renderPostCard(post) {
    const own = isOwnPost(post);

    const typeLabel =
        post.type === "offer" ? "Offer" : "Request";

    const typeClass =
        post.type === "offer" ? "offer" : "request";

    const authorName = escapeHTML(post.authorName);
    const username = escapeHTML(
        String(post.username || "community").replace(/^@/, "")
    );

    const postTitle = escapeHTML(post.title);
    const description = escapeHTML(post.description)
        .replace(/\n/g, "<br>");

    const category = escapeHTML(post.category);

    const location = post.location
        ? `
            <span class="post-detail">
                <span class="post-detail-icon">⌖</span>
                ${escapeHTML(post.location)}
            </span>
        `
        : "";

    const expiration = post.availableUntil
        ? `
            <span class="post-detail">
                <span class="post-detail-icon">◷</span>
                Available until ${escapeHTML(
                    formatDate(post.availableUntil)
                )}
            </span>
        `
        : "";

    const image = post.imageUrl
        ? `
            <div class="community-post-image">
                <img
                    src="${escapeHTML(post.imageUrl)}"
                    alt="${postTitle}"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >
            </div>
        `
        : "";

    const actions = own
        ? `
            <div class="community-post-actions">
                <button
                    type="button"
                    class="post-edit-button"
                    data-action="edit"
                    data-id="${escapeHTML(post.id)}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="post-delete-button"
                    data-action="delete"
                    data-id="${escapeHTML(post.id)}"
                >
                    Delete
                </button>
            </div>
        `
        : `
            <button
                type="button"
                class="post-message-button"
                data-action="message"
                data-id="${escapeHTML(post.id)}"
            >
                Message
                <span>→</span>
            </button>
        `;

    return `
        <article
            class="community-post-card ${typeClass}"
            data-post-id="${escapeHTML(post.id)}"
        >

            <div class="community-post-content">

                <!-- AUTHOR FIRST -->

                <div class="community-post-author">

                    <span class="community-post-avatar">
                        ${escapeHTML(initials(post.authorName))}
                    </span>

                    <div class="community-post-author-info">

                        <strong>${authorName}</strong>

                        <span>@${username}</span>

                    </div>

                    <span class="community-post-type ${typeClass}">
                        ${typeLabel}
                    </span>

                </div>


                <!-- TITLE SECOND -->

                <div class="community-post-heading">

                    <span class="community-post-category">
                        ${category}
                    </span>

                    <h3>${postTitle}</h3>

                </div>


                <!-- DESCRIPTION THIRD -->

                <p class="community-post-description">
                    ${description}
                </p>


                <!-- OPTIONAL IMAGE -->

                ${image}


                <!-- LOCATION AND AVAILABILITY -->

                <div class="community-post-details">

                    ${location}

                    ${expiration}

                </div>


                <!-- ACTIONS -->

                <div class="community-post-footer">

                    ${actions}

                </div>

            </div>

        </article>
    `;
}



  function renderFeed() {
    const grid = $("feedGrid");

    if (!grid) return;

    const filtered = getFilteredPosts();

    const visible = filtered.slice(
      0,
      state.page * state.pageSize
    );

    if (!visible.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✦</div>
          <strong>No community posts found</strong>
          <p>Try another filter or create a post.</p>
        </div>
      `;
    } else {
      grid.innerHTML = visible.map(renderPostCard).join("");
    }
     $("feedCount").textContent =
      filtered.length === 0
        ? "No posts"
        : `${visible.length} of ${filtered.length} posts`;

    $("loadMore").classList.toggle(
      "hidden",
      visible.length >= filtered.length
    );

    $("offerStat").textContent = state.posts.filter(
      (post) => post.type === "offer"
    ).length;

    $("requestStat").textContent = state.posts.filter(
      (post) => post.type === "request"
    ).length;

    $("thanksStat").textContent = state.posts.reduce(
      (sum, post) => sum + Number(post.thanks || 0),
      0
    );
  }

  function renderDashboard() {
    renderFeed();
    renderProfile();
  }

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

function setView(view) {
  state.currentView = view;

  const labels = {
    home: "Home",
    explore: "Explore",
    offers: "Offers",
    requests: "Requests",
    activity: "My activity",
    profile: "Profile"
  };

  $("currentSection").textContent = labels[view] || "Home";

  document.querySelectorAll(".nav-item").forEach((button) => {
    const active = button.dataset.view === view;

    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });

  // Keep Profile's existing behavior.
  if (view === "profile") {
    openProfile();
    closeSidebar();
    return;
  }

  // Configure the feed for the selected navigation item.
  if (view === "offers") {
    state.type = "all";
    $("feedTitle").textContent = "Community offers";
  } else if (view === "requests") {
    state.type = "all";
    $("feedTitle").textContent = "Open requests";
  } else if (view === "activity") {
    $("feedTitle").textContent = "Your activity";
  } else if (view === "explore") {
    $("feedTitle").textContent = "Explore your community";
  } else {
    $("feedTitle").textContent = "Around your community";
  }

  state.page = 1;

  // Close the mobile sidebar before scrolling.
  closeSidebar();

  // Render the selected feed.
  renderFeed();

  // Smoothly move the viewport to the feed heading.
  const feedHeading = $("feedTitle");

  if (feedHeading) {
    requestAnimationFrame(() => {
      feedHeading.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
}



function openSidebar() {
  const sidebar = $("sidebar");
  const menu = $("mobileMenu");

  sidebar.classList.add("open");

  menu.setAttribute("aria-expanded", "true");
  menu.setAttribute("aria-label", "Close navigation");
}

function closeSidebar() {
  const sidebar = $("sidebar");
  const menu = $("mobileMenu");

  sidebar.classList.remove("open");

  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
}

function toggleSidebar() {
  $("sidebar").classList.contains("open")
    ? closeSidebar()
    : openSidebar();
}


  // --------------------------------------------------
  // Event handlers
  // --------------------------------------------------

  function bindEvents() {
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        setView(button.dataset.view);
      });
    });

    $("sidebarProfile").addEventListener("click", openProfile);
    $("topProfile").addEventListener("click", openProfile);

    $("mobileMenu").addEventListener("click", toggleSidebar);

    $("quickOffer").addEventListener("click", () => {
      openPostModal("offer");
    });

    $("quickRequest").addEventListener("click", () => {
      openPostModal("request");
    });

    $("openPlus").addEventListener("click", openPlusModal);
    $("closePlus").addEventListener("click", () => $("plusModal").classList.add("hidden"));
    $("generateWithAI").addEventListener("click", generatePostWithAI);
    $("aiUpgrade").addEventListener("click", openPlusModal);

    document.querySelectorAll(".mode-option").forEach((button) => {
      button.addEventListener("click", () => {
        setPostMode(button.dataset.mode);
      });
    });

    $("postForm").addEventListener("submit", handlePostSubmit);

    $("closeModal").addEventListener("click", closePostModal);
    $("cancelPost").addEventListener("click", closePostModal);

    $("closeProfile").addEventListener("click", closeProfile);
    $("cancelProfile").addEventListener("click", closeProfile);

    $("profileForm").addEventListener(
      "submit",
      handleProfileSubmit
    );
    $("searchInput").addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      state.page = 1;
      renderFeed();
    });

    $("categoryFilter").addEventListener("change", (event) => {
      state.category = event.target.value;
      state.page = 1;
      renderFeed();
    });

    document.querySelectorAll(".type-chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.type = button.dataset.type;

        document.querySelectorAll(".type-chip").forEach((chip) => {
          const active = chip === button;

         chip.classList.toggle("active", active);
          chip.setAttribute("aria-pressed", String(active));
        });

        state.page = 1;

        renderFeed();
      });
    });

    $("loadMore").addEventListener("click", () => {
      state.page += 1;
      renderFeed();
    });

    $("seeAll").addEventListener("click", () => {
      state.type = "all";
      state.category = "all";
      state.search = "";
      state.page = 1;

      $("searchInput").value = "";
      $("categoryFilter").value = "all";

     document.querySelectorAll(".type-chip").forEach((button) => {
        const active = button.dataset.type === "all";

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      setView("explore");
    });

    $("feedGrid").addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");

      if (!button) return;

      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === "edit") editPost(id);
      if (action === "delete") deletePost(id);
      if (action === "message") messagePostOwner(id);
    });

    // Close modals when clicking their backdrop.
    ["postModal", "profileModal", "plusModal"].forEach((id) => {
      $(id).addEventListener("click", (event) => {
        if (event.target !== $(id)) return;

        if (id === "postModal") closePostModal();
        if (id === "profileModal") closeProfile();
        if (id === "plusModal") $("plusModal").classList.add("hidden");
      });
    });

    // Escape closes modals and mobile navigation.
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      closePostModal();
      closeProfile();
      $("plusModal").classList.add("hidden");
      closeSidebar();
    });
  }
  // --------------------------------------------------
  // Initialization
  // --------------------------------------------------

  async function init() {
    state.posts = readLocalPosts();
    state.profile = readLocalProfile();

    bindEvents();

    renderDashboard();

    await Promise.allSettled([
      loadPosts(),
      loadProfile(),
      loadMembership()
    ]);

    renderDashboard();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
